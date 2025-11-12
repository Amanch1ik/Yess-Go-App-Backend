from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.services.route_service import route_service
from app.schemas.route import (
    RouteRequest, 
    RouteResponse, 
    RouteOptimizationRequest,
    RouteNavigationRequest,
    DetailedRouteResponse,
    TransitRouteResponse,
    TransportMode
)
from app.services.auth_service import get_current_user
from app.models.user import User
from app.models.partner import PartnerLocation

router = APIRouter(prefix="/routes", tags=["Routes"])

@router.post("/calculate", response_model=RouteResponse)
async def calculate_route(
    request: RouteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Расчет маршрута между партнерами
    
    Параметры:
    - Список ID локаций партнеров
    - Режим передвижения
    - Оптимизация маршрута
    """
    try:
        route = route_service.calculate_route(db, request)
        return route
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/optimize", response_model=List[int])
async def optimize_route(
    request: RouteOptimizationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Оптимизация порядка посещения партнеров
    
    Параметры:
    - Список ID локаций партнеров
    - Начальная точка (опционально)
    """
    try:
        locations = db.query(PartnerLocation).filter(
            PartnerLocation.id.in_(request.partner_location_ids)
        ).all()

        if request.start_location_id:
            start_location = next(
                (loc for loc in locations if loc.id == request.start_location_id), 
                None
            )
            if start_location:
                locations.remove(start_location)
                locations.insert(0, start_location)

        optimized_route = route_service._optimize_route_order(locations)
        return [loc.id for loc in optimized_route]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/navigation", response_model=RouteResponse)
async def get_navigation(
    request: RouteNavigationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Получение навигации между точками
    
    Параметры:
    - Координаты начальной точки
    - Координаты конечной точки
    - Режим передвижения
    """
    try:
        # Создаем временные локации для расчета
        start_location = PartnerLocation(
            latitude=request.start_latitude, 
            longitude=request.start_longitude
        )
        end_location = PartnerLocation(
            latitude=request.end_latitude, 
            longitude=request.end_longitude
        )

        route_data = route_service._get_route_from_provider(
            locations=[start_location, end_location],
            mode=request.transport_mode
        )

        return RouteResponse(**route_data)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detailed", response_model=DetailedRouteResponse)
async def get_detailed_route(
    request: RouteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Получение детального маршрута с полной информацией
    
    Возвращает:
    - Точное расстояние и время
    - GeoJSON геометрию маршрута
    - Пошаговые инструкции
    - Альтернативные маршруты (если доступны)
    """
    try:
        # Получаем локации партнеров
        locations = db.query(PartnerLocation).filter(
            PartnerLocation.id.in_(request.partner_location_ids)
        ).all()

        if len(locations) < 2:
            raise HTTPException(status_code=400, detail="Требуется минимум две локации")

        # Оптимизация порядка локаций
        if request.optimize_route:
            optimized_locations = route_service._optimize_route_order(locations)
        else:
            optimized_locations = locations

        # Получаем детальный маршрут
        route_data = route_service._get_route_from_provider(
            locations=optimized_locations,
            mode=request.transport_mode or TransportMode.DRIVING
        )

        # Формируем детальный ответ
        return DetailedRouteResponse(
            total_distance=route_data.get("total_distance", "0 km"),
            estimated_time=route_data.get("estimated_time", "0 min"),
            distance_meters=route_data.get("distance_meters"),
            duration_seconds=route_data.get("duration_seconds"),
            route_points=route_data.get("route_points", []),
            geometry=route_data.get("geometry"),
            steps=route_data.get("steps"),
            transport_type=route_data.get("transport_type"),
            alternatives=route_data.get("alternatives")
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/transit", response_model=TransitRouteResponse)
async def get_transit_route(
    request: RouteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Получение маршрута на общественном транспорте
    
    Возвращает:
    - Варианты маршрутов (автобус, троллейбус, маршрутка)
    - Время в пути для каждого варианта
    - Инструкции с пересадками
    - Альтернативные маршруты
    """
    try:
        # Получаем локации партнеров
        locations = db.query(PartnerLocation).filter(
            PartnerLocation.id.in_(request.partner_location_ids)
        ).all()

        if len(locations) < 2:
            raise HTTPException(status_code=400, detail="Требуется минимум две локации")

        # Получаем маршрут на транспорте
        route_data = route_service._get_graphhopper_transit_route(locations)

        return TransitRouteResponse(
            total_distance=route_data.get("total_distance", "0 km"),
            estimated_time=route_data.get("estimated_time", "0 min"),
            transport_type=route_data.get("transport_type", "bus"),
            route_points=route_data.get("route_points", []),
            alternatives=route_data.get("alternatives", []),
            instructions=route_data.get("instructions", [])
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
