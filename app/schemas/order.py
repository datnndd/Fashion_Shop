from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional

class OrderItemRead(BaseModel):
    product_name: str
    quantity: int
    unit_price: float
    total_price: float
    variant_attributes_snapshot: Optional[dict] = None

    class Config:
        from_attributes = True

class OrderRead(BaseModel):
    order_id: int
    code: str
    recipient_name: str
    recipient_phone: str
    shipping_address_full: str
    total_price: float
    status: str
    payment_method: str
    payment_status: str
    created_at: datetime
    items: List[OrderItemRead] = []

    class Config:
        from_attributes = True

class OrderUpdateStatus(BaseModel):
    status: str
