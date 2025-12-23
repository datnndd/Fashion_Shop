import asyncio
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from app.db.session import AsyncSessionLocal
from app.models.orders import CartItem
from app.models.catalog import ProductVariant

async def check_cart_stock():
    async with AsyncSessionLocal() as session:
        # Check specific variant 81 as seen in user's JSON
        print("\n--- Checking Variant 81 (Slim Fit Denim Jeans) ---")
        stmt_var = select(ProductVariant).where(ProductVariant.variant_id == 81)
        result_var = await session.execute(stmt_var)
        variant_81 = result_var.scalar_one_or_none()
        if variant_81:
             print(f"Variant 81 found. Stock: {variant_81.stock} (Type: {type(variant_81.stock)})")
        else:
             print("Variant 81 NOT FOUND in database.")

        print("\n--- Checking All Cart Items ---")
        stmt = (
            select(CartItem)
            .options(joinedload(CartItem.product_variant))
        )
        result = await session.execute(stmt)
        items = result.scalars().all()
        
        print(f"Found {len(items)} cart items.")
        for item in items:
            variant = item.product_variant
            if variant:
                print(f"CartItem {item.cart_item_id}: Variant {variant.variant_id} Stock: {variant.stock}")
            else:
                print(f"CartItem {item.cart_item_id}: No Variant found")

if __name__ == "__main__":
    asyncio.run(check_cart_stock())
