from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Province(Base):
    __tablename__ = "provinces"

    province_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))

    wards = relationship("Ward", back_populates="province")
    addresses = relationship("UserAddress", back_populates="province")


class Ward(Base):
    __tablename__ = "wards"

    ward_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    province_id: Mapped[int] = mapped_column(ForeignKey("provinces.province_id"))
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))

    province = relationship("Province", back_populates="wards")
    addresses = relationship("UserAddress", back_populates="ward")


class UserAddress(Base):
    __tablename__ = "user_addresses"

    address_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"))
    province_id: Mapped[int] = mapped_column(ForeignKey("provinces.province_id"))
    ward_id: Mapped[int] = mapped_column(ForeignKey("wards.ward_id"))
    street: Mapped[str] = mapped_column(String(255))
    full_address: Mapped[str] = mapped_column(String(500))
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="addresses")
    province = relationship("Province", back_populates="addresses")
    ward = relationship("Ward", back_populates="addresses")
