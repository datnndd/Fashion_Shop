import asyncio
from sqlalchemy import text
from app.db.session import engine

async def check():
    async with engine.connect() as conn:
        # Check products in IDs 80, 81, 82
        res = await conn.execute(text("SELECT category_id, count(*) FROM products WHERE category_id IN (80, 81, 82) GROUP BY category_id"))
        print(f"Products in children of Men: {res.all()}")

if __name__ == "__main__":
    asyncio.run(check())
