from sqlalchemy.ext.asyncio import AsyncEngine

from app.db.base import Base
from app.models import (  # noqa: F401
    Cart,
    CartItem,
    Category,
    CustomProductTemplate,
    Discount,
    Order,
    OrderItem,
    Product,
    ProductVariant,
    Province,
    Review,
    User,
    UserAddress,
    UserDesign,
    Ward,
)


async def init_models(engine: AsyncEngine) -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
