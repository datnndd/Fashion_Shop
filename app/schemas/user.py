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
    password: str = Field(min_length=8)


class AdminUserCreate(UserBase):
    """Schema for admin to create users with specific roles"""
    password: str = Field(min_length=8)
    role: str = Field(default="customer")


class UserRead(UserBase):
    user_id: int
    is_active: bool
    last_login: datetime | None
    created_at: datetime
    updated_at: datetime | None
    deleted_at: datetime | None

    model_config = {"from_attributes": True}


class UserRoleUpdate(BaseModel):
    role: str


class UserListResponse(BaseModel):
    items: list[UserRead]
    total: int


class UserUpdate(BaseModel):
    """Schema for updating user profile"""
    name: str | None = None
    phone: str | None = Field(default=None, max_length=20)
    gender: int | None = None
    dob: date | None = None


class PasswordChange(BaseModel):
    """Schema for changing password"""
    current_password: str
    new_password: str = Field(min_length=8)
