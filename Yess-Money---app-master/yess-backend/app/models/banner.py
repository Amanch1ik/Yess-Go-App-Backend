"""
Модель для баннеров
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from datetime import datetime


class Banner(Base):
    """Баннеры для главной страницы"""
    __tablename__ = "banners"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Изображение баннера
    image_url = Column(String(500), nullable=False)
    
    # Связь с партнёром (опционально)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=True, index=True)
    
    # Название и описание
    title = Column(String(255), nullable=True)
    description = Column(String(500), nullable=True)
    
    # Статус и порядок отображения
    is_active = Column(Boolean, default=True, index=True)
    display_order = Column(Integer, default=0, index=True)
    
    # Ссылка (опционально)
    link_url = Column(String(500), nullable=True)
    
    # Временные рамки
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    partner = relationship("Partner", back_populates="banners", lazy="select")
    
    def __repr__(self):
        return f"<Banner(id={self.id}, title={self.title}, is_active={self.is_active})>"

