"""
Database connection and session management with optimized pooling
"""
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from sqlalchemy.engine import Engine
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Оптимизированная конфигурация пула соединений для production
engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI or settings.DATABASE_URL,
    pool_pre_ping=True,  # Проверка соединений перед использованием
    pool_size=20,  # Увеличено с 10 до 20
    max_overflow=40,  # Увеличено с 20 до 40
    pool_recycle=3600,  # Переиспользование соединений каждый час
    pool_timeout=30,  # Таймаут получения соединения
    echo=False,  # Отключено логирование SQL в production
    connect_args={
        "connect_timeout": 10,
        "application_name": "yess_backend"
    }
)

# Обработчик событий для логирования медленных запросов
import time

@event.listens_for(Engine, "before_cursor_execute")
def receive_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    conn.info.setdefault('query_start_time', []).append(time.time())

@event.listens_for(Engine, "after_cursor_execute")
def receive_after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    if conn.info.get('query_start_time'):
        start_time = conn.info['query_start_time'].pop(-1)
        total = time.time() - start_time
        if total > 1.0:  # Логируем запросы дольше 1 секунды
            logger.warning(f"Slow query detected ({total:.2f}s): {statement[:100]}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency for getting DB session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

