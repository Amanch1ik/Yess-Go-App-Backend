"""
Banner router
"""
from fastapi import APIRouter
from app.api.v1.endpoints.banners import router as banners_router

router = APIRouter()
router.include_router(banners_router, tags=["Banners"])





