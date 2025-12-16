from __future__ import annotations
from pydantic import BaseModel


class ProductBase(BaseModel):
    category_id: int
    name: str
    slug: str
    description: str | None = None
    base_price: float
    thumbnail: str | None = None
    is_new: bool = False
    is_sale: bool = False
    original_price: float | None = None
    badge: str | None = None
    images: list[str] | None = None
    is_published: bool = True


class ProductCreate(ProductBase):
    pass


class ProductRead(ProductBase):
    product_id: int

    model_config = {"from_attributes": True}


class ProductReadWithDetails(ProductRead):
    """Product with variants and category included."""
    from app.schemas.variant import ProductVariantRead
    from app.schemas.category import CategoryRead
    
    variants: list[ProductVariantRead] = []
    category: CategoryRead | None = None

