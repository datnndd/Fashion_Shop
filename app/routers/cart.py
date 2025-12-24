from datetime import datetime, timezone
import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.db.session import get_session
from app.deps import get_current_user
from app.models.orders import Cart, CartItem, Order, OrderItem
from app.models.catalog import ProductVariant, Product
from app.models.location import ShippingAddress
from app.models.marketing import Discount
from app.schemas.cart import CartRead, CartItemCreate, CartItemUpdate
from app.schemas.order import CheckoutRequest, OrderRead
from app.schemas.marketing import DiscountRead

router = APIRouter(prefix="/cart", tags=["cart"])


async def _get_or_create_cart(session: AsyncSession, user_id: int) -> Cart:
    """Fetch cart for user or create a new one."""
    stmt = select(Cart).where(Cart.user_id == user_id)
    result = await session.execute(stmt)
    cart = result.scalar_one_or_none()

    if not cart:
        cart = Cart(user_id=user_id, updated_at=func.now())
        session.add(cart)
        await session.commit()
        await session.refresh(cart)
    
    return cart


async def _build_cart_response(session: AsyncSession, cart: Cart) -> CartRead:
    """Load cart items with product info and compute totals."""
    # Eager load items with their product variants and products
    stmt = (
        select(CartItem)
        .options(
            joinedload(CartItem.product_variant).joinedload(ProductVariant.product)
        )
        .where(CartItem.cart_id == cart.cart_id)
        .order_by(CartItem.created_at.desc())
    )
    result = await session.execute(stmt)
    items = result.scalars().all()

    cart_items_data = []
    subtotal = 0.0

    for item in items:
        # Safeguard if product variant was deleted but cart item remains
        if not item.product_variant or not item.product_variant.product:
            continue

        variant = item.product_variant
        product = variant.product

        # Verify pricing logic: base_price + variant_price
        base_price = float(product.base_price or 0)
        extra_price = float(variant.price or 0)
        total_price = base_price + extra_price

        discount_percent = product.discount_percent or 0
        sale_price = None
        if discount_percent > 0:
            sale_price = total_price * (1 - discount_percent / 100)

        unit_price = sale_price if sale_price is not None else total_price

        available_stock = variant.stock

        
        # Logic to determine purchasable quantity and availability
        purchasable_qty = item.quantity
        if available_stock is not None:
            safe_stock = max(available_stock, 0)
            purchasable_qty = min(item.quantity, safe_stock)
        
        # Calculate line total based on purchasable quantity
        line_total = unit_price * purchasable_qty
        subtotal += line_total

        variant_images = variant.images if isinstance(variant.images, list) else []
        variant_thumbnail = variant_images[0] if variant_images else product.thumbnail

        cart_items_data.append({
            "cart_item_id": item.cart_item_id,
            "product_variant_id": item.product_variant_id,
            "quantity": item.quantity,
            "variant_attributes": variant.attributes,
            "variant_images": variant_images,
            "variant_thumbnail": variant_thumbnail,
            "available_stock": available_stock,
            "purchasable_quantity": purchasable_qty,
            "is_available": available_stock is None or available_stock > 0,
            "unit_price": unit_price,
            "line_total": line_total,
            "product": {
                "product_id": product.product_id,
                "name": product.name,
                "thumbnail": product.thumbnail,
                "price": total_price,
                "discount_percent": discount_percent,
                "sale_price": sale_price,
            }
        })

    # Update or fetch updated_at if needed (optional since we have cart obj)
    # The Cart object might be detached or specific field needed? 
    # CartRead expects updated_at.
    
    return CartRead(
        cart_id=cart.cart_id,
        updated_at=cart.updated_at,
        items=cart_items_data,
        subtotal=round(subtotal, 2),
    )


def _calculate_unit_price(product: Product, variant: ProductVariant) -> float:
    """Calculate effective unit price with product discount applied."""
    base_price = float(product.base_price or 0)
    extra_price = float(variant.price or 0)
    unit_price = base_price + extra_price
    discount_percent = product.discount_percent or 0
    if discount_percent > 0:
        unit_price = unit_price * (1 - discount_percent / 100)
    return round(unit_price, 2)


