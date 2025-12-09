from pydantic import BaseModel


class CategoryBase(BaseModel):
    name: str
    slug: str
    description: str | None = None
    parent_id: int | None = None
    is_active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryRead(CategoryBase):
    category_id: int

    model_config = {"from_attributes": True}
