from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Cart(Base):
    __tablename__ = "carts"

    cart_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"))
    updated_at: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)

    user = relationship("User", back_populates="cart")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")


class CartItem(Base):
    __tablename__ = "cart_items"

    cart_item_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    cart_id: Mapped[int] = mapped_column(ForeignKey("carts.cart_id"))
    product_variant_id: Mapped[int | None] = mapped_column(ForeignKey("product_variants.variant_id"), nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())

    cart = relationship("Cart", back_populates="items")
    product_variant = relationship("ProductVariant", back_populates="cart_items")


class Order(Base):
    __tablename__ = "orders"

    order_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"))
    discount_id: Mapped[int | None] = mapped_column(ForeignKey("discounts.discount_id"), nullable=True)

    recipient_name: Mapped[str] = mapped_column(String(255))
    recipient_phone: Mapped[str] = mapped_column(String(20))
    shipping_address_full: Mapped[str] = mapped_column(String(500))
    shipping_province: Mapped[str] = mapped_column(String(100))
    shipping_ward: Mapped[str] = mapped_column(String(100))

    subtotal: Mapped[Numeric] = mapped_column(Numeric(15, 2))
    discount_amount: Mapped[Numeric] = mapped_column(Numeric(15, 2))
    total_price: Mapped[Numeric] = mapped_column(Numeric(15, 2))

    payment_method: Mapped[str] = mapped_column(String(50))
    payment_status: Mapped[str] = mapped_column(String(20), default="unpaid")
    transaction_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")

    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)

    user = relationship("User", back_populates="orders")
    discount = relationship("Discount", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    order_item_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.order_id"))
    product_variant_id: Mapped[int | None] = mapped_column(ForeignKey("product_variants.variant_id"), nullable=True)

    product_name: Mapped[str] = mapped_column(String(255))
    variant_attributes_snapshot: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    quantity: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[Numeric] = mapped_column(Numeric(15, 2))
    total_price: Mapped[Numeric] = mapped_column(Numeric(15, 2))

    order = relationship("Order", back_populates="items")
    product_variant = relationship("ProductVariant", back_populates="order_items")