def _generate_order_code() -> str:
    """Generate a human-friendly order code."""
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    return f"ORD-{timestamp}-{random.randint(1000, 9999)}"


async def _collect_checkout_items(
    session: AsyncSession,
    cart: Cart,
    cart_item_ids: list[int] | None = None,
) -> tuple[list[dict], float]:
    """
    Gather cart items to checkout, applying availability validations and computing subtotal.
    Returns a tuple of (payload for order items, subtotal).
    """
    stmt = (
        select(CartItem)
        .options(joinedload(CartItem.product_variant).joinedload(ProductVariant.product))
        .where(CartItem.cart_id == cart.cart_id)
    )
    if cart_item_ids is not None:
        if len(cart_item_ids) == 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No cart items selected for checkout")
        stmt = stmt.where(CartItem.cart_item_id.in_(cart_item_ids))

    result = await session.execute(stmt)
    cart_items = result.scalars().all()
    if not cart_items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No cart items available for checkout")

    order_items_payload: list[dict] = []
    subtotal = 0.0

    for item in cart_items:
        variant = item.product_variant
        product = variant.product if variant else None

        if not variant or not product:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A cart item is no longer available")
        if not variant.is_active or not product.is_published:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{product.name} is not available for purchase")

        if variant.stock is not None:
            available = max(variant.stock, 0)
            if available <= 0 or item.quantity > available:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Not enough stock for {product.name}")

        unit_price = _calculate_unit_price(product, variant)
        line_total = unit_price * item.quantity
        subtotal += line_total

        order_items_payload.append(
            {
                "cart_item": item,
                "variant": variant,
                "product": product,
                "unit_price": unit_price,
                "line_total": line_total,
            }
        )

    return order_items_payload, subtotal


class DiscountValidationRequest(BaseModel):
    discount_code: str
    cart_item_ids: list[int] | None = None


class DiscountValidationResponse(BaseModel):
    discount: DiscountRead | None = None
    discount_amount: float = 0.0


@router.get("", response_model=CartRead)
async def get_my_cart(
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
) -> CartRead:
    """
    Get current user's cart with items.
    """
    cart = await _get_or_create_cart(session, current_user["user_id"])
    return await _build_cart_response(session, cart)


@router.post("/items", response_model=CartRead, status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    payload: CartItemCreate,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
) -> CartRead:
    """
    Add a product variant to the cart (or increase quantity if it already exists).
    _get_or_create_cart(session, current_user["user_id"])
    """
    cart = await _get_or_create_cart(session, current_user["user_id"])

    # Validate variant exists and is active using ORM
    """
    
    select(ProductVariant)
        .options(joinedload(ProductVariant.product))
        .where(ProductVariant.variant_id == payload.product_variant_id)

    result = await session.execute(stmt)
    variant = result.scalar_one_or_none()
    """
    stmt = (
        select(ProductVariant)
        .options(joinedload(ProductVariant.product))
        .where(ProductVariant.variant_id == payload.product_variant_id)
    )
    result = await session.execute(stmt)
    variant = result.scalar_one_or_none()

    #HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product variant not found")
    if not variant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product variant not found")
    
    if not variant.is_active or not variant.product.is_published:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Product variant is not available")
    
    if variant.stock is not None and payload.quantity > variant.stock:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not enough stock for this product")

    # Check if item already in cart
    
    stmt_item = select(CartItem).where(
        CartItem.cart_id == cart.cart_id,
        CartItem.product_variant_id == payload.product_variant_id
    )
    existing_item = (await session.execute(stmt_item)).scalar_one_or_none()

    if existing_item:
        new_qty = existing_item.quantity + payload.quantity
        if variant.stock is not None and new_qty > variant.stock:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not enough stock for this product")
        
        existing_item.quantity = new_qty
        # session.add(existing_item) # Not strictly needed if attached, but good for clarity
    else:
        new_item = CartItem(
            cart_id=cart.cart_id,
            product_variant_id=payload.product_variant_id,
            quantity=payload.quantity,
            created_at=func.now()
        )
        session.add(new_item)

    # Update cart timestamp
    cart.updated_at = func.now()
    session.add(cart)
    
    await session.commit()
    await session.refresh(cart)
    return await _build_cart_response(session, cart)


