import asyncio
from sqlalchemy import text
from app.db.session import engine

async def check():
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT category_id, name FROM categories WHERE parent_id = 80"))
        print(f"Children of 'Women' (80): {res.all()}")

if __name__ == "__main__":
    asyncio.run(check())
