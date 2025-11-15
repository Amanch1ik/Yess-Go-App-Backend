from fastapi import APIRouter
import logging

logger = logging.getLogger(__name__)

# Импортируем роутеры
from app.api.v1 import auth
from app.api.v1 import routes
from app.api.v1 import location
from app.api.v1 import partner
from app.api.v1 import wallet
from app.api.v1 import order
from app.api.v1 import upload
from app.api.v1 import qr
from app.api.v1 import banner

api_router = APIRouter()

# Основные маршруты
api_router.include_router(auth.router, tags=["Auth"])
api_router.include_router(routes.router, prefix="/routes", tags=["Routes"])
api_router.include_router(location.router, prefix="/locations", tags=["Locations"])
api_router.include_router(partner.router, prefix="/partners", tags=["Partners"])
api_router.include_router(wallet.router, prefix="/wallet", tags=["Wallet"])
api_router.include_router(order.router, prefix="/orders", tags=["Orders"])
api_router.include_router(upload.router, prefix="/upload", tags=["Upload"])
api_router.include_router(qr.router, prefix="/qr", tags=["QR"])
api_router.include_router(banner.router, prefix="/banners", tags=["Banners"])

# Optional routers - try to import if available
try:
    from app.api.v1 import unified
    api_router.include_router(unified.router, prefix="/unified", tags=["Unified"])
except ImportError as e:
    logger.warning(f"unified router not available: {e}")
