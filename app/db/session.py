import ssl
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.core.config import settings

# --- 1. XỬ LÝ URL DATABASE ---
# Render/Supabase thường cung cấp URL bắt đầu bằng 'postgres://', SQLAlchemy cần 'postgresql+asyncpg://'
db_url = str(settings.database_url)
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)

# --- 2. CẤU HÌNH SSL CONTEXT (FIX LỖI SELF-SIGNED CERT) ---
# Thay vì dùng create_default_context() (vẫn load CA mặc định gây lỗi verify),
# ta dùng SSLContext thuần với PROTOCOL_TLS_CLIENT.
try:
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
except AttributeError:
    # Fallback cho các phiên bản python cũ hơn nếu cần (nhưng bạn đang dùng 3.13 nên block trên sẽ chạy)
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS)
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

def _build_connect_args() -> dict:
    """
    Tạo tham số kết nối cho asyncpg.
    """
    return {
        "server_settings": {
            "jit": "off",
            "application_name": "fastapi_app", # Giúp dễ debug trên Supabase dashboard
        },
        # Truyền object ssl_context đã "tắt" hoàn toàn verify
        "ssl": ssl_context,
    }

# --- 3. KHỞI TẠO ENGINE ---
engine = create_async_engine(
    db_url,
    echo=False,          
    pool_pre_ping=True,  
    pool_size=10,        
    max_overflow=20,     
    pool_timeout=60,     
    # Tăng statement timeout để tránh lỗi timeout nếu mạng chập chờn
    connect_args=_build_connect_args(),
)

# --- 4. TẠO SESSION FACTORY ---
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# --- 5. DEPENDENCY CHO FASTAPI ---
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency function để inject vào các Router.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()