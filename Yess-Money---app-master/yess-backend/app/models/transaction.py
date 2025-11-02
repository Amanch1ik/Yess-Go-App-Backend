"""Transaction model"""
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Text, CheckConstraint, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String(50), nullable=False, index=True)  # topup, discount, bonus, refund
    amount = Column(Numeric(10, 2), nullable=False)
    balance_before = Column(Numeric(10, 2))
    balance_after = Column(Numeric(10, 2))
    status = Column(String(50), nullable=False, index=True)  # pending, completed, failed
    payment_url = Column(String(500))
    qr_code_data = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    completed_at = Column(DateTime)
    
    __table_args__ = (
        CheckConstraint('amount > 0', name='check_positive_amount'),
        # Составные индексы для оптимизации запросов
        Index('idx_transaction_user_status', 'user_id', 'status', 'created_at'),
        Index('idx_transaction_type_status', 'type', 'status', 'created_at'),
        Index('idx_transaction_date_range', 'created_at', 'status'),
    )
    
    # Relationships
    user = relationship("User", back_populates="transactions")

