"""
Configuration settings for Kyrgyzstan
"""
from pydantic import BaseSettings, PostgresDsn, RedisDsn, validator
from typing import List, Optional, Union, Dict, Any
import os
from functools import lru_cache
import secrets

class Settings(BaseSettings):
    # Project settings
    PROJECT_NAME: str = "Yess Loyalty"
    
    # Database configuration
    POSTGRES_HOST: str = 'localhost'
    POSTGRES_USER: str = 'yess_user'
    POSTGRES_PASSWORD: str = 'password'
    POSTGRES_DB: str = 'yess_loyalty'
    
    # SQLAlchemy Database URI
    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None
    DATABASE_URL: Optional[str] = None
    
    @validator("SQLALCHEMY_DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return PostgresDsn.build(
            scheme="postgresql",
            user=values.get("POSTGRES_USER"),
            password=values.get("POSTGRES_PASSWORD"),
            host=values.get("POSTGRES_HOST"),
            path=f"/{values.get('POSTGRES_DB') or ''}",
        )
    
    @validator("DATABASE_URL", pre=True)
    def assemble_database_url(cls, v: Optional[str], values: Dict[str, Any]) -> str:
        """Создание DATABASE_URL из компонентов"""
        if isinstance(v, str) and v:
            return v
        db_uri = values.get("SQLALCHEMY_DATABASE_URI")
        if db_uri:
            return str(db_uri)
        return f"postgresql://{values.get('POSTGRES_USER')}:{values.get('POSTGRES_PASSWORD')}@{values.get('POSTGRES_HOST')}/{values.get('POSTGRES_DB')}"
    
    # Authentication settings
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Security settings
    CORS_ORIGINS: list = ["http://localhost:3000", "https://yessloyalty.com"]
    
    # External services
    SENTRY_DSN: Optional[str] = None
    
    # Feature flags
    ENABLE_REGISTRATION: bool = True
    ENABLE_TWO_FACTOR_AUTH: bool = False
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False
    BASE_URL: str = "http://localhost:8000"
    
    # Kyrgyzstan Specific Configuration
    COUNTRY_CODE: str = "KG"
    CURRENCY: str = "KGS"
    TIMEZONE: str = "Asia/Bishkek"
    LANGUAGE: str = "kg"
    PHONE_FORMAT: str = "+996XXXXXXXXX"
    DATE_FORMAT: str = "DD.MM.YYYY"
    TIME_FORMAT: str = "HH:MM"
    NUMBER_FORMAT: str = "1 234,56"
    
    # Redis Configuration
    REDIS_URL: RedisDsn
    REDIS_CACHE_EXPIRATION: int = 3600  # 1 hour
    
    # Frontend URLs
    FRONTEND_URL: str = "http://localhost:3000"
    FRONTEND_PROD_URL: str = "https://yess-loyalty.com"
    
    # CORS Configuration
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]
    
    # Logging Configuration
    LOG_LEVEL: str = "INFO"
    LOG_FILE: Optional[str] = None
    
    # Performance Configuration
    REQUEST_TIMEOUT: int = 10  # seconds
    MAX_CONCURRENT_REQUESTS: int = 100
    
    # Feature Flags
    ENABLE_CACHING: bool = True
    ENABLE_PERFORMANCE_MONITORING: bool = True
    
    # Kyrgyzstan Banks Configuration
    OPTIMAL_BANK_API_URL: str = "https://api.optimalbank.kg"
    OPTIMAL_BANK_MERCHANT_ID: str = ""
    OPTIMAL_BANK_SECRET_KEY: str = ""
    
    DEMIR_BANK_API_URL: str = "https://api.demirbank.kg"
    DEMIR_BANK_MERCHANT_ID: str = ""
    DEMIR_BANK_SECRET_KEY: str = ""
    
    RSK_BANK_API_URL: str = "https://api.rskbank.kg"
    RSK_BANK_MERCHANT_ID: str = ""
    RSK_BANK_SECRET_KEY: str = ""
    
    BAKAI_BANK_API_URL: str = "https://api.bakaibank.kg"
    BAKAI_BANK_MERCHANT_ID: str = ""
    BAKAI_BANK_SECRET_KEY: str = ""
    
    ELCART_API_URL: str = "https://api.elcart.kg"
    ELCART_MERCHANT_ID: str = ""
    ELCART_SECRET_KEY: str = ""
    
    # Notification Services
    FCM_SERVER_KEY: str = ""
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""
    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@yess-loyalty.com"
    
    # Business Rules for Kyrgyzstan
    DEFAULT_REFERRAL_BONUS: float = 100.0  # сом
    MIN_TRANSACTION_AMOUNT: float = 10.0  # сом
    MAX_TRANSACTION_AMOUNT: float = 100000.0  # сом
    DEFAULT_CASHBACK_RATE: float = 1.0  # %
    MAX_CASHBACK_RATE: float = 10.0  # %
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60  # seconds
    
    # File Upload
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: List[str] = ["jpg", "jpeg", "png", "gif", "pdf"]
    UPLOAD_DIRECTORY: str = "uploads"
    
    # Notification Settings
    NOTIFICATION_RETRY_ATTEMPTS: int = 3
    NOTIFICATION_RETRY_DELAY: int = 5  # seconds
    PUSH_NOTIFICATION_ENABLED: bool = True
    SMS_NOTIFICATION_ENABLED: bool = True
    EMAIL_NOTIFICATION_ENABLED: bool = True
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

@lru_cache()
def get_settings():
    """
    Cached settings retrieval to improve performance.
    Ensures settings are loaded only once and cached.
    """
    return Settings()

settings = get_settings()

