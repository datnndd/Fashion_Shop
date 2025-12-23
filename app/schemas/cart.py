from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CartProduct(BaseModel):
    product_id: int
    name: str
    thumbnail: Optional[str] = None
    price: float = Field(description="Base price for this variant")
    discount_percent: int = 0
    sale_price: Optional[float] = None

    model_config = {"from_attributes": True}


class CartItemRead(BaseModel):
    cart_item_id: int
    product_variant_id: int
    quantity: int
    variant_attributes: Optional[dict] = None
    available_stock: Optional[int] = Field(
        default=None,
        description="Current stock for the selected variant; null means unknown or unlimited",
    )
    purchasable_quantity: int = Field(
        default=0,
        description="Quantity that can be purchased based on current stock",
    )
    is_available: bool = Field(
        default=False,
        description="Whether the variant is available for purchase",
    )
    unit_price: float = Field(description="Effective unit price after discount if any")
    line_total: float
    product: CartProduct

    model_config = {"from_attributes": True}


class CartRead(BaseModel):
    cart_id: int
    updated_at: Optional[datetime] = None
    items: list[CartItemRead]
    subtotal: float

    model_config = {"from_attributes": True}


class CartItemCreate(BaseModel):
    product_variant_id: int
    quantity: int = Field(default=1, ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(default=1, ge=1)
