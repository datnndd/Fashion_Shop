from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.deps import get_admin_user
from app.schemas.order import OrderRead, OrderUpdateStatus

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("", response_model=list[OrderRead])
async def list_orders(
    status: str | None = Query(default=None),
    limit: int = Query(default=50),
    offset: int = Query(default=0),
    session: AsyncSession = Depends(get_session),
    admin: dict = Depends(get_admin_user),
) -> list[OrderRead]:
    """
    List orders with optional status filter. Admin only.
    
    SQL: SELECT * FROM orders [WHERE status = :status] ORDER BY created_at DESC LIMIT ... OFFSET ...
         SELECT * FROM order_items WHERE order_id = :order_id
    """
    # Build query with optional status filter
    if status:
        query = text("""
            SELECT * FROM orders WHERE status = :status 
            ORDER BY created_at DESC LIMIT :limit OFFSET :offset
        """)
        params = {"status": status, "limit": limit, "offset": offset}
    else:
        query = text("SELECT * FROM orders ORDER BY created_at DESC LIMIT :limit OFFSET :offset")
        params = {"limit": limit, "offset": offset}
    
    result = await session.execute(query, params)
    orders = [dict(o) for o in result.mappings().all()]
    
    # Get items for each order
    for order in orders:
        items_result = await session.execute(
            text("SELECT * FROM order_items WHERE order_id = :order_id"),
            {"order_id": order["order_id"]}
        )
        order["items"] = [dict(item) for item in items_result.mappings().all()]
    
    return orders


@router.get("/{order_id}", response_model=OrderRead)
async def get_order(
    order_id: int,
    session: AsyncSession = Depends(get_session),
    admin: dict = Depends(get_admin_user),
) -> OrderRead:
    """
    Get order details by ID. Admin only.
    
    SQL: SELECT * FROM orders WHERE order_id = :order_id
         SELECT * FROM order_items WHERE order_id = :order_id
    """
    result = await session.execute(
        text("SELECT * FROM orders WHERE order_id = :order_id"),
        {"order_id": order_id}
    )
    order = result.mappings().one_or_none()
    
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    order = dict(order)
    
    # Get order items
    items_result = await session.execute(
        text("SELECT * FROM order_items WHERE order_id = :order_id"),
        {"order_id": order_id}
    )
    order["items"] = [dict(item) for item in items_result.mappings().all()]
    
    return order


@router.put("/{order_id}/status", response_model=OrderRead)
async def update_order_status(
    order_id: int,
    payload: OrderUpdateStatus,
    session: AsyncSession = Depends(get_session),
    admin: dict = Depends(get_admin_user),
) -> OrderRead:
    """
    Update order status. Admin only.
    
    SQL: UPDATE orders SET status = :status WHERE order_id = :order_id RETURNING *
    """
    # Check order exists
    result = await session.execute(
        text("SELECT * FROM orders WHERE order_id = :order_id"),
        {"order_id": order_id}
    )
    if not result.mappings().one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    # Update status
    result = await session.execute(
        text("UPDATE orders SET status = :status WHERE order_id = :order_id RETURNING *"),
        {"status": payload.status, "order_id": order_id}
    )
    order = dict(result.mappings().one())
    await session.commit()
    
    # Get order items
    items_result = await session.execute(
        text("SELECT * FROM order_items WHERE order_id = :order_id"),
        {"order_id": order_id}
    )
    order["items"] = [dict(item) for item in items_result.mappings().all()]
    
    return order
