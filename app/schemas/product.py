from __future__ import annotations
from pydantic import BaseModel
from app.schemas.variant import ProductVariantRead
from app.schemas.category import CategoryRead


class ProductBase(BaseModel):
    category_id: int
    name: str
    slug: str
    description: str | None = None
    base_price: float
    thumbnail: str | None = None
    is_new: bool = False
    discount_percent: int = 0  # 0-100
    badge: str | None = None
    images: list[str] | None = None
    is_published: bool = True


class ProductCreate(ProductBase):
    pass


class ProductCreateWithVariants(ProductBase):
    """Create product with variants in a single request."""
    variants: list["ProductVariantCreate"] = []


# Import here to avoid circular imports
from app.schemas.variant import ProductVariantCreate
ProductCreateWithVariants.model_rebuild()


class ProductRead(ProductBase):
    product_id: int
    colors: list[str] = []
    is_sale: bool = False
    sale_price: float | None = None

    model_config = {"from_attributes": True}


class ProductReadWithDetails(ProductRead):
    """Product with variants and category included."""

    variants: list[ProductVariantRead] = []
    category: CategoryRead | None = None

