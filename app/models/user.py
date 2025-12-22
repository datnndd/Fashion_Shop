from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Index, Integer, SmallInteger, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = (Index("ix_users_phone", "phone"),)

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    
    # User's profile address (single)
    province_id: Mapped[int | None] = mapped_column(ForeignKey("provinces.province_id"), nullable=True)
    ward_id: Mapped[int | None] = mapped_column(ForeignKey("wards.ward_id"), nullable=True)
    street: Mapped[str | None] = mapped_column(String(255), nullable=True)
    full_address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    gender: Mapped[int] = mapped_column(SmallInteger, default=0)
    dob: Mapped[Date | None] = mapped_column(Date, nullable=True)
    role: Mapped[str] = mapped_column(String(20), default="customer")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    deleted_at: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)

    province = relationship("Province", back_populates="users")
    ward = relationship("Ward", back_populates="users")
    shipping_addresses = relationship("ShippingAddress", back_populates="user")
    cart = relationship("Cart", back_populates="user", uselist=False)
    orders = relationship("Order", back_populates="user")
    reviews = relationship("Review", back_populates="user")

