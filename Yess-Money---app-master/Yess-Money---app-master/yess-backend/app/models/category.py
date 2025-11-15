"""Category models"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Основная информация
    name = Column(String(100), nullable=False, unique=True, index=True)
    slug = Column(String(100), nullable=False, unique=True, index=True)  # URL-friendly версия имени
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)  # Иконка категории (например, "restaurant", "shopping")
    
    # Порядок отображения
    display_order = Column(Integer, default=0, index=True)
    
    # Статусы
    is_active = Column(Boolean, default=True, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    partners = relationship(
        "Partner",
        secondary="partner_categories",
        back_populates="categories"
    )
    
    def __repr__(self):
        return f"<Category(id={self.id}, name='{self.name}', slug='{self.slug}')>"

