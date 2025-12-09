from datetime import date, datetime

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = Field(default=None, max_length=20)
    gender: int = 0
    dob: date | None = None
    role: str = "customer"


class UserCreate(UserBase):
    password: str = Field(min_length=6)


class UserRead(UserBase):
    user_id: int
    is_active: bool
    last_login: datetime | None
    created_at: datetime
    updated_at: datetime | None
    deleted_at: datetime | None

    model_config = {"from_attributes": True}
