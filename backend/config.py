from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_ENV_FILE = Path(__file__).resolve().parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    supabase_url: str = ""
    supabase_key: str = ""
    supabase_service_key: str = ""
    frontend_url: str = "http://localhost:5173"
    environment: str = "development"
    port: int = 8000
    app_name: str = "CareerGPS AI"
    app_version: str = "1.0.0"


@lru_cache
def get_settings() -> Settings:
    return Settings()
