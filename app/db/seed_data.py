"""
Seed data script for Fashion Shop database.
Run with: python -m app.db.seed_data
"""
import asyncio
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.models.catalog import Category, Product, ProductVariant
from app.models.user import User

async def seed_categories(session: AsyncSession) -> list[Category]:
    """Create sample categories with images."""
    categories = [
        Category(
            name="T-Shirts",
            slug="t-shirts",
            description="Classic and comfortable tees for everyday wear",
            image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
            is_active=True
        ),
        Category(
            name="Hoodies",
            slug="hoodies",
            description="Warm and cozy hoodies for cold days",
            image="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
            is_active=True
        ),
        Category(
            name="Outerwear",
            slug="outerwear",
            description="Stylish jackets and coats",
            image="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
            is_active=True
        ),
        Category(
            name="Shirts",
            slug="shirts",
            description="Casual and formal shirts",
            image="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800",
            is_active=True
        ),
        Category(
            name="Pants",
            slug="pants",
            description="Trousers, jeans and shorts",
            image="https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800",
            is_active=True
        ),
    ]
    
    for cat in categories:
        session.add(cat)
    await session.flush()
    return categories


async def seed_products(session: AsyncSession, categories: list[Category]) -> list[Product]:
    """Create sample products with images."""
    products_data = [
        # T-Shirts (3 products)
        {
            "category": "T-Shirts",
            "name": "Neon Oversized Knit",
            "slug": "neon-oversized-knit",
            "description": "A bold statement piece featuring our signature neon pink. Made from heavyweight cotton blend for a premium feel.",
            "base_price": Decimal("599000"),
            "thumbnail": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600",
            "images": [
                "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800",
                "https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=800"
            ],
            "is_new": True,
            "discount_percent": 0,
            "badge": "Best Seller",
        },
        {
            "category": "T-Shirts",
            "name": "Urban Street Tee",
            "slug": "urban-street-tee",
            "description": "Sleek and versatile. 100% organic cotton for everyday comfort with street style edge.",
            "base_price": Decimal("449000"),
            "thumbnail": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
            "images": [
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
                "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800"
            ],
            "is_new": False,
            "discount_percent": 15,
        },
        {
            "category": "T-Shirts",
            "name": "Graphic Print Tee",
            "slug": "graphic-print-tee",
            "description": "Express yourself with our artistic graphic tee. Premium cotton with vibrant print.",
            "base_price": Decimal("399000"),
            "thumbnail": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600",
            "images": [
                "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800"
            ],
            "is_new": True,
            "discount_percent": 0,
        },
        
        # Hoodies (3 products)
        {
            "category": "Hoodies",
            "name": "Core Fleece Hoodie",
            "slug": "core-fleece-hoodie",
            "description": "Fleece lined hoodie for maximum comfort. Cozy, warm and perfect for layering.",
            "base_price": Decimal("899000"),
            "thumbnail": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600",
            "images": [
                "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
                "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800"
            ],
            "is_new": False,
            "discount_percent": 20,
            "badge": "Sale",
        },
        {
            "category": "Hoodies",
            "name": "Essential Pullover",
            "slug": "essential-pullover",
            "description": "Your everyday go-to hoodie. Soft, comfortable, and stylish with kangaroo pocket.",
            "base_price": Decimal("749000"),
            "thumbnail": "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600",
            "images": [
                "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=800"
            ],
            "is_new": True,
            "discount_percent": 0,
        },
        {
            "category": "Hoodies",
            "name": "Zip-Up Tech Hoodie",
            "slug": "zip-up-tech-hoodie",
            "description": "Modern tech fabric with moisture-wicking properties. Perfect for active lifestyle.",
            "base_price": Decimal("999000"),
            "thumbnail": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600",
            "images": [
                "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800"
            ],
            "is_new": False,
            "discount_percent": 0,
        },
        
        # Outerwear (2 products)
        {
            "category": "Outerwear",
            "name": "Structured Blazer",
            "slug": "structured-blazer",
            "description": "Elevate your look with this tailored blazer featuring satin lining and modern fit.",
            "base_price": Decimal("1599000"),
            "thumbnail": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600",
            "images": [
                "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800",
                "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800"
            ],
            "is_new": True,
            "discount_percent": 0,
            "badge": "Premium",
        },
        {
            "category": "Outerwear",
            "name": "Tech Fleece Jacket",
            "slug": "tech-fleece-jacket",
            "description": "Water resistant tech fleece for active lifestyles. Lightweight yet warm.",
            "base_price": Decimal("1299000"),
            "thumbnail": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600",
            "images": [
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800"
            ],
            "is_new": False,
            "discount_percent": 10,
        },
        
        # Shirts (2 products)
        {
            "category": "Shirts",
            "name": "Summer Linen Shirt",
            "slug": "summer-linen-shirt",
            "description": "Breathable linen fabric perfect for warm weather. Relaxed fit with classic collar.",
            "base_price": Decimal("699000"),
            "thumbnail": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
            "images": [
                "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800",
                "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800"
            ],
            "is_new": False,
            "discount_percent": 0,
        },
        {
            "category": "Shirts",
            "name": "Oxford Button-Down",
            "slug": "oxford-button-down",
            "description": "Classic oxford cotton shirt, versatile for both casual and formal occasions.",
            "base_price": Decimal("799000"),
            "thumbnail": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600",
            "images": [
                "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800"
            ],
            "is_new": True,
            "discount_percent": 0,
            "badge": "New Arrival",
        },
        
        # Pants (2 products)
        {
            "category": "Pants",
            "name": "Slim Fit Chinos",
            "slug": "slim-fit-chinos",
            "description": "Versatile chinos that work for any occasion. Comfortable stretch fabric.",
            "base_price": Decimal("799000"),
            "thumbnail": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600",
            "images": [
                "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800"
            ],
            "is_new": False,
            "discount_percent": 25,
            "badge": "Hot Deal",
        },
        {
            "category": "Pants",
            "name": "Relaxed Denim Jeans",
            "slug": "relaxed-denim-jeans",
            "description": "Classic denim jeans with relaxed fit. Durable and timeless style.",
            "base_price": Decimal("899000"),
            "thumbnail": "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600",
            "images": [
                "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=800",
                "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800"
            ],
            "is_new": True,
            "discount_percent": 0,
        },
    ]
    
    category_map = {cat.name: cat for cat in categories}
    products = []
    
    for data in products_data:
        cat_name = data.pop("category")
        product = Product(
            category_id=category_map[cat_name].category_id,
            is_published=True,
            **data
        )
        session.add(product)
        products.append(product)
    
    await session.flush()
    return products