@router.patch("/items/{cart_item_id}", response_model=CartRead)
async def update_cart_item(
    cart_item_id: int,
    payload: CartItemUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
) -> CartRead:
    """
    Update quantity for a cart item belonging to the current user.
    """
    # Fetch Item and ensure it belongs to user's cart
    stmt = (
        select(CartItem)
        .join(Cart)
        .where(
            CartItem.cart_item_id == cart_item_id,
            Cart.user_id == current_user["user_id"]
        )
        .options(joinedload(CartItem.product_variant), joinedload(CartItem.cart))
    )
    result = await session.execute(stmt)
    cart_item = result.scalar_one_or_none()

    if not cart_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    variant = cart_item.product_variant
    
    if variant and variant.stock is not None:
        if variant.stock <= 0 or payload.quantity > variant.stock:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not enough stock for this product")

    cart_item.quantity = payload.quantity
    cart_item.cart.updated_at = func.now()
    
    await session.commit()
    await session.refresh(cart_item.cart)
    
    return await _build_cart_response(session, cart_item.cart)


@router.delete("/items/{cart_item_id}", response_model=CartRead)
async def remove_cart_item(
    cart_item_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
) -> CartRead:
    """
    Remove a cart item belonging to the current user.
    """
    stmt = (
        select(CartItem)
        .join(Cart)
        .where(
            CartItem.cart_item_id == cart_item_id,
            Cart.user_id == current_user["user_id"]
        )
        .options(joinedload(CartItem.cart))
    )
    result = await session.execute(stmt)
    cart_item = result.scalar_one_or_none()

    if not cart_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    cart = cart_item.cart
    await session.delete(cart_item)
    
    cart.updated_at = func.now()
    session.add(cart)
    
    await session.commit()
    await session.refresh(cart)

    return await _build_cart_response(session, cart)


