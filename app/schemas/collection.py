from __future__ import annotations
from pydantic import BaseModel


class CollectionBase(BaseModel):
    name: str
    slug: str
    description: str | None = None
    accent_color: str | None = None
    secondary_color: str | None = None
    border_color: str | None = None
    panel_bg_color: str | None = None
    gradient_overlay: str | None = None
    image_overlay: str | None = None
    is_active: bool = True


class CollectionCreate(CollectionBase):
    pass


class CollectionRead(CollectionBase):
    collection_id: int
    
    model_config = {"from_attributes": True}


class CollectionReadWithProducts(CollectionRead):
    """Collection with products included."""
    from app.schemas.product import ProductRead
    
    products: list[ProductRead] = []
