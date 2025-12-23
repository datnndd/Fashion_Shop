import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_async_engine(DATABASE_URL, echo=False, future=True)

async def check():
    async with engine.connect() as conn:
        # Simulate the exact query from cart.py
        result = await conn.execute(text('''
            SELECT 
                ci.cart_item_id,
                ci.quantity,
                ci.product_variant_id,
                pv.attributes AS variant_attributes,
                pv.price AS variant_price,
                pv.stock AS variant_stock,
                p.product_id,
                p.name AS product_name,
                p.thumbnail,
                p.discount_percent,
                p.base_price
            FROM cart_items ci
            JOIN product_variants pv ON ci.product_variant_id = pv.variant_id
            JOIN products p ON pv.product_id = p.product_id
        '''))
        
        for row in result.mappings().all():
            raw_stock = row["variant_stock"]
            print(f"raw_stock = {raw_stock}, type = {type(raw_stock)}")
            try:
                available_stock = int(raw_stock) if raw_stock is not None else None
            except (TypeError, ValueError):
                available_stock = None
            print(f"  -> available_stock = {available_stock}")

asyncio.run(check())
