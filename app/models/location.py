from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Province(Base):
    __tablename__ = "provinces"

    province_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))

    wards = relationship("Ward", back_populates="province")
    users = relationship("User", back_populates="province")
    shipping_addresses = relationship("ShippingAddress", back_populates="province")


class Ward(Base):
    __tablename__ = "wards"

    ward_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    province_id: Mapped[int] = mapped_column(ForeignKey("provinces.province_id"))
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))

    province = relationship("Province", back_populates="wards")
    users = relationship("User", back_populates="ward")
    shipping_addresses = relationship("ShippingAddress", back_populates="ward")


class ShippingAddress(Base):
    __tablename__ = "shipping_addresses"

    shipping_address_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"))
    province_id: Mapped[int] = mapped_column(ForeignKey("provinces.province_id"))
    ward_id: Mapped[int] = mapped_column(ForeignKey("wards.ward_id"))
    
    recipient_name: Mapped[str] = mapped_column(String(255))
    recipient_phone: Mapped[str] = mapped_column(String(20))
    
    street: Mapped[str] = mapped_column(String(255))
    full_address: Mapped[str] = mapped_column(String(500))
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    deleted_at: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)

    user = relationship("User", back_populates="shipping_addresses")
    province = relationship("Province", back_populates="shipping_addresses")
    ward = relationship("Ward", back_populates="shipping_addresses")
    orders = relationship("Order", back_populates="shipping_address")

