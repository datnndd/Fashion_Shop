from pydantic import Field, AliasChoices
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Fashion Shop API"
    database_url: str
    database_sslmode: str = "require"  # require|disable
    secret_key: str = "supersecretkey"
    access_token_expire_minutes: int = 30
    stripe_secret_key: str = "sk_test_PLACEHOLDER"
    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    
    supabase_url: str = ""
    # Support multiple names for the key, including the user's specific typo
    supabase_key: str = Field(
        default="",
        validation_alias=AliasChoices("SUPABASE_KEY", "SUPABASE_ANON_KEY", "SUPABASE_ANNOR_KEY")
    )
    supabase_bucket: str = "images"

    model_config = SettingsConfigDict(env_file="app/.env", extra="ignore")


settings = Settings()

