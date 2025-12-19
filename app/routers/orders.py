from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.deps import get_admin_user
from app.models.orders import Order
from app.models.user import User
from app.schemas.order import OrderRead, OrderUpdateStatus

router = APIRouter(prefix="/orders", tags=["orders"])

@router.get("", response_model=list[OrderRead])
async def list_orders(
    status: str | None = Query(default=None),
    limit: int = Query(default=50),
    offset: int = Query(default=0),
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin_user),
) -> list[OrderRead]:
    """List orders with optional status filter. Admin only."""
    query = select(Order).options(selectinload(Order.items))
    
    if status:
        query = query.where(Order.status == status)
        
    query = query.order_by(Order.created_at.desc()).offset(offset).limit(limit)
    result = await session.scalars(query)
    return list(result.all())

@router.get("/{order_id}", response_model=OrderRead)
async def get_order(
    order_id: int,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin_user),
) -> OrderRead:
    """Get order details by ID. Admin only."""
    query = select(Order).options(selectinload(Order.items)).where(Order.order_id == order_id)
    result = await session.scalars(query)
    order = result.one_or_none()
    
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        
    return order

@router.put("/{order_id}/status", response_model=OrderRead)
async def update_order_status(
    order_id: int,
    payload: OrderUpdateStatus,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(get_admin_user),
) -> OrderRead:
    """Update order status. Admin only."""
    query = select(Order).options(selectinload(Order.items)).where(Order.order_id == order_id)
    result = await session.scalars(query)
    order = result.one_or_none()
    
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        
    order.status = payload.status
    await session.commit()
    await session.refresh(order)
    return order
