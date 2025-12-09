from pydantic import BaseModel


class ProductBase(BaseModel):
    category_id: int
    name: str
    slug: str
    description: str | None = None
    base_price: float
    thumbnail: str | None = None
    is_published: bool = True


class ProductCreate(ProductBase):
    pass


class ProductRead(ProductBase):
    product_id: int

    model_config = {"from_attributes": True}
