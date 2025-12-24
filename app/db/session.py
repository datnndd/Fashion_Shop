import ssl
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings


def _build_connect_args() -> dict:
    """
    Build asyncpg connect args with sensible defaults and configurable SSL.
    
    Render/Supabase require SSL, but local dev (docker, localhost) often does not.
    Use settings.database_sslmode to toggle without code changes.
    """
    args: dict = {
        "timeout": 60,
        "command_timeout": 60,
        "server_settings": {
            "jit": "off",
        },
    }
    sslmode = settings.database_sslmode.lower()
    if sslmode == "disable":
        args["ssl"] = False
    else:
        # default: require SSL
        args["ssl"] = ssl.create_default_context()
    return args


engine = create_async_engine(
    settings.database_url,
    echo=False,
    future=True,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=2,
    pool_timeout=60,
    connect_args=_build_connect_args(),
)

AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)


async def get_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
