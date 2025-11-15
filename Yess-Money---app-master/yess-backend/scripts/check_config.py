#!/usr/bin/env python3
"""
Скрипт проверки конфигурации перед запуском приложения.
Проверяет наличие обязательных переменных окружения и их безопасность.
"""

import os
import sys
import secrets
from pathlib import Path
from typing import List, Tuple

# Цвета для вывода
class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


def print_error(message: str):
    print(f"{Colors.RED}❌ ERROR: {message}{Colors.RESET}")


def print_warning(message: str):
    print(f"{Colors.YELLOW}⚠️  WARNING: {message}{Colors.RESET}")


def print_success(message: str):
    print(f"{Colors.GREEN}✅ {message}{Colors.RESET}")


def print_info(message: str):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.RESET}")


def check_secret_key(key_name: str, key_value: str, min_length: int = 32) -> Tuple[bool, str]:
    """Проверяет секретный ключ на безопасность."""
    if not key_value:
        return False, f"{key_name} не установлен"
    
    if key_value in ["CHANGE_ME", "CHANGE_ME_GENERATE_STRONG_SECRET_KEY_MIN_32_CHARS", 
                     "CHANGE_ME_GENERATE_STRONG_JWT_SECRET_KEY_MIN_32_CHARS"]:
        return False, f"{key_name} использует значение по умолчанию"
    
    if len(key_value) < min_length:
        return False, f"{key_name} слишком короткий ({len(key_value)} символов, минимум {min_length})"
    
    return True, f"{key_name} установлен корректно"


def check_database_password(password: str) -> Tuple[bool, str]:
    """Проверяет пароль базы данных."""
    if not password:
        return False, "POSTGRES_PASSWORD не установлен"
    
    if password in ["password", "CHANGE_ME_STRONG_PASSWORD_HERE"]:
        return False, "POSTGRES_PASSWORD использует значение по умолчанию"
    
    if len(password) < 12:
        return False, f"POSTGRES_PASSWORD слишком короткий ({len(password)} символов, минимум 12)"
    
    return True, "POSTGRES_PASSWORD установлен корректно"


def check_cors_origins(origins: str, debug: bool = False) -> Tuple[bool, str]:
    """Проверяет настройки CORS."""
    if not origins:
        return False, "CORS_ORIGINS не установлен"
    
    if origins == "*" and not debug:
        return False, "CORS_ORIGINS установлен на '*' (разрешает все домены) - небезопасно для production!"
    
    if origins == "*" and debug:
        return True, "CORS_ORIGINS установлен на '*' (OK для разработки)"
    
    return True, f"CORS_ORIGINS настроен для {len(origins.split(','))} доменов"


def check_twilio_config() -> Tuple[bool, str]:
    """Проверяет конфигурацию Twilio."""
    account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
    sms_enabled = os.getenv("SMS_ENABLED", "False").lower() == "true"
    
    if not sms_enabled:
        return True, "SMS отключен (OK, если не используется)"
    
    if not account_sid or account_sid.startswith("ACxxxxxxxx"):
        return False, "TWILIO_ACCOUNT_SID не установлен или использует заглушку"
    
    if not auth_token or auth_token == "CHANGE_ME_TWILIO_AUTH_TOKEN":
        return False, "TWILIO_AUTH_TOKEN не установлен или использует заглушку"
    
    return True, "Twilio настроен корректно"


def check_env_file() -> bool:
    """Проверяет наличие .env файла."""
    env_path = Path(".env")
    if not env_path.exists():
        print_warning(".env файл не найден. Создайте его из env.example")
        return False
    return True


def generate_secret_key() -> str:
    """Генерирует безопасный секретный ключ."""
    return secrets.token_urlsafe(32)


def main():
    """Основная функция проверки."""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}")
    print("🔍 ПРОВЕРКА КОНФИГУРАЦИИ YESS LOYALTY")
    print(f"{'='*60}{Colors.RESET}\n")
    
    errors: List[str] = []
    warnings: List[str] = []
    
    # Проверка .env файла
    if not check_env_file():
        errors.append("Отсутствует .env файл")
    
    # Загрузка переменных окружения
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        # Если python-dotenv не установлен, используем системные переменные
        print_info("python-dotenv не установлен, используем системные переменные окружения")
    
    debug = os.getenv("DEBUG", "False").lower() == "true"
    
    # Проверка секретных ключей
    print_info("Проверка секретных ключей...")
    secret_key = os.getenv("SECRET_KEY", "")
    jwt_secret_key = os.getenv("JWT_SECRET_KEY", "")
    
    ok, msg = check_secret_key("SECRET_KEY", secret_key)
    if ok:
        print_success(msg)
    else:
        print_error(msg)
        errors.append(msg)
        print_info(f"Сгенерируйте ключ: {generate_secret_key()}")
    
    ok, msg = check_secret_key("JWT_SECRET_KEY", jwt_secret_key)
    if ok:
        print_success(msg)
    else:
        print_error(msg)
        errors.append(msg)
        print_info(f"Сгенерируйте ключ: {generate_secret_key()}")
    
    # Проверка пароля БД
    print_info("\nПроверка базы данных...")
    db_password = os.getenv("POSTGRES_PASSWORD", "")
    ok, msg = check_database_password(db_password)
    if ok:
        print_success(msg)
    else:
        print_error(msg)
        errors.append(msg)
    
    # Проверка CORS
    print_info("\nПроверка CORS...")
    cors_origins = os.getenv("CORS_ORIGINS", "*")
    ok, msg = check_cors_origins(cors_origins, debug)
    if ok:
        print_success(msg)
    else:
        print_error(msg)
        if not debug:
            errors.append(msg)
        else:
            warnings.append(msg)
    
    # Проверка Twilio
    print_info("\nПроверка Twilio...")
    ok, msg = check_twilio_config()
    if ok:
        print_success(msg)
    else:
        print_warning(msg)
        warnings.append(msg)
    
    # Итоги
    print(f"\n{Colors.BOLD}{'='*60}{Colors.RESET}")
    if errors:
        print_error(f"Найдено {len(errors)} критических ошибок:")
        for error in errors:
            print(f"  • {error}")
        print(f"\n{Colors.RED}❌ Конфигурация не готова к запуску!{Colors.RESET}\n")
        return 1
    elif warnings:
        print_warning(f"Найдено {len(warnings)} предупреждений:")
        for warning in warnings:
            print(f"  • {warning}")
        print(f"\n{Colors.YELLOW}⚠️  Конфигурация готова, но есть предупреждения{Colors.RESET}\n")
        return 0
    else:
        print_success("Все проверки пройдены успешно!")
        print(f"\n{Colors.GREEN}✅ Конфигурация готова к запуску!{Colors.RESET}\n")
        return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:
        print_error(f"Ошибка при проверке: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

