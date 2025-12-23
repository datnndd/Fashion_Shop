from pydantic import BaseModel


class ProductVariantBase(BaseModel):
    sku: str
    attributes: dict | None = None
    price: float
    stock: int = 0
    images: list[str] | None = None
    is_active: bool = True


class ProductVariantCreate(ProductVariantBase):
    pass


class ProductVariantUpdate(BaseModel):
    variant_id: int | None = None
    sku: str | None = None
    attributes: dict | None = None
    price: float | None = None
    stock: int | None = None
    images: list[str] | None = None
    is_active: bool | None = None


class ProductVariantRead(ProductVariantBase):
    variant_id: int
    product_id: int

    model_config = {"from_attributes": True}
