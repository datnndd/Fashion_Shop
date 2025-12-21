"""
Script to add mock order data for testing dashboard statistics.
Run with: python -m app.db.seed_orders
"""
import asyncio
import random
from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.models.catalog import Product, ProductVariant
from app.models.orders import Order, OrderItem
from app.models.user import User


async def seed_orders(session: AsyncSession):
    """Create mock orders for dashboard testing."""
    
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
    
    # Generate orders spread over last 12 months
    statuses = ["pending", "processing", "shipped", "delivered"]
    payment_methods = ["cod", "bank_transfer", "momo", "zalopay"]
    
    orders_created = 0
    
    # Create ~50 orders spread across different dates
    for i in range(50):
        # Random date in the last 365 days
        days_ago = random.randint(0, 365)
        order_date = datetime.now() - timedelta(days=days_ago)
        
        user = random.choice(users)
        
        # Generate order code
        order_code = f"ORD-{order_date.strftime('%Y%m%d')}-{i+1:04d}"
        
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
        
        order = Order(
            code=order_code,
            user_id=user.user_id,
            recipient_name=user.name,
            recipient_phone="0123456789",
            shipping_address_full=f"123 Test Street, District {random.randint(1, 12)}, Ho Chi Minh City",
            shipping_province="Ho Chi Minh City",
            shipping_ward=f"Ward {random.randint(1, 20)}",
            subtotal=subtotal,
            discount_amount=discount_amount,
            total_price=total_price,
            payment_method=random.choice(payment_methods),
            payment_status="paid" if random.random() > 0.3 else "unpaid",
            status=random.choice(statuses),
            created_at=order_date
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
    print(f"✓ Created {orders_created} orders with items")


async def main():
    """Main function to seed orders."""
    async with AsyncSessionLocal() as session:
        print("🌱 Seeding mock orders...")
        
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
