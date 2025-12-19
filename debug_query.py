import asyncio
import sys
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.session import AsyncSessionLocal
from app.models.catalog import Product

async def test_products():
    async with AsyncSessionLocal() as session:
        try:
            query = select(Product).options(selectinload(Product.variants)).limit(1)
            result = await session.scalars(query)
            products = result.all()
            for p in products:
                print(f"Product: {p.name}")
                # Access colors property to trigger potential error
                print(f"Colors: {p.colors}")
        except Exception as e:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(test_products())
