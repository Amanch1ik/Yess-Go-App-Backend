"""Wallet model"""
from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Wallet(Base):
    __tablename__ = "wallets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    
    # Баланс в сомах (для пополнения)
    balance = Column(Numeric(10, 2), default=0.00, nullable=False)
    
    # Виртуальная монета Yess!Coin (основная валюта лояльности)
    yescoin_balance = Column(Numeric(10, 2), default=0.00, nullable=False)
    
    # Статистика
    total_earned = Column(Numeric(10, 2), default=0.00)  # Всего заработано
    total_spent = Column(Numeric(10, 2), default=0.00)  # Всего потрачено
    
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, index=True)
    
    __table_args__ = (
        CheckConstraint('balance >= 0', name='check_positive_balance'),
        CheckConstraint('yescoin_balance >= 0', name='check_positive_yescoin_balance'),
        CheckConstraint('total_earned >= 0', name='check_positive_total_earned'),
        CheckConstraint('total_spent >= 0', name='check_positive_total_spent'),
        Index('idx_wallet_user_updated', 'user_id', 'last_updated'),
    )
    
    # Relationships
    user = relationship("User", back_populates="wallet")

