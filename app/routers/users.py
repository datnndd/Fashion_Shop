from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.deps import get_current_user, get_admin_user
from app.schemas.user import UserCreate, UserRead, UserRoleUpdate, UserListResponse, AdminUserCreate, UserUpdate, PasswordChange
from app.schemas.order import OrderRead
from app.utils.security import hash_password, verify_password

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(payload: UserCreate, session: AsyncSession = Depends(get_session)) -> UserRead:
    """
    Create a new user.
    
    SQL Queries:
        SELECT * FROM users WHERE email = :email
        INSERT INTO users (...) VALUES (...) RETURNING *
    """
    # Check if email exists
    result = await session.execute(
        text("SELECT * FROM users WHERE email = :email"),
        {"email": payload.email}
    )
    existing = result.mappings().one_or_none()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # Insert new user
    result = await session.execute(
        text("""
            INSERT INTO users (name, email, password_hash, phone, gender, dob, role, is_active, created_at)
            VALUES (:name, :email, :password_hash, :phone, :gender, :dob, 'customer', true, NOW())
            RETURNING *
        """),
        {
            "name": payload.name,
            "email": payload.email,
            "password_hash": hash_password(payload.password),
            "phone": payload.phone,
            "gender": payload.gender,
            "dob": payload.dob,
        }
    )
    user = result.mappings().one()
    await session.commit()
    return dict(user)


