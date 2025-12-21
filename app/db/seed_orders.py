"""
Script to add mock order data for testing dashboard statistics.
Run with: python -m app.db.seed_orders
"""
import asyncio
import random
from datetime import datetime
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.models.catalog import Product, ProductVariant
from app.models.orders import Order, OrderItem
from app.models.user import User


async def seed_orders(session: AsyncSession):
    """Create mock orders for dashboard testing - All orders on 21/12/2025."""
    
    # Get existing users and variants
    users = (await session.execute(select(User).where(User.role == "customer"))).scalars().all()
    if not users:
        users = (await session.execute(select(User))).scalars().all()
    
    variants = (await session.execute(select(ProductVariant))).scalars().all()
    products = (await session.execute(select(Product))).scalars().all()
    
    if not variants or not users:
        print("⚠️ No variants or users found. Please seed base data first.")
        return
    
    product_map = {p.product_id: p for p in products}
    
    # All orders created on 21/12/2025
    order_date = datetime(2025, 12, 21, random.randint(8, 22), random.randint(0, 59), random.randint(0, 59))
    
    statuses = ["pending", "processing", "shipped", "delivered"]
    payment_methods = ["cod", "bank_transfer", "momo", "zalopay"]
    
    orders_created = 0
    
    # Create 15 orders all on 21/12/2025
    for i in range(15):
        # Random time on 21/12/2025
        order_time = datetime(
            2025, 12, 21,
            random.randint(8, 22),
            random.randint(0, 59),
            random.randint(0, 59)
        )
        
        user = random.choice(users)
        
        # Generate order code
        order_code = f"ORD-20251221-{i+1:04d}"
        
        # Random items (1-4 products)
        num_items = random.randint(1, 4)
        selected_variants = random.sample(variants, min(num_items, len(variants)))
        
        subtotal = Decimal("0")
        order_items = []
        
        for variant in selected_variants:
            quantity = random.randint(1, 3)
            unit_price = variant.price
            item_total = unit_price * quantity
            subtotal += item_total
            
            product = product_map.get(variant.product_id)
            
            order_items.append({
                "product_variant_id": variant.variant_id,
                "product_name": product.name if product else "Unknown Product",
                "variant_attributes_snapshot": variant.attributes,
                "quantity": quantity,
                "unit_price": unit_price,
                "total_price": item_total
            })
        
        discount_amount = Decimal("0")
        if random.random() > 0.7:  # 30% chance of discount
            discount_amount = subtotal * Decimal("0.1")  # 10% discount
        
        total_price = subtotal - discount_amount
        
        # Random status based on order number (simulate different stages)
        if i < 3:
            status = "delivered"
        elif i < 7:
            status = "shipped"
        elif i < 11:
            status = "processing"
        else:
            status = "pending"
        
        order = Order(
            code=order_code,
            user_id=user.user_id,
            recipient_name=user.name,
            recipient_phone=f"09{random.randint(10000000, 99999999)}",
            shipping_address_full=f"{random.randint(1, 999)} Đường {random.choice(['Lê Lợi', 'Nguyễn Huệ', 'Trần Hưng Đạo', 'Pasteur', 'Hai Bà Trưng'])}, Phường {random.randint(1, 20)}, Quận {random.randint(1, 12)}, TP. Hồ Chí Minh",
            shipping_province="TP. Hồ Chí Minh",
            shipping_ward=f"Phường {random.randint(1, 20)}",
            subtotal=subtotal,
            discount_amount=discount_amount,
            total_price=total_price,
            payment_method=random.choice(payment_methods),
            payment_status="paid" if status in ["shipped", "delivered"] else ("paid" if random.random() > 0.5 else "unpaid"),
            status=status,
            created_at=order_time
        )
        
        session.add(order)
        await session.flush()
        
        # Add order items
        for item_data in order_items:
            order_item = OrderItem(
                order_id=order.order_id,
                **item_data
            )
            session.add(order_item)
        
        orders_created += 1
    
    await session.flush()
    print(f"✓ Created {orders_created} orders with items (all on 21/12/2025)")


async def main():
    """Main function to seed orders."""
    async with AsyncSessionLocal() as session:
        print("🌱 Seeding mock orders for 21/12/2025...")
        
        # Check if orders already exist
        existing = await session.scalar(select(Order.order_id).limit(1))
        if existing:
            print("⚠️ Orders already exist. Deleting old orders first...")
            await session.execute(OrderItem.__table__.delete())
            await session.execute(Order.__table__.delete())
            await session.commit()
        
        await seed_orders(session)
        await session.commit()
        print("✅ Mock orders seeded successfully!")


if __name__ == "__main__":
    asyncio.run(main())