@router.post("/checkout", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
async def checkout_cart(
    payload: CheckoutRequest,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
) -> OrderRead:
    """
    Convert the current cart (or selected items) into an order for the logged-in user.
    """
    cart = await _get_or_create_cart(session, current_user["user_id"])

    # Validate shipping address belongs to user
    sa_stmt = select(ShippingAddress).where(
        ShippingAddress.shipping_address_id == payload.shipping_address_id,
        ShippingAddress.user_id == current_user["user_id"],
    )
    shipping_address = (await session.execute(sa_stmt)).scalar_one_or_none()
    if not shipping_address:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid shipping address")

    # Gather cart items (optionally filtered)
    order_items_payload, subtotal = await _collect_checkout_items(session, cart, payload.cart_item_ids)

    # Apply discount if provided
    discount_id: int | None = None
    discount_amount = 0.0
    if payload.discount_code:
        code = payload.discount_code.strip()
        if code:
            discount_result = await session.execute(
                select(Discount).where(func.lower(Discount.code) == code.lower())
            )
            discount = discount_result.scalar_one_or_none()
            if not discount:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid discount code")

            now = datetime.utcnow()
            start_date = discount.start_date
            end_date = discount.end_date
            if start_date and start_date.tzinfo:
                start_date = start_date.replace(tzinfo=None)
            if end_date and end_date.tzinfo:
                end_date = end_date.replace(tzinfo=None)

            if discount.is_active is False:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Discount is not active")
            if start_date and start_date > now:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Discount not started yet")
            if end_date and end_date < now:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Discount has expired")
            if discount.usage_limit is not None and (discount.used_count or 0) >= discount.usage_limit:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Discount usage limit reached")
            if discount.min_order_value is not None and subtotal < float(discount.min_order_value):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order total does not meet discount minimum")

            if discount.type == "percentage":
                discount_amount = subtotal * float(discount.value) / 100
                if discount.max_discount_amount is not None:
                    discount_amount = min(discount_amount, float(discount.max_discount_amount))
            elif discount.type == "fixed":
                discount_amount = float(discount.value)

            discount_amount = min(discount_amount, subtotal)
            discount_id = discount.discount_id
            discount.used_count = (discount.used_count or 0) + 1
            session.add(discount)

    shipping_fee = payload.shipping_fee or 0
    if shipping_fee < 0:
        shipping_fee = 0

    total_price = max(subtotal - discount_amount + shipping_fee, 0)

    new_order = Order(
        code=_generate_order_code(),
        user_id=current_user["user_id"],
        shipping_address_id=payload.shipping_address_id,
        discount_id=discount_id,
        subtotal=subtotal,
        discount_amount=discount_amount,
        total_price=total_price,
        payment_method=payload.payment_method,
        payment_status="unpaid",
        status="pending",
        note=payload.note,
    )
    session.add(new_order)
    await session.flush()

    for data in order_items_payload:
        session.add(
            OrderItem(
                order_id=new_order.order_id,
                product_variant_id=data["variant"].variant_id,
                product_name=data["product"].name,
                variant_attributes_snapshot=data["variant"].attributes,
                quantity=data["cart_item"].quantity,
                unit_price=data["unit_price"],
                total_price=data["line_total"],
            )
        )

        if data["variant"].stock is not None:
            data["variant"].stock = max(data["variant"].stock - data["cart_item"].quantity, 0)
            session.add(data["variant"])

        await session.delete(data["cart_item"])

    cart.updated_at = func.now()
    session.add(cart)
    await session.commit()

    # Reload with relationships for response model
    order_result = await session.execute(
        select(Order)
        .options(joinedload(Order.items), joinedload(Order.shipping_address))
        .where(Order.order_id == new_order.order_id)
    )
    order_obj = order_result.unique().scalar_one()
    return order_obj


@router.post("/validate-discount", response_model=DiscountValidationResponse)
async def validate_discount(
    payload: DiscountValidationRequest,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
) -> DiscountValidationResponse:
    """
    Validate a discount code against the current cart without creating an order.
    """
    cart = await _get_or_create_cart(session, current_user["user_id"])
    _, subtotal = await _collect_checkout_items(session, cart, payload.cart_item_ids)

    code = payload.discount_code.strip()
    if not code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Discount code is required")

    discount_result = await session.execute(select(Discount).where(func.lower(Discount.code) == code.lower()))
    discount = discount_result.scalar_one_or_none()
    if not discount:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid discount code")

    now = datetime.utcnow()
    start_date = discount.start_date
    end_date = discount.end_date
    if start_date and start_date.tzinfo:
        start_date = start_date.replace(tzinfo=None)
    if end_date and end_date.tzinfo:
        end_date = end_date.replace(tzinfo=None)

    if discount.is_active is False:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Discount is not active")
    if start_date and start_date > now:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Discount not started yet")
    if end_date and end_date < now:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Discount has expired")
    if discount.usage_limit is not None and (discount.used_count or 0) >= discount.usage_limit:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Discount usage limit reached")
    if discount.min_order_value is not None and subtotal < float(discount.min_order_value):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order total does not meet discount minimum")

    discount_amount = 0.0
    if discount.type == "percentage":
        discount_amount = subtotal * float(discount.value) / 100
        if discount.max_discount_amount is not None:
            discount_amount = min(discount_amount, float(discount.max_discount_amount))
    elif discount.type == "fixed":
        discount_amount = float(discount.value)
    discount_amount = min(discount_amount, subtotal)

    return DiscountValidationResponse(
        discount=DiscountRead.model_validate(discount),
        discount_amount=discount_amount,
    )
