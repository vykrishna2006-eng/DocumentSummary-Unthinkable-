"""
Application configuration via environment variables.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    # API
    app_name: str = "DocuMind"
    app_version: str = "1.0.0"
    debug: bool = False

    # CORS
    allowed_origins: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://documind.vercel.app",
    ]

    # Gemini
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.6-flash"
    fallback_models: List[str] = [
        "gemini-3.6-flash",
        "gemini-3.5-flash",
        "gemini-3.5-flash-lite",
    ]

    # File upload limits
    max_file_size_mb: int = 20
    allowed_extensions: List[str] = ["pdf", "png", "jpg", "jpeg", "webp"]

    # Processing
    chunk_size: int = 2000          # characters per chunk
    chunk_overlap: int = 200        # overlap between chunks
    max_chunks_for_summary: int = 20

    # Summary word targets
    summary_words_executive: int = 100
    summary_words_standard: int = 250
    summary_words_detailed: int = 500

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

