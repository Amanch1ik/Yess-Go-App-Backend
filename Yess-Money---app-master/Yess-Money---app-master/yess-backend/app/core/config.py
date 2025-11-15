import os
import warnings
from functools import lru_cache
from typing import Optional, Dict, Any, List
from pydantic import BaseSettings, validator, Field


class Settings(BaseSettings):
    PROJECT_NAME: str = "Yess Loyalty"

    # Application
    DEBUG: bool = Field(default=False, env="DEBUG")
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    BASE_URL: str = Field(default="http://localhost:8000", env="BASE_URL")
    FRONTEND_URL: str = Field(default="http://localhost:3000", env="FRONTEND_URL")

    # Database
    POSTGRES_HOST: str = Field(default="postgres", env="POSTGRES_HOST")
    POSTGRES_USER: str = Field(default="yess_user", env="POSTGRES_USER")
    POSTGRES_PASSWORD: str = Field(default="", env="POSTGRES_PASSWORD")
    POSTGRES_DB: str = Field(default="yess_db", env="POSTGRES_DB")
    SQLALCHEMY_DATABASE_URI: Optional[str] = Field(default=None, env="DATABASE_URL")
    DATABASE_URL: Optional[str] = Field(default=None, env="DATABASE_URL")

    @validator("SQLALCHEMY_DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v, values: Dict[str, Any]):
        if v:
            return v
        password = values.get("POSTGRES_PASSWORD", "")
        if not password or password in ["password", "CHANGE_ME_STRONG_PASSWORD_HERE"]:
            warnings.warn(
                "⚠️ WARNING: Using default or weak database password! "
                "Change POSTGRES_PASSWORD in .env file for production!",
                UserWarning
            )
        return (
            f"postgresql://{values.get('POSTGRES_USER', 'yess_user')}:{password}"
            f"@{values.get('POSTGRES_HOST', 'postgres')}/{values.get('POSTGRES_DB', 'yess_db')}"
        )

    # Auth & JWT
    SECRET_KEY: str = Field(default="", env="SECRET_KEY")
    JWT_SECRET_KEY: str = Field(default="", env="JWT_SECRET_KEY")
    ALGORITHM: str = "HS256"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days in minutes
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    @validator("SECRET_KEY")
    def validate_secret_key(cls, v):
        if not v or v in ["CHANGE_ME", "CHANGE_ME_GENERATE_STRONG_SECRET_KEY_MIN_32_CHARS"]:
            warnings.warn(
                "⚠️ SECURITY WARNING: SECRET_KEY is not set or using default value! "
                "Generate a strong secret key: python -c \"import secrets; print(secrets.token_urlsafe(32))\"",
                UserWarning
            )
        elif len(v) < 32:
            warnings.warn(
                f"⚠️ SECURITY WARNING: SECRET_KEY is too short ({len(v)} chars). "
                "Use at least 32 characters for production!",
                UserWarning
            )
        return v

    @validator("JWT_SECRET_KEY")
    def validate_jwt_secret_key(cls, v):
        if not v or v in ["CHANGE_ME", "CHANGE_ME_GENERATE_STRONG_JWT_SECRET_KEY_MIN_32_CHARS"]:
            warnings.warn(
                "⚠️ SECURITY WARNING: JWT_SECRET_KEY is not set or using default value! "
                "Generate a strong JWT secret key: python -c \"import secrets; print(secrets.token_urlsafe(32))\"",
                UserWarning
            )
        elif len(v) < 32:
            warnings.warn(
                f"⚠️ SECURITY WARNING: JWT_SECRET_KEY is too short ({len(v)} chars). "
                "Use at least 32 characters for production!",
                UserWarning
            )
        return v

    # CORS
    # 🔓 For development: allow all origins
    # 🔒 For production: restrict to specific domains
    CORS_ORIGINS: List[str] = Field(default=["*"], env="CORS_ORIGINS")

    @validator("CORS_ORIGINS", pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            if v == "*":
                # Warn if using wildcard in production
                if os.getenv("DEBUG", "False").lower() != "true":
                    warnings.warn(
                        "⚠️ SECURITY WARNING: CORS_ORIGINS is set to '*' (allow all). "
                        "This is insecure for production! Set specific domains in CORS_ORIGINS.",
                        UserWarning
                    )
                return ["*"]
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v if isinstance(v, list) else ["*"]

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
    SMS_ENABLED: bool = Field(default=False, env="SMS_ENABLED")
    TWILIO_ACCOUNT_SID: str = Field(
        default="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        env="TWILIO_ACCOUNT_SID",
        description="Twilio Account SID - Get from https://www.twilio.com/console"
    )
    TWILIO_AUTH_TOKEN: str = Field(
        default="CHANGE_ME_TWILIO_AUTH_TOKEN",
        env="TWILIO_AUTH_TOKEN",
        description="Twilio Auth Token - Get from https://www.twilio.com/console"
    )
    TWILIO_FROM_NUMBER: str = Field(
        default="+1234567890",
        env="TWILIO_FROM_NUMBER",
        description="Twilio phone number for sending SMS"
    )
    TWILIO_PHONE_NUMBER: str = Field(
        default="+1234567890",
        env="TWILIO_PHONE_NUMBER",
        description="Alternative name for Twilio phone number"
    )
    TWILIO_VERIFY_SERVICE_SID: str = Field(
        default="VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        env="TWILIO_VERIFY_SERVICE_SID",
        description="Twilio Verify Service SID for 2FA"
    )

    # Push Notifications (Firebase)
    PUSH_ENABLED: bool = Field(default=False, env="PUSH_ENABLED")
    FCM_SERVER_KEY: str = Field(
        default="CHANGE_ME_FIREBASE_SERVER_KEY",
        env="FCM_SERVER_KEY",
        description="Firebase Cloud Messaging Server Key"
    )
    FIREBASE_CREDENTIALS_PATH: str = Field(
        default="",
        env="FIREBASE_CREDENTIALS_PATH",
        description="Path to Firebase credentials JSON file"
    )

    # Email Notifications (SendGrid)
    SENDGRID_API_KEY: str = Field(
        default="SG.CHANGE_ME_SENDGRID_API_KEY",
        env="SENDGRID_API_KEY",
        description="SendGrid API Key - Get from https://app.sendgrid.com"
    )
    FROM_EMAIL: str = Field(default="noreply@yess-loyalty.com", env="FROM_EMAIL")

    # Map Services
    GOOGLE_MAPS_API_KEY: str = Field(
        default="",
        env="GOOGLE_MAPS_API_KEY",
        description="Google Maps API Key (optional)"
    )
    MAPBOX_API_KEY: str = Field(
        default="",
        env="MAPBOX_API_KEY",
        description="Mapbox API Key (optional)"
    )
    
    # OpenStreetMap Routing Services
    OSRM_URL: str = Field(
        default="http://router.project-osrm.org",
        env="OSRM_URL",
        description="OSRM сервер для маршрутизации (OpenStreetMap). По умолчанию публичный сервер"
    )
    OSRM_ENABLED: bool = Field(
        default=True,
        env="OSRM_ENABLED",
        description="Использовать OSRM для маршрутизации (рекомендуется)"
    )
    
    # GraphHopper для общественного транспорта
    GRAPHHOPPER_URL: str = Field(
        default="https://graphhopper.com/api/1",
        env="GRAPHHOPPER_URL",
        description="GraphHopper API URL для детальных маршрутов и транспорта"
    )
    GRAPHHOPPER_API_KEY: str = Field(
        default="",
        env="GRAPHHOPPER_API_KEY",
        description="GraphHopper API Key (опционально, для общественного транспорта)"
    )
    GRAPHHOPPER_ENABLED: bool = Field(
        default=True,
        env="GRAPHHOPPER_ENABLED",
        description="Использовать GraphHopper для общественного транспорта"
    )

    # Business Rules
    TOPUP_MULTIPLIER: float = 1.0  # Bonus multiplier for top-ups

    # Bank Integrations - Optimal Bank
    OPTIMAL_BANK_API_URL: str = Field(
        default="https://api.optimalbank.kg",
        env="OPTIMAL_BANK_API_URL"
    )
    OPTIMAL_BANK_MERCHANT_ID: str = Field(
        default="CHANGE_ME_OPTIMAL_MERCHANT_ID",
        env="OPTIMAL_BANK_MERCHANT_ID"
    )
    OPTIMAL_BANK_SECRET_KEY: str = Field(
        default="CHANGE_ME_OPTIMAL_SECRET_KEY",
        env="OPTIMAL_BANK_SECRET_KEY"
    )

    # Bank Integrations - Demir Bank
    DEMIR_BANK_API_URL: str = Field(
        default="https://api.demirbank.kg",
        env="DEMIR_BANK_API_URL"
    )
    DEMIR_BANK_MERCHANT_ID: str = Field(
        default="CHANGE_ME_DEMIR_MERCHANT_ID",
        env="DEMIR_BANK_MERCHANT_ID"
    )
    DEMIR_BANK_SECRET_KEY: str = Field(
        default="CHANGE_ME_DEMIR_SECRET_KEY",
        env="DEMIR_BANK_SECRET_KEY"
    )

    # Bank Integrations - RSK Bank
    RSK_BANK_API_URL: str = Field(
        default="https://api.rskbank.kg",
        env="RSK_BANK_API_URL"
    )
    RSK_BANK_MERCHANT_ID: str = Field(
        default="CHANGE_ME_RSK_MERCHANT_ID",
        env="RSK_BANK_MERCHANT_ID"
    )
    RSK_BANK_SECRET_KEY: str = Field(
        default="CHANGE_ME_RSK_SECRET_KEY",
        env="RSK_BANK_SECRET_KEY"
    )

    # Bank Integrations - Bakai Bank
    BAKAI_BANK_API_URL: str = Field(
        default="https://api.bakaibank.kg",
        env="BAKAI_BANK_API_URL"
    )
    BAKAI_BANK_MERCHANT_ID: str = Field(
        default="CHANGE_ME_BAKAI_MERCHANT_ID",
        env="BAKAI_BANK_MERCHANT_ID"
    )
    BAKAI_BANK_SECRET_KEY: str = Field(
        default="CHANGE_ME_BAKAI_SECRET_KEY",
        env="BAKAI_BANK_SECRET_KEY"
    )

    # Payment System - Elcart
    ELCART_API_URL: str = Field(
        default="https://api.elcart.kg",
        env="ELCART_API_URL"
    )
    ELCART_MERCHANT_ID: str = Field(
        default="CHANGE_ME_ELCART_MERCHANT_ID",
        env="ELCART_MERCHANT_ID"
    )
    ELCART_SECRET_KEY: str = Field(
        default="CHANGE_ME_ELCART_SECRET_KEY",
        env="ELCART_SECRET_KEY"
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
