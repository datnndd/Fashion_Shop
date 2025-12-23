import asyncio
from sqlalchemy import text
from app.db.session import engine

async def check():
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT category_id, name FROM categories WHERE name ILIKE '%woman%' OR name ILIKE '%women%'"))
        print(f"Women categories: {res.all()}")

if __name__ == "__main__":
    asyncio.run(check())
