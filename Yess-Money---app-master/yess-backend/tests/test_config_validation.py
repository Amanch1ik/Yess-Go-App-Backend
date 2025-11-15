"""
Тесты для валидации конфигурации
"""
import pytest
import os
from unittest.mock import patch
from app.core.config import Settings


class TestConfigValidation:
    """Тесты валидации конфигурации"""
    
    def test_production_config_validates_secret_key(self):
        """Тест валидации SECRET_KEY в продакшене"""
        with patch.dict(os.environ, {
            "APP_ENV": "production",
            "SECRET_KEY": "CHANGE_ME",
            "JWT_SECRET_KEY": "test-jwt-key"
        }):
            with pytest.raises(ValueError, match="SECRET_KEY должен быть установлен"):
                Settings()
    
    def test_production_config_validates_jwt_secret_key(self):
        """Тест валидации JWT_SECRET_KEY в продакшене"""
        with patch.dict(os.environ, {
            "APP_ENV": "production",
            "SECRET_KEY": "test-secret-key-32-chars-long-enough",
            "JWT_SECRET_KEY": "CHANGE_ME"
        }):
            with pytest.raises(ValueError, match="JWT_SECRET_KEY должен быть установлен"):
                Settings()
    
    def test_production_config_warns_about_debug(self):
        """Тест предупреждения о DEBUG в продакшене"""
        with patch.dict(os.environ, {
            "APP_ENV": "production",
            "SECRET_KEY": "test-secret-key-32-chars-long-enough",
            "JWT_SECRET_KEY": "test-jwt-key",
            "DEBUG": "True"
        }):
            with pytest.warns(UserWarning, match="DEBUG или DEVELOPMENT_MODE"):
                Settings()
    
    def test_production_config_validates_cors(self):
        """Тест валидации CORS в продакшене"""
        with patch.dict(os.environ, {
            "APP_ENV": "production",
            "SECRET_KEY": "test-secret-key-32-chars-long-enough",
            "JWT_SECRET_KEY": "test-jwt-key",
            "CORS_ORIGINS": '["*"]'
        }):
            with pytest.raises(ValueError, match="CORS_ORIGINS не должен содержать"):
                Settings()
    
    def test_development_config_allows_defaults(self):
        """Тест что в development режиме разрешены значения по умолчанию"""
        with patch.dict(os.environ, {
            "APP_ENV": "development",
            "SECRET_KEY": "CHANGE_ME"
        }, clear=False):
            # Не должно быть ошибок
            settings = Settings()
            assert settings.SECRET_KEY == "CHANGE_ME"

