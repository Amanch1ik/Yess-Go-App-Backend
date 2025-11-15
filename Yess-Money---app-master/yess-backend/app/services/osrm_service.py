"""
Сервис для маршрутизации через OSRM (Open Source Routing Machine)
Использует данные OpenStreetMap для построения точных маршрутов
"""
import requests
import logging
from typing import Dict, List, Optional, Any
from app.core.config import settings
from app.core.exceptions import ExternalServiceException

logger = logging.getLogger(__name__)


class OSRMService:
    """
    Сервис для работы с OSRM API
    OSRM - это быстрый и точный роутер на основе OpenStreetMap данных
    """
    
    # Публичный OSRM сервер (можно заменить на свой)
    DEFAULT_OSRM_URL = "http://router.project-osrm.org"
    
    @classmethod
    def get_osrm_url(cls) -> str:
        """Получение URL OSRM сервера из настроек или использование дефолтного"""
        return getattr(settings, 'OSRM_URL', cls.DEFAULT_OSRM_URL)
    
    @classmethod
    def get_route(
        cls,
        start_lat: float,
        start_lon: float,
        end_lat: float,
        end_lon: float,
        profile: str = "driving",  # driving, walking, cycling
        alternatives: bool = False,
        steps: bool = True,
        geometries: str = "geojson",  # geojson, polyline, polyline6
        overview: str = "full"  # simplified, full, false
    ) -> Dict[str, Any]:
        """
        Получение маршрута через OSRM
        
        Args:
            start_lat, start_lon: Координаты начала маршрута
            end_lat, end_lon: Координаты конца маршрута
            profile: Профиль маршрута (driving, walking, cycling)
            alternatives: Получить альтернативные маршруты
            steps: Включить пошаговые инструкции
            geometries: Формат геометрии маршрута
            overview: Уровень детализации обзора
        
        Returns:
            Словарь с данными маршрута
        """
        try:
            base_url = cls.get_osrm_url()
            url = f"{base_url}/route/v1/{profile}/{start_lon},{start_lat};{end_lon},{end_lat}"
            
            params = {
                "alternatives": str(alternatives).lower(),
                "steps": str(steps).lower(),
                "geometries": geometries,
                "overview": overview
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("code") != "Ok":
                raise ExternalServiceException(f"OSRM API error: {data.get('message', 'Unknown error')}")
            
            return data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"OSRM API request failed: {e}")
            raise ExternalServiceException(f"Не удалось получить маршрут от OSRM: {e}")
        except Exception as e:
            logger.error(f"OSRM route calculation error: {e}")
            raise ExternalServiceException(f"Ошибка расчета маршрута: {e}")
    
    @classmethod
    def get_route_with_waypoints(
        cls,
        coordinates: List[tuple],  # List of (lat, lon) tuples
        profile: str = "driving",
        steps: bool = True,
        geometries: str = "geojson"
    ) -> Dict[str, Any]:
        """
        Получение маршрута с промежуточными точками
        
        Args:
            coordinates: Список координат [(lat, lon), ...]
            profile: Профиль маршрута
            steps: Включить пошаговые инструкции
            geometries: Формат геометрии
        
        Returns:
            Словарь с данными маршрута
        """
        try:
            if len(coordinates) < 2:
                raise ValueError("Требуется минимум 2 точки для маршрута")
            
            base_url = cls.get_osrm_url()
            
            # Формируем строку координат для OSRM (lon,lat;lon,lat;...)
            coords_string = ";".join([f"{lon},{lat}" for lat, lon in coordinates])
            
            url = f"{base_url}/route/v1/{profile}/{coords_string}"
            
            params = {
                "steps": str(steps).lower(),
                "geometries": geometries,
                "overview": "full"
            }
            
            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("code") != "Ok":
                raise ExternalServiceException(f"OSRM API error: {data.get('message', 'Unknown error')}")
            
            return data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"OSRM API request failed: {e}")
            raise ExternalServiceException(f"Не удалось получить маршрут от OSRM: {e}")
        except Exception as e:
            logger.error(f"OSRM route calculation error: {e}")
            raise ExternalServiceException(f"Ошибка расчета маршрута: {e}")
    
    @classmethod
    def parse_osrm_route(cls, osrm_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Парсинг ответа OSRM в удобный формат
        
        Args:
            osrm_data: Данные от OSRM API
        
        Returns:
            Словарь с распарсенными данными маршрута
        """
        if not osrm_data.get("routes"):
            raise ValueError("Нет маршрутов в ответе OSRM")
        
        route = osrm_data["routes"][0]
        legs = route.get("legs", [])
        
        # Общая информация
        total_distance = route.get("distance", 0) / 1000  # в километрах
        total_duration = route.get("duration", 0) / 60  # в минутах
        
        # Детали маршрута
        route_points = []
        for leg in legs:
            distance_km = leg.get("distance", 0) / 1000
            duration_min = leg.get("duration", 0) / 60
            
            # Координаты начала и конца сегмента
            steps = leg.get("steps", [])
            if steps:
                start_step = steps[0]
                end_step = steps[-1]
                
                start_location = start_step.get("maneuver", {}).get("location", [])
                end_location = end_step.get("maneuver", {}).get("location", [])
                
                route_points.append({
                    "start": {
                        "lat": start_location[1] if len(start_location) > 1 else 0,
                        "lng": start_location[0] if len(start_location) > 0 else 0
                    },
                    "end": {
                        "lat": end_location[1] if len(end_location) > 1 else 0,
                        "lng": end_location[0] if len(end_location) > 0 else 0
                    },
                    "distance": f"{distance_km:.2f} km",
                    "duration": f"{duration_min:.0f} min"
                })
        
        return {
            "total_distance": f"{total_distance:.2f} km",
            "estimated_time": f"{total_duration:.0f} min",
            "distance_meters": int(route.get("distance", 0)),
            "duration_seconds": int(route.get("duration", 0)),
            "route_points": route_points,
            "geometry": route.get("geometry"),  # GeoJSON геометрия маршрута
            "steps": cls._extract_steps(legs)  # Пошаговые инструкции
        }
    
    @classmethod
    def _extract_steps(cls, legs: List[Dict]) -> List[Dict]:
        """Извлечение пошаговых инструкций из маршрута"""
        steps = []
        for leg in legs:
            for step in leg.get("steps", []):
                maneuver = step.get("maneuver", {})
                steps.append({
                    "instruction": maneuver.get("instruction", ""),
                    "type": maneuver.get("type", ""),
                    "modifier": maneuver.get("modifier", ""),
                    "distance": step.get("distance", 0),
                    "duration": step.get("duration", 0),
                    "location": maneuver.get("location", [])
                })
        return steps
    
    @classmethod
    def get_table(
        cls,
        coordinates: List[tuple],
        profile: str = "driving"
    ) -> Dict[str, Any]:
        """
        Получение матрицы расстояний и времени между точками
        
        Полезно для оптимизации маршрута с несколькими точками
        
        Args:
            coordinates: Список координат [(lat, lon), ...]
            profile: Профиль маршрута
        
        Returns:
            Матрица расстояний и времени
        """
        try:
            if len(coordinates) < 2:
                raise ValueError("Требуется минимум 2 точки")
            
            base_url = cls.get_osrm_url()
            coords_string = ";".join([f"{lon},{lat}" for lat, lon in coordinates])
            
            url = f"{base_url}/table/v1/{profile}/{coords_string}"
            
            response = requests.get(url, timeout=15)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("code") != "Ok":
                raise ExternalServiceException(f"OSRM Table API error: {data.get('message', 'Unknown error')}")
            
            return data
            
        except Exception as e:
            logger.error(f"OSRM table calculation error: {e}")
            raise ExternalServiceException(f"Ошибка расчета матрицы расстояний: {e}")

