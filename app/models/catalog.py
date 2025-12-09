from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Category(Base):
    __tablename__ = "categories"

    category_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("categories.category_id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    parent = relationship("Category", remote_side="Category.category_id", backref="children")
    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    product_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.category_id"))
    name: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    base_price: Mapped[Numeric] = mapped_column(Numeric(15, 2))
    thumbnail: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    deleted_at: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)

    category = relationship("Category", back_populates="products")
    variants = relationship("ProductVariant", back_populates="product")
    reviews = relationship("Review", back_populates="product")


class ProductVariant(Base):
    __tablename__ = "product_variants"

    variant_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.product_id"))
    sku: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    attributes: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    price: Mapped[Numeric] = mapped_column(Numeric(15, 2))
    stock: Mapped[int] = mapped_column(Integer, default=0)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    product = relationship("Product", back_populates="variants")
    cart_items = relationship("CartItem", back_populates="product_variant")
    order_items = relationship("OrderItem", back_populates="product_variant")
