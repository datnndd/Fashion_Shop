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
    """Create sample categories."""
    categories = [
        Category(name="T-Shirts", slug="t-shirts", description="Classic and comfortable tees", is_active=True),
        Category(name="Hoodies", slug="hoodies", description="Warm and cozy hoodies", is_active=True),
        Category(name="Outerwear", slug="outerwear", description="Jackets and coats", is_active=True),
        Category(name="Shirts", slug="shirts", description="Casual and formal shirts", is_active=True),
        Category(name="Pants", slug="pants", description="Trousers and jeans", is_active=True),
    ]
    
    for cat in categories:
        session.add(cat)
    await session.flush()
    return categories


async def seed_products(session: AsyncSession, categories: list[Category]) -> list[Product]:
    """Create sample products."""
    products_data = [
        {
            "category": "T-Shirts",
            "name": "Neon Oversized Knit",
            "slug": "neon-oversized-knit",
            "description": "A bold statement piece featuring our signature neon pink. Made from heavyweight cotton blend for a premium feel.",
            "base_price": Decimal("3000000"),
            "thumbnail": "https://lh3.googleusercontent.com/aida-public/AB6AXuACQ5EPOfI4E08g7BONgVWum0GxW27TsRFDHaEMOjy05wisQShNoj8SppeNZXiyF0ky_NxJG5N5stwqwisK7VIfc0Nglmf2DDW4NKrw3I2tviR0_YNn3UL1t7sHRYvguNiy7D-FFzMHHLriFzWzyPkqMqtmqkxRtNIqVXdGC8ixYkhNUxWQwu4romhKp0xmHELv1TJcbOCDgdSevZ-smmzgB9dxSGtmNz90QshRGhgICEfAfREUoLQTivRAbkAjLNKk5BS3VSz0E-A",
            "is_new": True,
            "discount_percent": 0,
            "badge": "Best Seller",
        },
        {
            "category": "T-Shirts",
            "name": "Urban Tee - Magenta",
            "slug": "urban-tee-magenta",
            "description": "Sleek and versatile. 100% organic cotton for everyday comfort.",
            "base_price": Decimal("1125000"),
            "thumbnail": "https://lh3.googleusercontent.com/aida-public/AB6AXuCcl_O2s7tEkvre7Sk7DnL5bWi0OI5jrNoYqaj2Py2X40U4tEp9N2t4H8f_0A6H2-OHZEvlX98RgVffy3DNEjGMnmgzulsw5DKssXXNPbNvtGENMyE4iPgHzdkJP4P9yNUOSmmcVLUH3DgL1c-tD9AOIWTMiQtuOZ9Sca74L92wpFAQNtw8C_unlCUuzB390QIBcuRjR58WjbR9q8ofboBinXPdUsW_cgNwqT8VAiR6S0UXzdqy3M_FwMvb0HgjzKCvvi5ImvyAeCk",
            "is_new": False,
            "discount_percent": 0,
        },
        {
            "category": "Outerwear",
            "name": "Structured Blazer",
            "slug": "structured-blazer",
            "description": "Elevate your look with this tailored blazer featuring satin lining.",
            "base_price": Decimal("4625000"),
            "thumbnail": "https://lh3.googleusercontent.com/aida-public/AB6AXuAia8J0xT8QeGNQHqVJLHz1JYjZ01gfWwJRRJmRpocS3i0zEg4ik8Fwe_XxGwhOCap1nc0u_Yshg_upKLSXMDiE3JEP7U5sbdDH887s69kqvu-WhNaSvDfTLM145Kz_GtHMf_4i_PagFagCq8lgHyAjnP0C9SsPLGWg4bxtOHyagD1T5G0vta53CV6_0Kt5FgamFud8EL2jHmNc4IuklJWqgbiDqchGlu2rBzwJmUM5KQcRYR-zSeUh3bLomqMCzu027rBalTZ0raM",
            "is_new": True,
            "discount_percent": 0,
        },
        {
            "category": "Outerwear",
            "name": "Tech Fleece Zip",
            "slug": "tech-fleece-zip",
            "description": "Water resistant tech fleece for active lifestyles.",
            "base_price": Decimal("2375000"),
            "thumbnail": "https://lh3.googleusercontent.com/aida-public/AB6AXuCxyKgVtVY0kT___pDAnWxcUQa6iNJv_Kg2Xjf7V-DnFkYp3gNpVqe_6if0V9W1neB4piDgsWd3uLUdnnUlipdGoiPEUiYeIiGxwKD-Ud7OeODcnLqJoFUids5xaTuL_d47u9EJdxV7sCRXBMipWz4vFPSGmLmASschqVUJ5KZePcUkBi50jNd1vFEpI_uLe5GRzKJ3rUvndO3Z1BBstI8ehFvwqOZnK7aL9QjuGU19pQm4GaT0B9XpNuMh2N3kECcCMEy80ljTFtM",
            "is_new": False,
            "discount_percent": 0,
        },
        {
            "category": "Hoodies",
            "name": "Core Hoodie",
            "slug": "core-hoodie",
            "description": "Fleece lined hoodie for maximum comfort. On sale now!",
            "base_price": Decimal("1875000"),
            "thumbnail": "https://lh3.googleusercontent.com/aida-public/AB6AXuD7XZij8-Dh0yB6Dle4ettsozJSEuakLzxip8Sg2fm_nFW78gzA3_FB4jB1HPmRJOGwfvq_rvvV4_J7lmPypVP3PPJCBEnSDA0AAR5tPQSWcb38D9opdCXQf3fuwg6XbCPkndDLQVUhT-FaFHD4uXuIPjmcFJSosQy1CVEcCwEiMjfszb8rIbNjI8z04qE8n7joYkkksA4CCusO82A9ertkGTiuAweqVmXNWhS0hBTZWjxdYZ5-UbJlGm6aXnROQdN8F5f3H83P08c",
            "is_new": False,
            "discount_percent": 25,
        },
        {
            "category": "Shirts",
            "name": "Summer Linen Shirt",
            "slug": "summer-linen-shirt",
            "description": "Breathable linen fabric perfect for warm weather.",
            "base_price": Decimal("2000000"),
            "thumbnail": "https://lh3.googleusercontent.com/aida-public/AB6AXuA5IMou7SnWz0eActU9SSPJFBa5_-s-uD_U3qZc-c8ieuHqb-WGIyetCo37sR8GvBOOvtVNYuCFlHUw9m7iGNc3d2sbSTM4Op5-sWyOD_gszmNlmFYFCqEql5K6wh0qXTdtUH_WCdcV0Ftr-KJfvgwecIOenLuzlX7qA8OLBOmp-8CXBsWMxD_SiEVkHOqsX0gS-eLQ3FiH2yUd-Fmdh8ksUJWcktI1owhktDl-jh4HLLvrdEzsM1Dv8R7lo_4FUaZGV-wUuslQqL4",
            "is_new": False,
            "discount_percent": 0,
        },
        {
            "category": "Hoodies",
            "name": "Essential Pullover",
            "slug": "essential-pullover",
            "description": "Your everyday go-to hoodie. Soft, comfortable, and stylish.",
            "base_price": Decimal("1625000"),
            "thumbnail": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400",
            "is_new": True,
            "discount_percent": 0,
        },
        {
            "category": "Pants",
            "name": "Slim Fit Chinos",
            "slug": "slim-fit-chinos",
            "description": "Versatile chinos that work for any occasion.",
            "base_price": Decimal("2375000"),
            "thumbnail": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400",
            "is_new": False,
            "discount_percent": 20,
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
        {"name": "Pink", "hex": "#d411d4"},
        {"name": "Black", "hex": "#000000"},
        {"name": "White", "hex": "#ffffff"},
        {"name": "Blue", "hex": "#0ea5e9"},
        {"name": "Green", "hex": "#22c55e"},
    ]
    sizes = ["S", "M", "L", "XL"]
    
    variants = []
    for product in products:
        # Each product gets 2-3 color variants
        for i, color in enumerate(colors[:3]):
            for size in sizes:
                variant = ProductVariant(
                    product_id=product.product_id,
                    sku=f"{product.slug}-{color['name'].lower()}-{size.lower()}",
                    attributes={"color": color["hex"], "color_name": color["name"], "size": size},
                    price=product.base_price,
                    stock=50 - (i * 10),
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
            password_hash=hash_password("admin123"),
            role="manager",
            is_active=True
        ),
        # Regular customers
        User(name="Sarah Mitchell", email="sarah@email.com", password_hash=hash_password("password123"), is_active=True),
        User(name="James Kennedy", email="james@email.com", password_hash=hash_password("password123"), is_active=True),
        User(name="Emily Rodriguez", email="emily@email.com", password_hash=hash_password("password123"), is_active=True),
        User(name="Marcus Thompson", email="marcus@email.com", password_hash=hash_password("password123"), is_active=True),
        User(name="Alex Parker", email="alex@email.com", password_hash=hash_password("password123"), is_active=True),
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
