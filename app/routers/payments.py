from fastapi import APIRouter, Depends, HTTPException, status
import stripe
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.config import settings
from app.db.session import get_session
from app.deps import get_current_user
from app.models.orders import Cart, CartItem
from app.models.catalog import ProductVariant
from app.models.marketing import Discount

stripe.api_key = settings.stripe_secret_key

router = APIRouter(prefix="/payments", tags=["payments"])

class CreateIntentRequest(BaseModel):
    shipping_address_id: int
    shipping_method: str = "standard" # standard 30k, express 50k
    discount_code: str | None = None
    note: str | None = None
    cart_item_ids: list[int] | None = None

class CreateIntentResponse(BaseModel):
    client_secret: str
    publishable_key: str = "pk_test_PLACEHOLDER" # Should be in env/settings too but simplified here
    amount: int
    currency: str

SHIPPING_OPTIONS = {
    "standard": 30000,
    "express": 50000
}

@router.post("/create-payment-intent", response_model=CreateIntentResponse)
async def create_payment_intent(
    payload: CreateIntentRequest,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
):
    """
    Create a Stripe PaymentIntent for the current cart.
    """
    # 1. Fetch Cart
    stmt = select(Cart).where(Cart.user_id == current_user["user_id"])
    cart = (await session.execute(stmt)).scalar_one_or_none()
    
    if not cart:
        raise HTTPException(status_code=400, detail="Cart not found")

    # 2. Get Cart Items
    item_stmt = (
        select(CartItem)
        .options(joinedload(CartItem.product_variant).joinedload(ProductVariant.product))
        .where(CartItem.cart_id == cart.cart_id)
    )
    if payload.cart_item_ids:
        if len(payload.cart_item_ids) == 0:
             raise HTTPException(status_code=400, detail="No items selected")
        item_stmt = item_stmt.where(CartItem.cart_item_id.in_(payload.cart_item_ids))
    
    result = await session.execute(item_stmt)
    cart_items = result.scalars().all()

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # 3. Calculate Subtotal
    subtotal = 0.0
    for item in cart_items:
        variant = item.product_variant
        product = variant.product
        
        # Validation
        if not variant.is_active or not product.is_published:
             raise HTTPException(status_code=400, detail=f"Item {product.name} is not available")
             
        # Price Calculation
        base_price = float(product.base_price or 0)
        extra_price = float(variant.price or 0)
        unit_price = base_price + extra_price
        
        if product.discount_percent and product.discount_percent > 0:
            unit_price = unit_price * (1 - product.discount_percent / 100)
            
        subtotal += unit_price * item.quantity

    # 4. Apply Discount
    discount_amount = 0.0
    if payload.discount_code:
        code = payload.discount_code.strip()
        if code:
            discount_result = await session.execute(
                select(Discount).where(func.lower(Discount.code) == code.lower())
            )
            discount = discount_result.scalar_one_or_none()
            if discount and discount.is_active:
                # Add more validation dates/limits here as in checkout
                if discount.type == "percentage":
                    discount_amount = subtotal * float(discount.value) / 100
                    if discount.max_discount_amount:
                        discount_amount = min(discount_amount, float(discount.max_discount_amount))
                elif discount.type == "fixed":
                    discount_amount = float(discount.value)
                discount_amount = min(discount_amount, subtotal)

    # 5. Add Shipping
    shipping_fee = SHIPPING_OPTIONS.get(payload.shipping_method, 30000)
    
    # 6. Total
    total = max(subtotal - discount_amount + shipping_fee, 0)
    amount_int = int(total) # VND is usually integer, smallest unit 1 VND or Stripe might treat as cents for other currencies but VND is 0-decimal currency in Stripe usually.
    # WAIT: Stripe VND is a zero-decimal currency? Or just normal integer? 
    # Stripe docs: VND is not a zero-decimal currency, BUT 1 unit is 1 VND? 
    # Actually Stripe documentation says: VND is a zero-decimal currency? 
    # Let's check: https://stripe.com/docs/currencies#zero-decimal
    # VND is listed as a zero-decimal currency. So 50000 VND -> amount=50000.
    
    try:
        intent = stripe.PaymentIntent.create(
            amount=amount_int,
            currency="vnd",
            automatic_payment_methods={"enabled": True},
            metadata={
                "user_id": current_user["user_id"],
                "shipping_address_id": payload.shipping_address_id,
                "order_code": f"TEMP-{current_user['user_id']}", # Can be updated via webhook
            }
        )
        return CreateIntentResponse(
            client_secret=intent.client_secret,
            amount=amount_int,
            currency="vnd"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
