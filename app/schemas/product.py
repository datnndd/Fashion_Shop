from __future__ import annotations
from pydantic import BaseModel
from app.schemas.variant import ProductVariantRead
from app.schemas.category import CategoryRead


class ProductBase(BaseModel):
    category_id: int
    categories: list[int] | None = None  # Additional categories besides primary
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


class ProductUpdate(BaseModel):
    """Schema for updating a product."""
    category_id: int | None = None
    categories: list[int] | None = None
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    base_price: float | None = None
    thumbnail: str | None = None
    is_new: bool | None = None
    discount_percent: int | None = None
    badge: str | None = None
    images: list[str] | None = None
    is_published: bool | None = None
    variants: list["ProductVariantUpdate"] | None = None



# Import here to avoid circular imports
from app.schemas.variant import ProductVariantCreate, ProductVariantUpdate
ProductCreateWithVariants.model_rebuild()
ProductUpdate.model_rebuild()


class ProductRead(ProductBase):
    product_id: int
    categories: list[int] = []
    score: int | None = None
    colors: list[str] = []
    is_sale: bool = False
    sale_price: float | None = None
    variants: list[ProductVariantRead] = []

    model_config = {"from_attributes": True}


class ProductReadWithDetails(ProductRead):
    """Product with variants and category included."""

    variants: list[ProductVariantRead] = []
    category: CategoryRead | None = None

