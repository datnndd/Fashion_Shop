from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from dotenv import load_dotenv

# Explicitly load .env file to ensure environment variables are populated
load_dotenv("app/.env")

class Settings(BaseSettings):
    app_name: str = "Fashion Shop API"
    database_url: str
    secret_key: str = "supersecretkey"
    access_token_expire_minutes: int = 30
    stripe_secret_key: str = "sk_test_PLACEHOLDER"
    allowed_origins: str = os.getenv("ALLOWED_ORIGINS", "*")
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    # Support multiple common names for the key, including the user's specific typo
    supabase_key: str = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_ANNOR_KEY") or ""
    supabase_bucket: str = os.getenv("SUPABASE_BUCKET", "images")

    model_config = SettingsConfigDict(env_file="app/.env", extra="ignore")


settings = Settings()

print(f"--- CONFIG DEBUG ---")
print(f"SUPABASE_URL set: {'Yes' if settings.supabase_url else 'No'}")
print(f"SUPABASE_KEY set: {'Yes' if settings.supabase_key else 'No'}")
print(f"SUPABASE_BUCKET: {settings.supabase_bucket}")
print(f"--------------------")