async def seed_variants(session: AsyncSession, products: list[Product]) -> list[ProductVariant]:
    """Create product variants with colors and sizes."""
    colors = [
        {"name": "Black", "hex": "#1a1a1a"},
        {"name": "White", "hex": "#ffffff"},
        {"name": "Navy", "hex": "#1e3a5f"},
        {"name": "Gray", "hex": "#6b7280"},
        {"name": "Pink", "hex": "#ec4899"},
    ]
    sizes = ["S", "M", "L", "XL"]
    
    # Color-specific images for variants
    color_images = {
        "Black": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400",
        "White": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
        "Navy": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400",
        "Gray": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400",
        "Pink": "https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=400",
    }
    
    variants = []
    for product in products:
        # Each product gets 3 color variants
        for i, color in enumerate(colors[:3]):
            for size in sizes:
                variant = ProductVariant(
                    product_id=product.product_id,
                    sku=f"{product.slug}-{color['name'].lower()}-{size.lower()}",
                    attributes={
                        "color": color["hex"],
                        "color_name": color["name"],
                        "size": size
                    },
                    price=product.base_price,
                    stock=50 - (i * 10),
                    images=[color_images.get(color["name"], product.thumbnail)],
                    is_active=True,
                )
                session.add(variant)
                variants.append(variant)
    
    await session.flush()
    return variants


async def seed_users(session: AsyncSession) -> list[User]:
    """Create sample users including an admin user."""
    from app.utils.security import hash_password
    
    users = [
        # Admin user with proper password
        User(
            name="Admin User",
            email="admin@basiccolor.com",
            password_hash=hash_password("Admin@123"),
            role="manager",
            is_active=True
        ),
        # Regular customers
        User(name="Sarah Mitchell", email="sarah@email.com", password_hash=hash_password("Password@123"), is_active=True),
        User(name="James Kennedy", email="james@email.com", password_hash=hash_password("Password@123"), is_active=True),
        User(name="Emily Rodriguez", email="emily@email.com", password_hash=hash_password("Password@123"), is_active=True),
        User(name="Marcus Thompson", email="marcus@email.com", password_hash=hash_password("Password@123"), is_active=True),
        User(name="Alex Parker", email="alex@email.com", password_hash=hash_password("Password@123"), is_active=True),
    ]
    
    for user in users:
        session.add(user)
    await session.flush()
    return users


async def seed_database():
    """Main function to seed all data."""
    async with AsyncSessionLocal() as session:
        print("🌱 Seeding database...")
        
        # Check if data already exists
        from sqlalchemy import select
        existing = await session.scalar(select(Category.category_id).limit(1))
        if existing:
            print("⚠️  Database already has data. Skipping seed.")
            return
        
        categories = await seed_categories(session)
        print(f"✓ Created {len(categories)} categories")
        
        products = await seed_products(session, categories)
        print(f"✓ Created {len(products)} products")
        
        variants = await seed_variants(session, products)
        print(f"✓ Created {len(variants)} variants")

        
        users = await seed_users(session)
        print(f"✓ Created {len(users)} users")
        
        await session.commit()
        print("✅ Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed_database())
