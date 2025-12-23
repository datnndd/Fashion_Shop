from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings


# Enforce SSL for hosted Postgres (e.g., Supabase/Render)
engine = create_async_engine(
    settings.database_url,
    echo=False,
    future=True,
    pool_pre_ping=True,
    connect_args={
        "ssl": "require",
        "timeout": 30,
        "command_timeout": 30,
        "server_settings": {
            "jit": "off",
        },
    },
)

AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)


async def get_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
