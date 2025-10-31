"""
Application Configuration
Loads environment variables and provides centralized config access
"""

from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    app_name: str = "EdTech Diagnostic API"
    environment: str = "development"
    debug: bool = True
    api_prefix: str = "/api"

    # Supabase
    supabase_url: str
    supabase_key: str

    # Google Gemini API (FREE)
    google_api_key: str = ""

    # Caching
    cache_dir: Path = Path(".cache")
    cache_enabled: bool = True

    # File Uploads
    upload_dir: Path = Path("uploads")
    max_upload_size_mb: int = 50

    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    # Frontend URL for generating shareable links
    frontend_url: str = "http://localhost:3000"

    # Email/SMTP Configuration
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    bot_email: str = ""
    bot_password: str = ""

    # SendGrid Configuration (preferred for production)
    sendgrid_api_key: str = ""
    from_email: str = ""

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Ensure cache directory exists
        if self.cache_enabled:
            self.cache_dir.mkdir(parents=True, exist_ok=True)
        # Ensure upload directory exists
        self.upload_dir.mkdir(parents=True, exist_ok=True)


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance
    Uses lru_cache to avoid re-reading .env on every call
    """
    return Settings()


# Convenience access
settings = get_settings()
