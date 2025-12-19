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


class ProductVariantRead(ProductVariantBase):
    variant_id: int
    product_id: int

    model_config = {"from_attributes": True}
