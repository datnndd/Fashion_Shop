from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.deps import get_current_user, get_admin_user
from app.models.user import User
from app.models.orders import Order
from app.schemas.user import UserCreate, UserRead, UserRoleUpdate, UserListResponse, AdminUserCreate, UserUpdate, PasswordChange
from app.schemas.order import OrderRead
from app.utils.security import hash_password, verify_password

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(payload: UserCreate, session: AsyncSession = Depends(get_session)) -> UserRead:
    existing = await session.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        phone=payload.phone,
        gender=payload.gender,
        dob=payload.dob,
        role="customer",  # Force customer role for public registration
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@router.post("/admin", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def admin_create_user(
    payload: AdminUserCreate,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin_user),
) -> UserRead:
    """Admin endpoint to create users with specific roles."""
    existing = await session.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        phone=payload.phone,
        gender=payload.gender,
        dob=payload.dob,
        role=payload.role,  # Admin can set any role
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@router.get("/me", response_model=UserRead)
async def read_users_me(current_user: User = Depends(get_current_user)) -> UserRead:
    return current_user


@router.patch("/me", response_model=UserRead)
async def update_my_profile(
    payload: UserUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> UserRead:
    """Update current user's profile."""
    if payload.name is not None:
        current_user.name = payload.name
    if payload.phone is not None:
        current_user.phone = payload.phone
    if payload.gender is not None:
        current_user.gender = payload.gender
    if payload.dob is not None:
        current_user.dob = payload.dob
    
    current_user.updated_at = func.now()
    await session.commit()
    await session.refresh(current_user)
    return current_user


@router.post("/me/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    payload: PasswordChange,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Change current user's password."""
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    current_user.password_hash = hash_password(payload.new_password)
    current_user.updated_at = func.now()
    await session.commit()
    return {"message": "Password changed successfully"}


@router.get("/me/orders", response_model=list[OrderRead])
async def get_my_orders(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> list[OrderRead]:
    """Get current user's orders."""
    query = select(Order).options(selectinload(Order.items)).where(
        Order.user_id == current_user.user_id
    ).order_by(Order.created_at.desc())
    result = await session.scalars(query)
    return list(result.all())


@router.get("/{user_id}", response_model=UserRead)
async def get_user(user_id: int, session: AsyncSession = Depends(get_session)) -> UserRead:
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.get("", response_model=UserListResponse)
async def list_users(
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0),
    role: str | None = Query(default=None),
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin_user),
) -> UserListResponse:
    """List all users. Manager only."""
    query = select(User)
    count_query = select(func.count(User.user_id))
    
    if role:
        query = query.where(User.role == role)
        count_query = count_query.where(User.role == role)
        
    query = query.order_by(User.created_at.desc()).offset(offset).limit(limit)
    
    total = await session.scalar(count_query)
    result = await session.scalars(query)
    
    return UserListResponse(
        items=list(result.all()),
        total=total
    )


@router.patch("/{user_id}/role", response_model=UserRead)
async def update_user_role(
    user_id: int,
    payload: UserRoleUpdate,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin_user),
) -> UserRead:
    """Update a user's role. Admin only."""
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user.role = payload.role
    user.updated_at = func.now()
    await session.commit()
    await session.refresh(user)
    return user
