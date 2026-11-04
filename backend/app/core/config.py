"""Core settings and configuration module."""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import List
import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="allow")

    PROJECT_NAME: str = "EchoPulse AI Messaging API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Meta Model API
    MODEL_API_KEY: str = ""
    META_TRANSLATION_MODEL: str = "muse-spark-1.3"
    META_TRANSCRIPTION_MODEL: str = "muse-voice-transcribe-1.0"
    META_API_BASE_URL: str = "https://api.meta.ai/v1"

    # Security
    SECRET_KEY: str = "echopulse-hackathon-insecure-dev-secret-key-32charsmin!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Database
    DATABASE_URL: str = "sqlite:///./echopulse.db"

    # Uploads & Audio
    UPLOAD_DIR: str = "./uploads"
    MAX_AUDIO_SIZE_BYTES: int = 26214400  # 25 MB

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://localhost:3000",
    ]

    # TTS
    TTS_PROVIDER: str = "browser_delegated"
    TTS_API_KEY: str = ""

settings = Settings()
