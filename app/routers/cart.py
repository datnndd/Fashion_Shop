from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.deps import get_current_user
from app.models.orders import Cart, CartItem
from app.models.catalog import ProductVariant, Product
from app.schemas.cart import CartRead, CartItemCreate, CartItemUpdate

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

        # Stock logic
        available_stock = variant.stock
        # available_stock = 777 # DEBUG: Force value to check if server updates

        
        # Logic to determine purchasable quantity and availability
        purchasable_qty = item.quantity
        if available_stock is not None:
            safe_stock = max(available_stock, 0)
            purchasable_qty = min(item.quantity, safe_stock)
        
        # Calculate line total based on purchasable quantity
        line_total = unit_price * purchasable_qty
        subtotal += line_total

        cart_items_data.append({
            "cart_item_id": item.cart_item_id,
            "product_variant_id": item.product_variant_id,
            "quantity": item.quantity,
            "variant_attributes": variant.attributes,
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
    """
    cart = await _get_or_create_cart(session, current_user["user_id"])

    # Validate variant exists and is active using ORM
    stmt = (
        select(ProductVariant)
        .options(joinedload(ProductVariant.product))
        .where(ProductVariant.variant_id == payload.product_variant_id)
    )
    result = await session.execute(stmt)
    variant = result.scalar_one_or_none()

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

    return await _build_cart_response(session, cart)
