from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel


class ReviewBase(BaseModel):
    rating: int
    title: str | None = None
    comment: str | None = None
    size_purchased: str | None = None
    images: list[str] | None = None


class ReviewCreate(ReviewBase):
    product_id: int
    order_item_id: int


class ReviewRead(ReviewBase):
    review_id: int
    user_id: int
    product_id: int
    helpful_count: int = 0
    created_at: datetime
    is_approved: bool
    
    model_config = {"from_attributes": True}


class ReviewReadWithUser(ReviewRead):
    """Review with user name included."""
    user_name: str | None = None
    is_verified: bool = False
