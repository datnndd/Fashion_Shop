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


class UserAddressBase(BaseModel):
    user_id: int
    province_id: int
    ward_id: int
    street: str
    full_address: str
    is_default: bool = False


class UserAddressCreate(UserAddressBase):
    pass


class UserAddressRead(UserAddressBase):
    address_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
