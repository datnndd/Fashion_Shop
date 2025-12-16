from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Collection(Base):
    """Collection model for grouping products with theme styling."""
    __tablename__ = "collections"

    collection_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Theme/Styling
    accent_color: Mapped[str | None] = mapped_column(String(20), nullable=True)
    secondary_color: Mapped[str | None] = mapped_column(String(20), nullable=True)
    border_color: Mapped[str | None] = mapped_column(String(20), nullable=True)
    panel_bg_color: Mapped[str | None] = mapped_column(String(20), nullable=True)
    gradient_overlay: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_overlay: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class CollectionProduct(Base):
    """Association table for Collection-Product many-to-many relationship."""
    __tablename__ = "collection_products"

    collection_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[int] = mapped_column(Integer, primary_key=True)
