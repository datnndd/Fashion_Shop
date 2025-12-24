from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.deps import get_admin_user
from app.schemas.marketing import DiscountCreate, DiscountRead, DiscountUpdate

router = APIRouter(prefix="/marketing", tags=["marketing"])

@router.post("/discounts", response_model=DiscountRead, status_code=status.HTTP_201_CREATED)
async def create_discount(
    payload: DiscountCreate,
    session: AsyncSession = Depends(get_session),
    admin: dict = Depends(get_admin_user),
) -> DiscountRead:
    """
    Create a new discount code. Requires admin role.
    """
    # Check if code exists
    result = await session.execute(
        text("SELECT * FROM discounts WHERE code = :code"),
        {"code": payload.code}
    )
    if result.mappings().one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Discount code already exists")

    result = await session.execute(
        text("""
            INSERT INTO discounts (
                code, type, value, max_discount_amount, min_order_value,
                start_date, end_date, usage_limit, is_active, used_count
            )
            VALUES (
                :code, :type, :value, :max_discount_amount, :min_order_value,
                :start_date, :end_date, :usage_limit, :is_active, 0
            )
            RETURNING *
        """),
        payload.model_dump()
    )
    discount = result.mappings().one()
    await session.commit()
    return dict(discount)

@router.get("/discounts", response_model=list[DiscountRead])
async def list_discounts(
    is_active: bool | None = Query(default=None),
    session: AsyncSession = Depends(get_session),
    admin: dict = Depends(get_admin_user),
) -> list[DiscountRead]:
    """
    List all discounts. Requires admin role.
    """
    if is_active is not None:
        # Table has no created_at column; sort by latest discount_id instead
        query = text("SELECT * FROM discounts WHERE is_active = :is_active ORDER BY discount_id DESC")
        params = {"is_active": is_active}
    else:
        query = text("SELECT * FROM discounts ORDER BY discount_id DESC")
        params = {}
    
    result = await session.execute(query, params)
    return [dict(d) for d in result.mappings().all()]


@router.get("/discounts/public", response_model=list[DiscountRead])
async def list_public_discounts(
    is_active: bool | None = Query(default=True),
    session: AsyncSession = Depends(get_session),
) -> list[DiscountRead]:
    """
    Public endpoint to list active discounts for customers (no admin required).
    """
    if is_active is not None:
        query = text("SELECT * FROM discounts WHERE is_active = :is_active ORDER BY discount_id DESC")
        params = {"is_active": is_active}
    else:
        query = text("SELECT * FROM discounts ORDER BY discount_id DESC")
        params = {}

    result = await session.execute(query, params)
    return [dict(d) for d in result.mappings().all()]

@router.get("/discounts/{discount_id}", response_model=DiscountRead)
async def get_discount(
    discount_id: int,
    session: AsyncSession = Depends(get_session),
    admin: dict = Depends(get_admin_user),
) -> DiscountRead:
    """
    Get a discount by ID.
    """
    result = await session.execute(
        text("SELECT * FROM discounts WHERE discount_id = :discount_id"),
        {"discount_id": discount_id}
    )
    discount = result.mappings().one_or_none()
    if not discount:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Discount not found")
    return dict(discount)

@router.put("/discounts/{discount_id}", response_model=DiscountRead)
async def update_discount(
    discount_id: int,
    payload: DiscountUpdate,
    session: AsyncSession = Depends(get_session),
    admin: dict = Depends(get_admin_user),
) -> DiscountRead:
    """
    Update a discount.
    """
    # Check exists
    result = await session.execute(
        text("SELECT * FROM discounts WHERE discount_id = :discount_id"),
        {"discount_id": discount_id}
    )
    if not result.mappings().one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Discount not found")

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
    
    set_clause = ", ".join(f"{key} = :{key}" for key in update_data.keys())
    update_data["discount_id"] = discount_id
    
    result = await session.execute(
        text(f"UPDATE discounts SET {set_clause} WHERE discount_id = :discount_id RETURNING *"),
        update_data
    )
    discount = result.mappings().one()
    await session.commit()
    return dict(discount)

@router.delete("/discounts/{discount_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_discount(
    discount_id: int,
    session: AsyncSession = Depends(get_session),
    admin: dict = Depends(get_admin_user),
) -> None:
    """
    Delete a discount.
    """
    result = await session.execute(
        text("SELECT * FROM discounts WHERE discount_id = :discount_id"),
        {"discount_id": discount_id}
    )
    if not result.mappings().one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Discount not found")

    await session.execute(
        text("DELETE FROM discounts WHERE discount_id = :discount_id"),
        {"discount_id": discount_id}
    )
    await session.commit()
