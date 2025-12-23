from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional
from app.schemas.location import ShippingAddressRead
from pydantic import Field

class OrderItemRead(BaseModel):
    order_item_id: int
    product_id: Optional[int] = None
    product_variant_id: Optional[int] = None
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
    shipping_address_id: int
    shipping_address: Optional[ShippingAddressRead] = None
    discount_id: Optional[int] = None
    subtotal: float
    discount_amount: float
    total_price: float
    status: str
    payment_method: str
    payment_status: str
    created_at: datetime
    items: List[OrderItemRead] = []
    note: Optional[str] = None

    class Config:
        from_attributes = True

class OrderUpdateStatus(BaseModel):
    status: str


class CheckoutRequest(BaseModel):
    shipping_address_id: int
    payment_method: str
    cart_item_ids: Optional[List[int]] = Field(default=None, description="IDs from cart_items to checkout. If empty, checkout all items.")
    discount_code: Optional[str] = None
    shipping_method: Optional[str] = Field(default=None, description="Frontend label for shipping; not stored but used for validation.")
    shipping_fee: float = 0
    note: Optional[str] = None
