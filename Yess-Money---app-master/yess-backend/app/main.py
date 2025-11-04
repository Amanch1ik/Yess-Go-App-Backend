from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.error_handler import setup_error_handlers
from app.core.performance_middleware import PerformanceMonitoringMiddleware
from app.core.security_middleware import SecurityMiddleware
from app.core.rate_limit import RateLimitMiddleware

# ✅ Единый роутер API v1
from app.api.v1.api_router import api_router



# Создание FastAPI приложения
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="YESS API Backend",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)


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
