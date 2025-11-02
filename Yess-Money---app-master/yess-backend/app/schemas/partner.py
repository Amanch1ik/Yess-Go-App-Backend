"""Partner schemas"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from decimal import Decimal

class PartnerBase(BaseModel):
    id: int
    name: str
    category: str
    logo_url: Optional[str] = None

class PartnerRecommendation(PartnerBase):
    cashback_rate: float = Field(
        ..., 
        description="Персонализированный кешбэк для пользователя",
        ge=0, 
        le=100
    )
    
    @validator('cashback_rate')
    def validate_cashback_rate(cls, v):
        if v < 0 or v > 100:
            raise ValueError('Кешбэк должен быть в диапазоне от 0 до 100')
        return round(v, 2)

class PartnerDetail(PartnerBase):
    description: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    default_cashback_rate: float = Field(
        ..., 
        description="Базовый кешбэк партнера",
        ge=0, 
        le=100
    )
    current_promotions: Optional[List[str]] = None

class PartnerCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    category: str = Field(..., min_length=2, max_length=50)
    logo_url: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    default_cashback_rate: float = Field(
        default=5.0, 
        ge=0, 
        le=100, 
        description="Базовый процент кешбэка"
    )

class PartnerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    category: Optional[str] = Field(None, min_length=2, max_length=50)
    logo_url: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    default_cashback_rate: Optional[float] = Field(
        None, 
        ge=0, 
        le=100, 
        description="Базовый процент кешбэка"
    )

class PartnerLocationResponse(BaseModel):
    id: int
    partner_id: int
    partner_name: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone_number: Optional[str] = None
    working_hours: Optional[str] = None
    max_discount_percent: float

class NearbyPartnerRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="Широта")
    longitude: float = Field(..., ge=-180, le=180, description="Долгота")
    radius: float = Field(default=10, ge=0.1, le=100, description="Радиус поиска в километрах")

class RouteRequest(BaseModel):
    partner_location_ids: List[int] = Field(..., min_items=2, description="Список ID локаций партнеров")

class RouteResponse(BaseModel):
    route_points: List[Dict[str, Any]]
    total_distance: float
    estimated_time: int  # Время в минутах

class LocationUpdateRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="Широта")
    longitude: float = Field(..., ge=-180, le=180, description="Долгота")
    
    @validator('latitude', 'longitude')
    def validate_coordinates(cls, v):
        if v is None:
            raise ValueError("Координаты не могут быть пустыми")
        return v

class PartnerFilterRequest(BaseModel):
    """
    Расширенный фильтр для поиска партнеров
    """
    categories: Optional[List[str]] = Field(
        default=None, 
        description="Список категорий для фильтрации"
    )
    min_cashback: Optional[float] = Field(
        default=None, 
        ge=0, 
        le=100, 
        description="Минимальный процент кешбэка"
    )
    max_distance: Optional[float] = Field(
        default=None, 
        ge=0, 
        description="Максимальное расстояние в километрах"
    )
    is_verified: Optional[bool] = Field(
        default=None, 
        description="Только проверенные партнеры"
    )
    working_hours: Optional[str] = Field(
        default=None, 
        description="Фильтр по времени работы"
    )
    tags: Optional[List[str]] = Field(
        default=None, 
        description="Дополнительные теги для фильтрации"
    )

class PartnerSortRequest(BaseModel):
    """
    Параметры сортировки партнеров
    """
    sort_by: Optional[str] = Field(
        default='distance', 
        description="Поле для сортировки"
    )
    sort_order: Optional[str] = Field(
        default='asc', 
        description="Направление сортировки"
    )

class PartnerSearchRequest(BaseModel):
    """
    Комплексный запрос для поиска партнеров
    """
    query: Optional[str] = Field(
        default=None, 
        description="Текстовый поиск по названию или описанию"
    )
    filter: Optional[PartnerFilterRequest] = Field(
        default=None, 
        description="Параметры фильтрации"
    )
    sort: Optional[PartnerSortRequest] = Field(
        default=None, 
        description="Параметры сортировки"
    )
    page: int = Field(default=1, ge=1, description="Номер страницы")
    page_size: int = Field(default=10, ge=1, le=100, description="Количество результатов на странице")

    @validator('query')
    def validate_query(cls, v):
        if v and len(v) < 2:
            raise ValueError("Запрос должен содержать не менее 2 символов")
        return v

