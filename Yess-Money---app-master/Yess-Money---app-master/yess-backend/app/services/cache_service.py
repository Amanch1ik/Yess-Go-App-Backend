from redis import Redis, ConnectionPool
from redis.exceptions import RedisError, ConnectionError as RedisConnectionError
from typing import Any, Optional, Callable
import json
import hashlib
import logging
from functools import wraps
from app.core.config import settings

logger = logging.getLogger(__name__)

class CacheService:
    """
    Оптимизированный сервис кэширования с connection pooling и улучшенной обработкой ошибок
    """
    def __init__(self, redis_host: str = None, redis_port: int = 6379, redis_url: str = None):
        self.default_expiry = 3600  # 1 час по умолчанию
        
        # Конфигурация connection pool для лучшей производительности
        redis_url = redis_url or str(settings.REDIS_URL) if hasattr(settings, 'REDIS_URL') else None
        
        if redis_url:
            self.pool = ConnectionPool.from_url(
                redis_url,
                max_connections=100,  # Увеличенный пул соединений
                decode_responses=True,
                retry_on_timeout=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
        else:
            redis_host = redis_host or getattr(settings, 'REDIS_HOST', 'redis')
            self.pool = ConnectionPool(
                host=redis_host,
                port=redis_port,
                max_connections=100,
                decode_responses=True,
                retry_on_timeout=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
        
        self.redis = Redis(connection_pool=self.pool)

    def _safe_operation(self, operation: Callable, default: Any = None):
        """Безопасное выполнение операций с Redis с обработкой ошибок"""
        try:
            return operation()
        except (RedisError, RedisConnectionError) as e:
            logger.error(f"Redis operation failed: {e}")
            return default
        except Exception as e:
            logger.error(f"Unexpected error in cache operation: {e}")
            return default

    def set(self, key: str, value: Any, expiry: Optional[int] = None):
        """Установка значения в кэш"""
        expiry = expiry or self.default_expiry
        return self._safe_operation(
            lambda: self.redis.setex(
                key,
                expiry,
                json.dumps(value, default=str)  # Поддержка различных типов
            ),
            False
        )

    def get(self, key: str) -> Optional[Any]:
        """Получение значения из кэша"""
        cached_value = self._safe_operation(lambda: self.redis.get(key))
        if cached_value:
            try:
                return json.loads(cached_value)
            except json.JSONDecodeError:
                logger.error(f"Failed to decode cached value for key: {key}")
                return None
        return None

    def delete(self, key: str):
        """Удаление ключа из кэша"""
        return self._safe_operation(lambda: self.redis.delete(key), 0)

    def delete_pattern(self, pattern: str):
        """Удаление ключей по паттерну"""
        return self._safe_operation(
            lambda: sum([self.redis.delete(key) for key in self.redis.scan_iter(match=pattern)]),
            0
        )

    def clear_cache(self):
        """Полная очистка кэша"""
        return self._safe_operation(lambda: self.redis.flushdb(), False)

    def get_or_set(self, key: str, fetch_func: Callable, expiry: Optional[int] = None) -> Any:
        """Получить из кэша или установить новое значение"""
        cached_value = self.get(key)
        if cached_value is not None:
            return cached_value
        
        # Получаем новое значение
        value = fetch_func()
        self.set(key, value, expiry)
        return value

    def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """Увеличить значение счетчика"""
        return self._safe_operation(lambda: self.redis.incrby(key, amount))

    def expire(self, key: str, seconds: int):
        """Установить время жизни ключа"""
        return self._safe_operation(lambda: self.redis.expire(key, seconds), False)

    def _generate_cache_key(self, func_name: str, args: tuple, kwargs: dict) -> str:
        """Генерация уникального ключа кэша"""
        # Создаем строку из аргументов
        key_data = f"{func_name}:{str(args)}:{str(sorted(kwargs.items()))}"
        # Используем hash для короткого ключа
        key_hash = hashlib.md5(key_data.encode()).hexdigest()
        return f"cache:{func_name}:{key_hash}"

    def cache_method(self, expiry: Optional[int] = None):
        """Декоратор для кэширования методов с улучшенной генерацией ключей"""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                # Создание уникального ключа
                cache_key = self._generate_cache_key(func.__name__, args, kwargs)
                
                # Проверка кэша
                cached_result = self.get(cache_key)
                if cached_result is not None:
                    return cached_result
                
                # Выполнение метода
                result = func(*args, **kwargs)
                
                # Кэширование результата
                self.set(cache_key, result, expiry)
                
                return result
            return wrapper
        return decorator

    def health_check(self) -> bool:
        """Проверка работоспособности Redis"""
        try:
            return self.redis.ping()
        except:
            return False

# Глобальный экземпляр сервиса
try:
    cache_service = CacheService()
except Exception as e:
    logger.warning(f"Failed to initialize cache service: {e}. Using no-op cache.")
    cache_service = None
