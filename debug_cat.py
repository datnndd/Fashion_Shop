import asyncio
from sqlalchemy import text
from app.db.session import engine

async def check():
    async with engine.connect() as conn:
        # Check category 79
        res = await conn.execute(text("SELECT category_id, name, parent_id FROM categories WHERE category_id = 79"))
        print(f"Category 79: {res.all()}")
        
        # Check if products exist in category 79
        res = await conn.execute(text("SELECT count(*) FROM products WHERE category_id = 79"))
        print(f"Products in category 79 (primary): {res.scalar()}")
        
        # Check if products exist in product_categories for category 79
        res = await conn.execute(text("SELECT count(*) FROM product_categories WHERE category_id = 79"))
        print(f"Products in category 79 (junction): {res.scalar()}")

if __name__ == "__main__":
    asyncio.run(check())
