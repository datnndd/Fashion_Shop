import asyncio
import sys

# Add project root to python path if needed (though running from root usually works)
# sys.path.append('.') 

from app.db.base import Base
from app.db.session import engine
from app.db.seed_data import seed_database

async def reset_db():
    print("Starting database reset...")
    async with engine.begin() as conn:
        print("Dropping all tables...")
        from sqlalchemy import text
        await conn.execute(text("DROP TABLE IF EXISTS user_designs CASCADE"))
        await conn.execute(text("DROP TABLE IF EXISTS custom_product_templates CASCADE"))
        await conn.run_sync(Base.metadata.drop_all)
        print("Creating all tables...")
        await conn.run_sync(Base.metadata.create_all)
    
    print("Tables re-created. Seeding data...")
    # seed_database creates its own session and handles commit
    await seed_database()
    print("Done.")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(reset_db())
