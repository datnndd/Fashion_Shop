from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Discount(Base):
    __tablename__ = "discounts"

    discount_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    type: Mapped[str] = mapped_column(String(20))
    value: Mapped[Numeric] = mapped_column(Numeric(15, 2))
    max_discount_amount: Mapped[Numeric | None] = mapped_column(Numeric(15, 2), nullable=True)
    min_order_value: Mapped[Numeric | None] = mapped_column(Numeric(15, 2), nullable=True)
    start_date: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    end_date: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    usage_limit: Mapped[int | None] = mapped_column(Integer, nullable=True)
    used_count: Mapped[int | None] = mapped_column(Integer, nullable=True, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    orders = relationship("Order", back_populates="discount")


class Review(Base):
    __tablename__ = "reviews"

    review_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.product_id"))
    order_item_id: Mapped[int] = mapped_column(ForeignKey("order_items.order_item_id"), unique=True)
    rating: Mapped[int] = mapped_column(Integer)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    images: Mapped[list | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    is_approved: Mapped[bool] = mapped_column(Boolean, default=True)

    user = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")
    order_item = relationship("OrderItem", backref="review")
