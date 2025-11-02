import logging
import structlog
import sys

def configure_logging():
    """
    Настройка глобального логирования с использованием structlog
    """
    # Базовая конфигурация для стандартного logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=logging.INFO
    )

    # Настройка structlog
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer()
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

def get_logger(name=None):
    """
    Получение логгера с поддержкой structlog
    
    Args:
        name (str, optional): Имя логгера. Defaults to None.
    
    Returns:
        structlog.BoundLogger: Сконфигурированный логгер
    """
    return structlog.get_logger(name)

# Автоматическая настройка при импорте
configure_logging()
