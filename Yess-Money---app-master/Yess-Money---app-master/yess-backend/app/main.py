import warnings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.error_handler import setup_error_handlers
from app.core.performance_middleware import PerformanceMonitoringMiddleware
from app.core.security_middleware import SecurityMiddleware
from app.core.rate_limit import RateLimitMiddleware

# ✅ Единый роутер API v1
from app.api.v1.api_router import api_router


def validate_startup_config():
    """Валидация конфигурации при старте приложения."""
    issues = []
    
    # Проверка секретных ключей
    if not settings.SECRET_KEY or settings.SECRET_KEY in ["CHANGE_ME", "CHANGE_ME_GENERATE_STRONG_SECRET_KEY_MIN_32_CHARS"]:
        issues.append("SECRET_KEY не установлен или использует значение по умолчанию")
    
    if not settings.JWT_SECRET_KEY or settings.JWT_SECRET_KEY in ["CHANGE_ME", "CHANGE_ME_GENERATE_STRONG_JWT_SECRET_KEY_MIN_32_CHARS"]:
        issues.append("JWT_SECRET_KEY не установлен или использует значение по умолчанию")
    
    # Проверка CORS для production
    if not settings.DEBUG and settings.CORS_ORIGINS == ["*"]:
        issues.append("CORS_ORIGINS установлен на '*' в production режиме - небезопасно!")
    
    # Вывод предупреждений
    if issues:
        warning_msg = "\n".join([f"  ⚠️  {issue}" for issue in issues])
        warnings.warn(
            f"\n{'='*60}\n"
            f"⚠️  ПРЕДУПРЕЖДЕНИЯ БЕЗОПАСНОСТИ:\n"
            f"{warning_msg}\n"
            f"{'='*60}\n"
            f"Для проверки конфигурации запустите: python scripts/check_config.py\n"
            f"Подробнее: SECURITY.md\n",
            UserWarning
        )



# Создание FastAPI приложения
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="YESS API Backend",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)


@app.on_event("startup")
async def startup_event():
    """События при старте приложения."""
    validate_startup_config()


# ---- CORS ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---- Middleware ----
if settings.ENABLE_PERFORMANCE_MONITORING:
    app.add_middleware(PerformanceMonitoringMiddleware)

app.add_middleware(SecurityMiddleware)
app.add_middleware(RateLimitMiddleware)

setup_error_handlers(app)


# ✅ Подключаем все API-роуты одним include
app.include_router(api_router, prefix="/api/v1")


# ---- Root endpoint ----
@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "yess-backend",
        "api": "/api/v1",
        "docs": "/docs"
    }


# ---- Local Run ----
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
