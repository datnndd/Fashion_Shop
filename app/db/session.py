import ssl
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.core.config import settings

# --- 1. XỬ LÝ URL DATABASE ---
# Render thường cung cấp URL bắt đầu bằng 'postgres://', nhưng SQLAlchemy cần 'postgresql+asyncpg://'
db_url = str(settings.database_url)
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)

# --- 2. CẤU HÌNH SSL CONTEXT (FIX LỖI RENDER) ---
# Tạo SSL Context chấp nhận chứng chỉ tự ký (Self-signed) của Render/Supabase
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

def _build_connect_args() -> dict:
    """
    Tạo tham số kết nối cho asyncpg.
    Ép buộc sử dụng SSL context đã cấu hình ở trên để tránh lỗi 'CERTIFICATE_VERIFY_FAILED'.
    """
    return {
        "server_settings": {
            "jit": "off",  # Tắt JIT để tối ưu hiệu năng cho query ngắn
        },
        # Truyền object ssl_context vào đây là CHÌA KHÓA để fix lỗi
        "ssl": ssl_context,
    }

# --- 3. KHỞI TẠO ENGINE ---
engine = create_async_engine(
    db_url,
    echo=False,          # Set True nếu muốn xem log SQL khi debug
    pool_pre_ping=True,  # Tự động check kết nối sống trước khi dùng (quan trọng cho Cloud)
    pool_size=10,        # Số lượng kết nối duy trì
    max_overflow=20,     # Số lượng kết nối tối đa khi quá tải
    pool_timeout=60,     # Thời gian chờ lấy kết nối
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