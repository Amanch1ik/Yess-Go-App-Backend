import requests
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from geopy.distance import geodesic

from app.models.partner import PartnerLocation
from app.schemas.route import (
    RouteRequest, 
    RouteResponse, 
    RouteOptimizationRequest,
    TransportMode
)
from app.core.config import settings
from app.core.exceptions import ExternalServiceException
from app.services.osrm_service import OSRMService
from app.services.graphhopper_service import GraphHopperService

logger = logging.getLogger(__name__)

class RouteService:
    GOOGLE_MAPS_API_URL = "https://maps.googleapis.com/maps/api/directions/json"
    MAPBOX_API_URL = "https://api.mapbox.com/directions/v5/mapbox"

    @classmethod
    def calculate_route(
        cls, 
        db: Session, 
        request: RouteRequest
    ) -> RouteResponse:
        """
        Построение маршрута между партнерами
        Поддерживает несколько провайдеров карт
        """
        try:
            # Получаем локации партнеров
            locations = db.query(PartnerLocation).filter(
                PartnerLocation.id.in_(request.partner_location_ids)
            ).all()

            if len(locations) < 2:
                raise ValueError("Требуется минимум две локации для построения маршрута")

            # Оптимизация порядка локаций
            optimized_locations = cls._optimize_route_order(locations)

            # Выбор провайдера карт
            route_data = cls._get_route_from_provider(
                locations=optimized_locations, 
                mode=request.transport_mode or TransportMode.DRIVING
            )

            return RouteResponse(**route_data)

        except Exception as e:
            logger.error(f"Route calculation error: {e}")
            raise ExternalServiceException(f"Не удалось построить маршрут: {e}")

    @classmethod
    def _get_route_from_provider(
        cls, 
        locations: List[PartnerLocation], 
        mode: TransportMode = TransportMode.DRIVING
    ) -> Dict[str, Any]:
        """
        Получение маршрута от провайдера карт
        Приоритет: OSRM (OpenStreetMap) → GraphHopper (для транспорта) → Google Maps → Mapbox → Fallback
        
        OSRM используется по умолчанию, так как он бесплатный и использует данные OpenStreetMap
        """
        try:
            # Для общественного транспорта используем GraphHopper
            if mode == TransportMode.TRANSIT:
                try:
                    return cls._get_graphhopper_transit_route(locations)
                except Exception as e:
                    logger.warning(f"GraphHopper transit route failed: {e}, falling back to OSRM")
            
            # Пробуем OSRM (OpenStreetMap) - приоритет для автомобильных маршрутов
            try:
                return cls._get_osrm_route(locations, mode)
            except Exception as e:
                logger.warning(f"OSRM route failed: {e}, trying alternatives")
            
            # Fallback на GraphHopper
            try:
                return cls._get_graphhopper_route(locations, mode)
            except Exception as e:
                logger.warning(f"GraphHopper route failed: {e}, trying alternatives")
            
            # Fallback на Google Maps
            if settings.GOOGLE_MAPS_API_KEY:
                try:
                    return cls._get_google_maps_route(locations, mode)
                except Exception as e:
                    logger.warning(f"Google Maps route failed: {e}")
            
            # Fallback на Mapbox
            if settings.MAPBOX_API_KEY:
                try:
                    return cls._get_mapbox_route(locations, mode)
                except Exception as e:
                    logger.warning(f"Mapbox route failed: {e}")
            
            # Последний fallback - простой расчет
            return cls._calculate_simple_route(locations)

        except Exception as e:
            logger.warning(f"All map providers failed: {e}")
            return cls._calculate_simple_route(locations)

    @classmethod
    def _get_google_maps_route(
        cls, 
        locations: List[PartnerLocation], 
        mode: TransportMode
    ) -> Dict[str, Any]:
        """Получение маршрута через Google Maps API"""
        waypoints = [
            f"{loc.latitude},{loc.longitude}" for loc in locations[1:-1]
        ]

        params = {
            "origin": f"{locations[0].latitude},{locations[0].longitude}",
            "destination": f"{locations[-1].latitude},{locations[-1].longitude}",
            "waypoints": "|".join(waypoints),
            "mode": mode.value.lower(),
            "key": settings.GOOGLE_MAPS_API_KEY
        }

        response = requests.get(cls.GOOGLE_MAPS_API_URL, params=params)
        data = response.json()

        if data['status'] != 'OK':
            raise ExternalServiceException("Ошибка Google Maps API")

        route = data['routes'][0]
        return {
            "total_distance": route['legs'][-1]['distance']['text'],
            "estimated_time": route['legs'][-1]['duration']['text'],
            "route_points": [
                {
                    "start": leg['start_location'],
                    "end": leg['end_location'],
                    "distance": leg['distance']['text'],
                    "duration": leg['duration']['text']
                } for leg in route['legs']
            ]
        }

    @classmethod
    def _get_mapbox_route(
        cls, 
        locations: List[PartnerLocation], 
        mode: TransportMode
    ) -> Dict[str, Any]:
        """Получение маршрута через Mapbox API"""
        coordinates = ";".join([
            f"{loc.longitude},{loc.latitude}" for loc in locations
        ])

        url = f"{cls.MAPBOX_API_URL}/{mode.value.lower()}/{coordinates}"
        params = {
            "access_token": settings.MAPBOX_API_KEY,
            "geometries": "geojson",
            "overview": "full"
        }

        response = requests.get(url, params=params)
        data = response.json()

        if data.get('code') != 'Ok':
            raise ExternalServiceException("Ошибка Mapbox API")

        return {
            "total_distance": f"{data['routes'][0]['distance'] / 1000:.2f} km",
            "estimated_time": f"{data['routes'][0]['duration'] / 60:.0f} min",
            "route_points": []  # Можно добавить детали
        }

    @classmethod
    def _calculate_simple_route(
        cls, 
        locations: List[PartnerLocation]
    ) -> Dict[str, Any]:
        """
        Простой расчет расстояния между точками
        Используется как fallback
        """
        total_distance = 0
        route_points = []

        for i in range(len(locations) - 1):
            start = locations[i]
            end = locations[i + 1]

            distance = geodesic(
                (start.latitude, start.longitude),
                (end.latitude, end.longitude)
            ).kilometers

            total_distance += distance
            route_points.append({
                "start": {"lat": start.latitude, "lng": start.longitude},
                "end": {"lat": end.latitude, "lng": end.longitude},
                "distance": f"{distance:.2f} km"
            })

        return {
            "total_distance": f"{total_distance:.2f} km",
            "estimated_time": f"{total_distance * 10:.0f} min",  # Примерная оценка
            "route_points": route_points
        }

    @classmethod
    def _optimize_route_order(
        cls, 
        locations: List[PartnerLocation]
    ) -> List[PartnerLocation]:
        """
        Оптимизация порядка локаций
        Используется алгоритм ближайшего соседа
        """
        if len(locations) <= 2:
            return locations

        unvisited = locations[1:]
        optimized = [locations[0]]

        while unvisited:
            current = optimized[-1]
            nearest = min(
                unvisited, 
                key=lambda loc: geodesic(
                    (current.latitude, current.longitude),
                    (loc.latitude, loc.longitude)
                ).kilometers
            )
            optimized.append(nearest)
            unvisited.remove(nearest)

        return optimized
    
    @classmethod
    def _get_osrm_route(
        cls,
        locations: List[PartnerLocation],
        mode: TransportMode
    ) -> Dict[str, Any]:
        """
        Получение маршрута через OSRM (OpenStreetMap)
        
        OSRM - быстрый и точный роутер на основе OpenStreetMap данных
        """
        # Преобразуем TransportMode в профиль OSRM
        profile_map = {
            TransportMode.DRIVING: "driving",
            TransportMode.WALKING: "walking",
            TransportMode.BICYCLING: "cycling",
            TransportMode.TRANSIT: "driving"  # OSRM не поддерживает транспорт напрямую
        }
        
        profile = profile_map.get(mode, "driving")
        
        # Формируем список координат
        coordinates = [(loc.latitude, loc.longitude) for loc in locations]
        
        # Получаем маршрут через OSRM
        osrm_data = OSRMService.get_route_with_waypoints(
            coordinates=coordinates,
            profile=profile,
            steps=True,
            geometries="geojson"
        )
        
        # Парсим ответ
        return OSRMService.parse_osrm_route(osrm_data)
    
    @classmethod
    def _get_graphhopper_route(
        cls,
        locations: List[PartnerLocation],
        mode: TransportMode
    ) -> Dict[str, Any]:
        """
        Получение маршрута через GraphHopper
        """
        # Преобразуем TransportMode в vehicle GraphHopper
        vehicle_map = {
            TransportMode.DRIVING: "car",
            TransportMode.WALKING: "foot",
            TransportMode.BICYCLING: "bike",
            TransportMode.TRANSIT: "bus"
        }
        
        vehicle = vehicle_map.get(mode, "car")
        
        # Для нескольких точек используем первую и последнюю
        # GraphHopper может обрабатывать waypoints, но для простоты используем start/end
        start = locations[0]
        end = locations[-1]
        
        gh_data = GraphHopperService.get_route(
            start_lat=start.latitude,
            start_lon=start.longitude,
            end_lat=end.latitude,
            end_lon=end.longitude,
            vehicle=vehicle,
            instructions=True
        )
        
        return GraphHopperService.parse_graphhopper_route(gh_data)
    
    @classmethod
    def _get_graphhopper_transit_route(
        cls,
        locations: List[PartnerLocation]
    ) -> Dict[str, Any]:
        """
        Получение маршрута на общественном транспорте через GraphHopper
        
        Возвращает варианты маршрутов с пересадками
        """
        start = locations[0]
        end = locations[-1]
        
        transit_data = GraphHopperService.get_transit_route(
            start_lat=start.latitude,
            start_lon=start.longitude,
            end_lat=end.latitude,
            end_lon=end.longitude
        )
        
        # Форматируем ответ
        if transit_data.get("best_route"):
            best = transit_data["best_route"]
            return {
                "total_distance": f"{best['distance']:.2f} km",
                "estimated_time": f"{best['time']:.0f} min",
                "transport_type": best["vehicle"],
                "route_points": [],
                "alternatives": [
                    {
                        "transport_type": alt["vehicle"],
                        "distance": f"{alt['distance']:.2f} km",
                        "time": f"{alt['time']:.0f} min"
                    }
                    for alt in transit_data.get("alternatives", [])
                ],
                "instructions": best.get("instructions", [])
            }
        else:
            raise ExternalServiceException("Не найдено маршрутов на общественном транспорте")

# Singleton
route_service = RouteService()
