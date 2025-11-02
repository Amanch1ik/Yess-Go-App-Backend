"""Order model"""
from sqlalchemy import Column, Integer, Numeric, String, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=False, index=True)
    order_total = Column(Numeric(10, 2), nullable=False)
    discount = Column(Numeric(10, 2), nullable=False)
    final_amount = Column(Numeric(10, 2), nullable=False)
    idempotency_key = Column(String(255), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    __table_args__ = (
        CheckConstraint('order_total >= 0', name='check_positive_total'),
        CheckConstraint('discount >= 0', name='check_positive_discount'),
        CheckConstraint('discount <= order_total', name='check_discount_not_exceeds_total'),
    )
    
    # Relationships
    user = relationship("User", back_populates="orders")
    partner = relationship("Partner", back_populates="orders")

