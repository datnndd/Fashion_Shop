from sqlalchemy.ext.asyncio import AsyncEngine

from app.db.base import Base
from app.models import (  # noqa: F401
    Cart,
    CartItem,
    Category,
    Discount,
    Order,
    OrderItem,
    Product,
    ProductVariant,
    Province,
    Review,
    User,
    ShippingAddress,
    Ward,
)


async def init_models(engine: AsyncEngine) -> None:
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ DB initialized")
    except Exception as e:
        print("⚠️ DB init skipped:", e)

