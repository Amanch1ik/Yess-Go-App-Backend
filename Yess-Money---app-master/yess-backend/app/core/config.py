import os
from functools import lru_cache
from typing import Optional, Dict, Any, List
from pydantic import BaseSettings, validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "Yess Loyalty"

    # Application
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    BASE_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"

    # Database
    POSTGRES_HOST: str = "postgres"
    POSTGRES_USER: str = "yess_user"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "yess_db"
    SQLALCHEMY_DATABASE_URI: Optional[str] = None
    DATABASE_URL: Optional[str] = None  # Alternative database URL

    @validator("SQLALCHEMY_DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v, values: Dict[str, Any]):
        if v:
            return v
        return (
            f"postgresql://{values['POSTGRES_USER']}:{values['POSTGRES_PASSWORD']}"
            f"@{values['POSTGRES_HOST']}/{values['POSTGRES_DB']}"
        )

    # Auth & JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "CHANGE_ME")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "CHANGE_ME")
    ALGORITHM: str = "HS256"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days in minutes
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    # 🔓 For development: allow all origins
    # 🔒 For production: restrict to specific domains
    CORS_ORIGINS: List[str] = os.getenv("CORS_ORIGINS", "*").split(",") if os.getenv("CORS_ORIGINS") != "*" else ["*"]

    # Rate limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_PER_MINUTE: int = 100
    RATE_LIMIT_PER_HOUR: int = 1000

    # Middleware & Monitoring
    ENABLE_PERFORMANCE_MONITORING: bool = False

    # File Uploads & Storage
    UPLOAD_DIRECTORY: str = "/app/uploads"
    UPLOAD_DIR: str = "/app/uploads"  # Alternative name used in storage.py
    MAX_FILE_SIZE: int = 10 * 1024 * 1024
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # Alternative name
    ALLOWED_FILE_TYPES: List[str] = ["jpg", "jpeg", "png", "gif", "pdf"]
    ALLOWED_IMAGE_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "gif"]
    STATIC_URL: str = "/static"

    # AWS S3 Configuration
    USE_S3: bool = False
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    AWS_S3_BUCKET: str = ""

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"
    REDIS_CACHE_TTL: int = 3600  # Default cache TTL in seconds

    # SMS Notifications (Twilio)
    SMS_ENABLED: bool = False
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_FROM_NUMBER: str = os.getenv("TWILIO_FROM_NUMBER", "")
    TWILIO_PHONE_NUMBER: str = os.getenv("TWILIO_PHONE_NUMBER", "")  # Alternative name
    TWILIO_VERIFY_SERVICE_SID: str = os.getenv("TWILIO_VERIFY_SERVICE_SID", "")  # For Verify API

    # Push Notifications (Firebase)
    PUSH_ENABLED: bool = False
    FCM_SERVER_KEY: str = os.getenv("FCM_SERVER_KEY", "")
    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "")

    # Email Notifications (SendGrid)
    SENDGRID_API_KEY: str = os.getenv("SENDGRID_API_KEY", "")
    FROM_EMAIL: str = "noreply@yess-loyalty.com"

    # Map Services
    GOOGLE_MAPS_API_KEY: str = ""
    MAPBOX_API_KEY: str = ""

    # Business Rules
    TOPUP_MULTIPLIER: float = 1.0  # Bonus multiplier for top-ups

    # Bank Integrations - Optimal Bank
    OPTIMAL_BANK_API_URL: str = ""
    OPTIMAL_BANK_MERCHANT_ID: str = ""
    OPTIMAL_BANK_SECRET_KEY: str = ""

    # Bank Integrations - Demir Bank
    DEMIR_BANK_API_URL: str = ""
    DEMIR_BANK_MERCHANT_ID: str = ""
    DEMIR_BANK_SECRET_KEY: str = ""

    # Bank Integrations - RSK Bank
    RSK_BANK_API_URL: str = ""
    RSK_BANK_MERCHANT_ID: str = ""
    RSK_BANK_SECRET_KEY: str = ""

    # Bank Integrations - Bakai Bank
    BAKAI_BANK_API_URL: str = ""
    BAKAI_BANK_MERCHANT_ID: str = ""
    BAKAI_BANK_SECRET_KEY: str = ""

    # Payment System - Elcart
    ELCART_API_URL: str = ""
    ELCART_MERCHANT_ID: str = ""
    ELCART_SECRET_KEY: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
