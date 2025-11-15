"""
Сервис для маршрутизации через GraphHopper
Поддерживает общественный транспорт и более детальные маршруты
"""
import requests
import logging
from typing import Dict, List, Optional, Any
from app.core.config import settings
from app.core.exceptions import ExternalServiceException

logger = logging.getLogger(__name__)


class GraphHopperService:
    """
    Сервис для работы с GraphHopper API
    GraphHopper поддерживает общественный транспорт и более детальные маршруты
    """
    
    # Публичный GraphHopper сервер (можно заменить на свой)
    DEFAULT_GRAPHHOPPER_URL = "https://graphhopper.com/api/1"
    
    @classmethod
    def get_graphhopper_url(cls) -> str:
        """Получение URL GraphHopper сервера из настроек"""
        return getattr(settings, 'GRAPHHOPPER_URL', cls.DEFAULT_GRAPHHOPPER_URL)
    
    @classmethod
    def get_api_key(cls) -> Optional[str]:
        """Получение API ключа GraphHopper"""
        return getattr(settings, 'GRAPHHOPPER_API_KEY', None)
    
    @classmethod
    def get_route(
        cls,
        start_lat: float,
        start_lon: float,
        end_lat: float,
        end_lon: float,
        vehicle: str = "car",  # car, foot, bike, bus, train
        points_encoded: bool = False,
        instructions: bool = True,
        calc_points: bool = True
    ) -> Dict[str, Any]:
        """
        Получение маршрута через GraphHopper
        
        Args:
            start_lat, start_lon: Координаты начала
            end_lat, end_lon: Координаты конца
            vehicle: Тип транспорта (car, foot, bike, bus, train)
            points_encoded: Кодировать точки
            instructions: Включить инструкции
            calc_points: Рассчитать точки маршрута
        
        Returns:
            Словарь с данными маршрута
        """
        try:
            base_url = cls.get_graphhopper_url()
            api_key = cls.get_api_key()
            
            if not api_key:
                raise ExternalServiceException("GraphHopper API key не настроен")
            
            url = f"{base_url}/route"
            
            params = {
                "key": api_key,
                "point": [f"{start_lat},{start_lon}", f"{end_lat},{end_lon}"],
                "vehicle": vehicle,
                "points_encoded": str(points_encoded).lower(),
                "instructions": str(instructions).lower(),
                "calc_points": str(calc_points).lower()
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("message"):
                raise ExternalServiceException(f"GraphHopper API error: {data.get('message')}")
            
            return data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"GraphHopper API request failed: {e}")
            raise ExternalServiceException(f"Не удалось получить маршрут от GraphHopper: {e}")
        except Exception as e:
            logger.error(f"GraphHopper route calculation error: {e}")
            raise ExternalServiceException(f"Ошибка расчета маршрута: {e}")
    
    @classmethod
    def get_transit_route(
        cls,
        start_lat: float,
        start_lon: float,
        end_lat: float,
        end_lon: float
    ) -> Dict[str, Any]:
        """
        Получение маршрута на общественном транспорте
        
        Возвращает варианты маршрутов с пересадками
        
        Args:
            start_lat, start_lon: Координаты начала
            end_lat, end_lon: Координаты конца
        
        Returns:
            Словарь с вариантами маршрутов на транспорте
        """
        try:
            # Для общественного транспорта используем специальный endpoint
            # GraphHopper может использовать GTFS данные для общественного транспорта
            base_url = cls.get_graphhopper_url()
            api_key = cls.get_api_key()
            
            if not api_key:
                raise ExternalServiceException("GraphHopper API key не настроен")
            
            # Пробуем получить маршрут для разных типов транспорта
            routes = []
            
            for vehicle in ["bus", "train", "tram"]:
                try:
                    route = cls.get_route(
                        start_lat, start_lon,
                        end_lat, end_lon,
                        vehicle=vehicle
                    )
                    
                    if route.get("paths"):
                        path = route["paths"][0]
                        routes.append({
                            "vehicle": vehicle,
                            "distance": path.get("distance", 0) / 1000,  # км
                            "time": path.get("time", 0) / 1000 / 60,  # минуты
                            "points": path.get("points", {}),
                            "instructions": path.get("instructions", [])
                        })
                except Exception as e:
                    logger.warning(f"Failed to get route for {vehicle}: {e}")
                    continue
            
            # Сортируем по времени
            routes.sort(key=lambda x: x["time"])
            
            return {
                "routes": routes,
                "best_route": routes[0] if routes else None,
                "alternatives": routes[1:] if len(routes) > 1 else []
            }
            
        except Exception as e:
            logger.error(f"GraphHopper transit route error: {e}")
            raise ExternalServiceException(f"Ошибка расчета маршрута на транспорте: {e}")
    
    @classmethod
    def parse_graphhopper_route(cls, gh_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Парсинг ответа GraphHopper в удобный формат
        
        Args:
            gh_data: Данные от GraphHopper API
        
        Returns:
            Словарь с распарсенными данными маршрута
        """
        if not gh_data.get("paths"):
            raise ValueError("Нет маршрутов в ответе GraphHopper")
        
        path = gh_data["paths"][0]
        
        distance_km = path.get("distance", 0) / 1000
        time_min = path.get("time", 0) / 1000 / 60
        
        instructions = path.get("instructions", [])
        
        return {
            "total_distance": f"{distance_km:.2f} km",
            "estimated_time": f"{time_min:.0f} min",
            "distance_meters": int(path.get("distance", 0)),
            "duration_seconds": int(path.get("time", 0) / 1000),
            "instructions": [
                {
                    "text": inst.get("text", ""),
                    "distance": inst.get("distance", 0),
                    "time": inst.get("time", 0) / 1000,
                    "sign": inst.get("sign", 0)
                }
                for inst in instructions
            ],
            "points": path.get("points", {})
        }

