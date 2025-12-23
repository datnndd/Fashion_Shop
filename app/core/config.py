from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Fashion Shop API"
    database_url: str
    secret_key: str = "supersecretkey"
    access_token_expire_minutes: int = 30
    stripe_secret_key: str = "sk_test_PLACEHOLDER"
    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(env_file="app/.env", extra="ignore")


settings = Settings()
