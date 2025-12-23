from datetime import datetime
from pydantic import BaseModel, Field

class DiscountBase(BaseModel):
    code: str
    type: str = Field(..., pattern="^(percentage|fixed)$")  # percentage or fixed
    value: float
    max_discount_amount: float | None = None
    min_order_value: float | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    usage_limit: int | None = None
    is_active: bool = True

class DiscountCreate(DiscountBase):
    pass

class DiscountUpdate(BaseModel):
    code: str | None = None
    type: str | None = Field(None, pattern="^(percentage|fixed)$")
    value: float | None = None
    max_discount_amount: float | None = None
    min_order_value: float | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    usage_limit: int | None = None
    is_active: bool | None = None

class DiscountRead(DiscountBase):
    discount_id: int
    used_count: int | None = 0

    model_config = {"from_attributes": True}
