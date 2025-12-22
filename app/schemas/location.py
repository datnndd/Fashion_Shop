from datetime import datetime

from pydantic import BaseModel


class ProvinceBase(BaseModel):
    code: str
    name: str


class ProvinceCreate(ProvinceBase):
    pass


class ProvinceRead(ProvinceBase):
    province_id: int

    model_config = {"from_attributes": True}


class WardBase(BaseModel):
    province_id: int
    code: str
    name: str


class WardCreate(WardBase):
    pass


class WardRead(WardBase):
    ward_id: int

    model_config = {"from_attributes": True}


class ShippingAddressBase(BaseModel):
    province_id: int
    ward_id: int
    recipient_name: str
    recipient_phone: str
    street: str
    full_address: str
    is_default: bool = False


class ShippingAddressCreate(ShippingAddressBase):
    user_id: int


class ShippingAddressRead(ShippingAddressBase):
    shipping_address_id: int
    user_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ShippingAddressCreateMe(BaseModel):
    """Schema for creating address for current user (no user_id needed)"""
    province_id: int
    ward_id: int
    recipient_name: str
    recipient_phone: str
    street: str
    full_address: str
    is_default: bool = False


class ShippingAddressUpdate(BaseModel):
    """Schema for updating user address"""
    province_id: int | None = None
    ward_id: int | None = None
    recipient_name: str | None = None
    recipient_phone: str | None = None
    street: str | None = None
    full_address: str | None = None
    is_default: bool | None = None
