from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    DATABASE_URL: str
    REDIS_URL: str

    COMFYUI_URL: str  # Оставил имя переменной из твоего main.py
    POLZA_API_KEY: str

    FRONTEND_URL: str

    class Config:
        env_file = ".env"


settings = Settings()