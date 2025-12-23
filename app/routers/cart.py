from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.deps import get_current_user
from app.schemas.cart import CartRead, CartItemCreate, CartItemUpdate

router = APIRouter(prefix="/cart", tags=["cart"])


async def _get_or_create_cart(session: AsyncSession, user_id: int) -> dict:
    """Fetch cart for user or create a new one."""
    result = await session.execute(
        text("SELECT * FROM carts WHERE user_id = :user_id"),
        {"user_id": user_id},
    )
    cart = result.mappings().one_or_none()
    if cart:
        return dict(cart)

    insert_result = await session.execute(
        text("INSERT INTO carts (user_id, updated_at) VALUES (:user_id, NOW()) RETURNING *"),
        {"user_id": user_id},
    )
    cart = insert_result.mappings().one()
    await session.commit()
    return dict(cart)


async def _build_cart_response(session: AsyncSession, cart: dict) -> CartRead:
    """Load cart items with product info and compute totals."""
    items_result = await session.execute(
        text(
            """
            SELECT 
                ci.cart_item_id,
                ci.quantity,
                ci.product_variant_id,
                pv.attributes AS variant_attributes,
                pv.price AS variant_price,
                p.product_id,
                p.name AS product_name,
                p.thumbnail,
                p.discount_percent
            FROM cart_items ci
            JOIN product_variants pv ON ci.product_variant_id = pv.variant_id
            JOIN products p ON pv.product_id = p.product_id
            WHERE ci.cart_id = :cart_id
            ORDER BY ci.created_at DESC
            """
        ),
        {"cart_id": cart["cart_id"]},
    )

    items = []
    subtotal = 0.0

    for row in items_result.mappings().all():
        discount_percent = row["discount_percent"] or 0
        variant_price = float(row["variant_price"])
        sale_price = variant_price * (1 - discount_percent / 100) if discount_percent else None
        unit_price = sale_price if sale_price is not None else variant_price
        line_total = unit_price * row["quantity"]
        subtotal += line_total

        items.append(
            {
                "cart_item_id": row["cart_item_id"],
                "product_variant_id": row["product_variant_id"],
                "quantity": row["quantity"],
                "variant_attributes": row["variant_attributes"],
                "unit_price": unit_price,
                "line_total": line_total,
                "product": {
                    "product_id": row["product_id"],
                    "name": row["product_name"],
                    "thumbnail": row["thumbnail"],
                    "price": variant_price,
                    "discount_percent": discount_percent,
                    "sale_price": sale_price,
                },
            }
        )

    # Refresh updated_at in case caller didn't supply it
    updated_at = cart.get("updated_at")
    if updated_at is None:
        updated_result = await session.execute(
            text("SELECT updated_at FROM carts WHERE cart_id = :cart_id"),
            {"cart_id": cart["cart_id"]},
        )
        updated_row = updated_result.mappings().one_or_none()
        updated_at = updated_row["updated_at"] if updated_row else None

    return CartRead(
        cart_id=cart["cart_id"],
        updated_at=updated_at,
        items=items,
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

    # Validate variant exists and is active
    variant_result = await session.execute(
        text(
            """
            SELECT pv.variant_id, pv.price, pv.is_active, p.is_published
            FROM product_variants pv
            JOIN products p ON pv.product_id = p.product_id
            WHERE pv.variant_id = :variant_id
            """
        ),
        {"variant_id": payload.product_variant_id},
    )
    variant = variant_result.mappings().one_or_none()
    if not variant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product variant not found")
    if not variant["is_active"] or not variant["is_published"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Product variant is not available")

    # Check if item already in cart
    existing_result = await session.execute(
        text(
            """
            SELECT cart_item_id, quantity FROM cart_items
            WHERE cart_id = :cart_id AND product_variant_id = :variant_id
            """
        ),
        {"cart_id": cart["cart_id"], "variant_id": payload.product_variant_id},
    )
    existing = existing_result.mappings().one_or_none()

    if existing:
        new_qty = existing["quantity"] + payload.quantity
        await session.execute(
            text("UPDATE cart_items SET quantity = :quantity WHERE cart_item_id = :cart_item_id"),
            {"quantity": new_qty, "cart_item_id": existing["cart_item_id"]},
        )
    else:
        await session.execute(
            text(
                """
                INSERT INTO cart_items (cart_id, product_variant_id, quantity, created_at)
                VALUES (:cart_id, :variant_id, :quantity, NOW())
                """
            ),
            {
                "cart_id": cart["cart_id"],
                "variant_id": payload.product_variant_id,
                "quantity": payload.quantity,
            },
        )

    await session.execute(
        text("UPDATE carts SET updated_at = NOW() WHERE cart_id = :cart_id"),
        {"cart_id": cart["cart_id"]},
    )
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
    item_result = await session.execute(
        text(
            """
            SELECT ci.cart_id
            FROM cart_items ci
            JOIN carts c ON ci.cart_id = c.cart_id
            WHERE ci.cart_item_id = :cart_item_id AND c.user_id = :user_id
            """
        ),
        {"cart_item_id": cart_item_id, "user_id": current_user["user_id"]},
    )
    item = item_result.mappings().one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    await session.execute(
        text("UPDATE cart_items SET quantity = :quantity WHERE cart_item_id = :cart_item_id"),
        {"quantity": payload.quantity, "cart_item_id": cart_item_id},
    )
    await session.execute(
        text("UPDATE carts SET updated_at = NOW() WHERE cart_id = :cart_id"),
        {"cart_id": item["cart_id"]},
    )
    await session.commit()

    cart = {"cart_id": item["cart_id"], "updated_at": None}
    return await _build_cart_response(session, cart)


@router.delete("/items/{cart_item_id}", response_model=CartRead)
async def remove_cart_item(
    cart_item_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
) -> CartRead:
    """
    Remove a cart item belonging to the current user.
    """
    item_result = await session.execute(
        text(
            """
            SELECT ci.cart_id
            FROM cart_items ci
            JOIN carts c ON ci.cart_id = c.cart_id
            WHERE ci.cart_item_id = :cart_item_id AND c.user_id = :user_id
            """
        ),
        {"cart_item_id": cart_item_id, "user_id": current_user["user_id"]},
    )
    item = item_result.mappings().one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    await session.execute(
        text("DELETE FROM cart_items WHERE cart_item_id = :cart_item_id"),
        {"cart_item_id": cart_item_id},
    )
    await session.execute(
        text("UPDATE carts SET updated_at = NOW() WHERE cart_id = :cart_id"),
        {"cart_id": item["cart_id"]},
    )
    await session.commit()

    cart = {"cart_id": item["cart_id"], "updated_at": None}
    return await _build_cart_response(session, cart)
