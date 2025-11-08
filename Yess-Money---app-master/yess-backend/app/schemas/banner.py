"""Banner schemas"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class BannerResponse(BaseModel):
    """Схема ответа для баннера"""
    id: int
    image_url: str = Field(..., description="URL изображения баннера")
    partner_id: Optional[int] = Field(None, description="ID партнёра, если баннер связан с партнёром")
    partner_name: Optional[str] = Field(None, description="Название партнёра")
    title: Optional[str] = Field(None, description="Заголовок баннера")
    description: Optional[str] = Field(None, description="Описание баннера")
    is_active: bool = Field(True, description="Активен ли баннер")
    order: int = Field(0, description="Порядок отображения")
    link_url: Optional[str] = Field(None, description="Ссылка при клике на баннер")
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

    class Config:
        from_attributes = True  # Pydantic v2
        # orm_mode = True  # Pydantic v1 (legacy)