@router.post("/admin", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def admin_create_user(
    payload: AdminUserCreate,
    session: AsyncSession = Depends(get_session),
    admin: dict = Depends(get_admin_user),
) -> UserRead:
    """
    Admin endpoint to create users with specific roles.
    
    SQL: INSERT INTO users (...) VALUES (...) RETURNING *
    """
    # Check if email exists
    result = await session.execute(
        text("SELECT * FROM users WHERE email = :email"),
        {"email": payload.email}
    )
    existing = result.mappings().one_or_none()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # Insert new user with custom role
    result = await session.execute(
        text("""
            INSERT INTO users (name, email, password_hash, phone, gender, dob, role, is_active, created_at)
            VALUES (:name, :email, :password_hash, :phone, :gender, :dob, :role, true, NOW())
            RETURNING *
        """),
        {
            "name": payload.name,
            "email": payload.email,
            "password_hash": hash_password(payload.password),
            "phone": payload.phone,
            "gender": payload.gender,
            "dob": payload.dob,
            "role": payload.role,
        }
    )
    user = result.mappings().one()
    await session.commit()
    return dict(user)


@router.get("/me", response_model=UserRead)
async def read_users_me(current_user: dict = Depends(get_current_user)) -> UserRead:
    """Get current user profile."""
    return current_user


@router.patch("/me", response_model=UserRead)
async def update_my_profile(
    payload: UserUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
) -> UserRead:
    """
    Update current user's profile.
    
    SQL: UPDATE users SET ... WHERE user_id = :user_id RETURNING *
    """
    # Build dynamic update query
    updates = []
    params = {"user_id": current_user["user_id"]}
    
    if payload.name is not None:
        updates.append("name = :name")
        params["name"] = payload.name
    if payload.phone is not None:
        updates.append("phone = :phone")
        params["phone"] = payload.phone
    if payload.gender is not None:
        updates.append("gender = :gender")
        params["gender"] = payload.gender
    if payload.dob is not None:
        updates.append("dob = :dob")
        params["dob"] = payload.dob
        
    # Address updates
    if payload.province_id is not None:
        updates.append("province_id = :province_id")
        params["province_id"] = payload.province_id
    if payload.ward_id is not None:
        updates.append("ward_id = :ward_id")
        params["ward_id"] = payload.ward_id
    if payload.street is not None:
        updates.append("street = :street")
        params["street"] = payload.street
    if payload.full_address is not None:
        updates.append("full_address = :full_address")
        params["full_address"] = payload.full_address
    
    updates.append("updated_at = NOW()")
    
    query = f"UPDATE users SET {', '.join(updates)} WHERE user_id = :user_id RETURNING *"
    result = await session.execute(text(query), params)
    user = result.mappings().one()
    await session.commit()
    return dict(user)


@router.post("/me/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    payload: PasswordChange,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
):
    """
    Change current user's password.
    
    SQL: UPDATE users SET password_hash = :password_hash WHERE user_id = :user_id
    """
    if not verify_password(payload.current_password, current_user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    await session.execute(
        text("UPDATE users SET password_hash = :password_hash, updated_at = NOW() WHERE user_id = :user_id"),
        {"password_hash": hash_password(payload.new_password), "user_id": current_user["user_id"]}
    )
    await session.commit()
    return {"message": "Password changed successfully"}


@router.get("/me/orders", response_model=list[OrderRead])
async def get_my_orders(
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
) -> list[OrderRead]:
    """
    Get current user's orders with items.
    
    SQL: SELECT * FROM orders WHERE user_id = :user_id ORDER BY created_at DESC
         SELECT * FROM order_items WHERE order_id = :order_id
    """
    # Get orders
    orders_result = await session.execute(
        text("SELECT * FROM orders WHERE user_id = :user_id ORDER BY created_at DESC"),
        {"user_id": current_user["user_id"]}
    )
    orders = orders_result.mappings().all()
    
    # For each order, get items
    result = []
    for order in orders:
        items_result = await session.execute(
            text("SELECT * FROM order_items WHERE order_id = :order_id"),
            {"order_id": order["order_id"]}
        )
        items = [dict(item) for item in items_result.mappings().all()]
        order_dict = dict(order)
        order_dict["items"] = items
        
        # Get shipping address
        if order["shipping_address_id"]:
            sa_result = await session.execute(
                text("SELECT * FROM shipping_addresses WHERE shipping_address_id = :sa_id"),
                {"sa_id": order["shipping_address_id"]}
            )
            sa = sa_result.mappings().one_or_none()
            if sa:
                order_dict["shipping_address"] = dict(sa)
                
        result.append(order_dict)
    
    return result


@router.post("/me/orders/{order_id}/cancel", response_model=OrderRead)
async def cancel_my_order(
    order_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
) -> OrderRead:
    """
    Allow a customer to cancel their own pending order.
    """
    existing_result = await session.execute(
        text("SELECT * FROM orders WHERE order_id = :order_id AND user_id = :user_id"),
        {"order_id": order_id, "user_id": current_user["user_id"]},
    )
    existing = existing_result.mappings().one_or_none()
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if existing["status"] != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only pending orders can be cancelled")

    # Restock product variants for this order (only where stock is tracked)
    items_result = await session.execute(
        text(
            """
            SELECT oi.product_variant_id, oi.quantity, pv.stock
            FROM order_items oi
            LEFT JOIN product_variants pv ON pv.variant_id = oi.product_variant_id
            WHERE oi.order_id = :order_id
            """
        ),
        {"order_id": order_id},
    )
    for item in items_result.mappings().all():
        variant_id = item["product_variant_id"]
        stock = item["stock"]
        qty = item["quantity"]
        if variant_id is None or stock is None:
            continue
        await session.execute(
            text("UPDATE product_variants SET stock = :stock WHERE variant_id = :variant_id"),
            {"stock": max(stock + qty, 0), "variant_id": variant_id},
        )

    update_result = await session.execute(
        text("UPDATE orders SET status = :status, updated_at = NOW() WHERE order_id = :order_id RETURNING *"),
        {"status": "cancelled", "order_id": order_id},
    )
    order = dict(update_result.mappings().one())
    await session.commit()

    items_result = await session.execute(
        text("SELECT * FROM order_items WHERE order_id = :order_id"),
        {"order_id": order_id},
    )
    order["items"] = [dict(item) for item in items_result.mappings().all()]

    if order.get("shipping_address_id"):
        sa_result = await session.execute(
            text("SELECT * FROM shipping_addresses WHERE shipping_address_id = :sa_id"),
            {"sa_id": order["shipping_address_id"]},
        )
        sa = sa_result.mappings().one_or_none()
        if sa:
            order["shipping_address"] = dict(sa)

    return order


@router.get("/{user_id}", response_model=UserRead)
async def get_user(user_id: int, session: AsyncSession = Depends(get_session)) -> UserRead:
    """
    Get a user by ID.
    
    SQL: SELECT * FROM users WHERE user_id = :user_id
    """
    result = await session.execute(
        text("SELECT * FROM users WHERE user_id = :user_id"),
        {"user_id": user_id}
    )
    user = result.mappings().one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return dict(user)


@router.get("", response_model=UserListResponse)
async def list_users(
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0),
    role: str | None = Query(default=None),
    session: AsyncSession = Depends(get_session),
    admin: dict = Depends(get_admin_user),
) -> UserListResponse:
    """
    List all users. Manager only.
    
    SQL: SELECT * FROM users [WHERE role = :role] ORDER BY created_at DESC LIMIT :limit OFFSET :offset
         SELECT COUNT(*) FROM users [WHERE role = :role]
    """
    # Build query with optional role filter
    if role:
        query = text("""
            SELECT * FROM users WHERE role = :role 
            ORDER BY created_at DESC LIMIT :limit OFFSET :offset
        """)
        count_query = text("SELECT COUNT(*) FROM users WHERE role = :role")
        params = {"role": role, "limit": limit, "offset": offset}
        count_params = {"role": role}
    else:
        query = text("SELECT * FROM users ORDER BY created_at DESC LIMIT :limit OFFSET :offset")
        count_query = text("SELECT COUNT(*) FROM users")
        params = {"limit": limit, "offset": offset}
        count_params = {}
    
    result = await session.execute(query, params)
    users = [dict(u) for u in result.mappings().all()]
    
    total_result = await session.execute(count_query, count_params)
    total = total_result.scalar()
    
    return UserListResponse(items=users, total=total)


@router.patch("/{user_id}/role", response_model=UserRead)
async def update_user_role(
    user_id: int,
    payload: UserRoleUpdate,
    session: AsyncSession = Depends(get_session),
    admin: dict = Depends(get_admin_user),
) -> UserRead:
    """
    Update a user's role. Admin only.
    
    SQL: UPDATE users SET role = :role WHERE user_id = :user_id RETURNING *
    """
    # Check user exists
    result = await session.execute(
        text("SELECT * FROM users WHERE user_id = :user_id"),
        {"user_id": user_id}
    )
    user = result.mappings().one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Update role
    result = await session.execute(
        text("UPDATE users SET role = :role, updated_at = NOW() WHERE user_id = :user_id RETURNING *"),
        {"role": payload.role, "user_id": user_id}
    )
    updated_user = result.mappings().one()
    await session.commit()
    return dict(updated_user)
