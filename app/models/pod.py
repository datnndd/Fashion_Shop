from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class CustomProductTemplate(Base):
    __tablename__ = "custom_product_templates"

    template_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    base_price: Mapped[Numeric] = mapped_column(Numeric(15, 2))
    image_front: Mapped[str | None] = mapped_column(String(500), nullable=True)
    image_back: Mapped[str | None] = mapped_column(String(500), nullable=True)
    printable_area_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    designs = relationship("UserDesign", back_populates="template")


class UserDesign(Base):
    __tablename__ = "user_designs"

    design_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"))
    template_id: Mapped[int] = mapped_column(ForeignKey("custom_product_templates.template_id"))
    design_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    preview_image_front: Mapped[str | None] = mapped_column(String(500), nullable=True)
    preview_image_back: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="designs")
    template = relationship("CustomProductTemplate", back_populates="designs")
    cart_items = relationship("CartItem", back_populates="design")
    order_items = relationship("OrderItem", back_populates="design")
