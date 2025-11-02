"""
Главный файл FastAPI приложения с оптимизациями
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core.config import settings
from app.core.error_handler import setup_error_handlers
from app.core.performance_middleware import PerformanceMonitoringMiddleware
from app.core.security_middleware import SecurityMiddleware
from app.core.rate_limit import RateLimitMiddleware
from app.api.v1 import api_router
from app.services.cache_service import cache_service

# Настройка логирования
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Создание FastAPI приложения
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Оптимизированный бэкенд для системы лояльности YESS",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)

# Добавление middleware для производительности (добавляем первым для измерения всех запросов)
if settings.ENABLE_PERFORMANCE_MONITORING:
    app.add_middleware(
        PerformanceMonitoringMiddleware,
        slow_request_threshold=1.0  # Логируем запросы дольше 1 секунды
    )
    logger.info("Performance monitoring middleware enabled")

# Добавление security middleware
app.add_middleware(SecurityMiddleware)
logger.info("Security middleware enabled")

# Добавление rate limiting middleware
app.add_middleware(RateLimitMiddleware)
logger.info("Rate limiting middleware enabled")

# Настройка обработчиков ошибок
setup_error_handlers(app)
logger.info("Error handlers configured")

# Подключение роутеров
try:
    app.include_router(api_router, prefix="/api/v1")
except Exception as e:
    logger.warning(f"Could not load some API routers: {e}")

# Подключение дополнительных роутеров
try:
    from app.api.v1 import auth, partner, order, wallet, qr, route, location
    app.include_router(auth.router, prefix="/api/v1")
    app.include_router(partner.router, prefix="/api/v1")
    app.include_router(order.router, prefix="/api/v1")
    app.include_router(wallet.router, prefix="/api/v1")
    app.include_router(qr.router, prefix="/api/v1")
    app.include_router(route.router, prefix="/api/v1")
    app.include_router(location.router, prefix="/api/v1")
except ImportError as e:
    logger.debug(f"Some optional routers not available: {e}")

# Health check эндпоинты
@app.get("/health")
async def health_check():
    """Общая проверка здоровья системы"""
    health_status = {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0"
    }
    
    # Проверка базы данных
    try:
        from app.core.database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        health_status["database"] = "connected"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        health_status["database"] = "disconnected"
        health_status["status"] = "degraded"
    
    # Проверка кэша
    if cache_service:
        cache_health = cache_service.health_check()
        health_status["cache"] = "connected" if cache_health else "disconnected"
        if not cache_health:
            health_status["status"] = "degraded"
    else:
        health_status["cache"] = "not_configured"
    
    status_code = 200 if health_status["status"] == "healthy" else 503
    return JSONResponse(content=health_status, status_code=status_code)


@app.get("/health/db")
async def database_health():
    """Проверка подключения к базе данных"""
    try:
        from app.core.database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return JSONResponse(
            content={"status": "unhealthy", "error": str(e)},
            status_code=503
        )


@app.get("/health/cache")
async def cache_health():
    """Проверка подключения к кэшу"""
    if not cache_service:
        return JSONResponse(
            content={"status": "not_configured", "cache": "Redis not configured"},
            status_code=200
        )
    
    health = cache_service.health_check()
    if health:
        return {"status": "healthy", "cache": "connected"}
    else:
        return JSONResponse(
            content={"status": "unhealthy", "cache": "disconnected"},
            status_code=503
        )


@app.get("/")
async def root():
    """Корневой эндпоинт"""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "version": "1.0.0",
        "docs": "/docs" if settings.DEBUG else "disabled",
        "health": "/health"
    }


# Startup event
@app.on_event("startup")
async def startup_event():
    """Событие при запуске приложения"""
    logger.info(f"Starting {settings.PROJECT_NAME} API server...")
    logger.info(f"Environment: {'Development' if settings.DEBUG else 'Production'}")
    logger.info(f"Performance monitoring: {settings.ENABLE_PERFORMANCE_MONITORING}")
    logger.info(f"Caching enabled: {settings.ENABLE_CACHING}")
    
    # Проверка подключения к кэшу
    if cache_service:
        if cache_service.health_check():
            logger.info("Cache service (Redis) connected successfully")
        else:
            logger.warning("Cache service (Redis) connection failed - continuing without cache")
    else:
        logger.info("Cache service not configured")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Событие при остановке приложения"""
    logger.info(f"Shutting down {settings.PROJECT_NAME} API server...")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )

