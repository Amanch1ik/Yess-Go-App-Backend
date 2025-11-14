"""Wallet schemas"""
from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from typing import Optional


class WalletResponse(BaseModel):
    id: int
    user_id: int
    balance: Decimal  # Баланс в сомах
    yescoin_balance: Decimal  # Виртуальная монета Yess!Coin
    total_earned: Optional[Decimal] = Decimal('0.00')
    total_spent: Optional[Decimal] = Decimal('0.00')
    last_updated: datetime
    
    class Config:
        from_attributes = True


class WalletSyncRequest(BaseModel):
    """Запрос на синхронизацию баланса"""
    user_id: int
    device_id: Optional[str] = None  # ID устройства для отслеживания


class WalletSyncResponse(BaseModel):
    """Ответ на синхронизацию"""
    success: bool
    yescoin_balance: Decimal
    last_updated: datetime
    has_changes: bool  # Были ли изменения с последней синхронизации


class TopUpRequest(BaseModel):
    user_id: int
    amount: Decimal


class TopUpResponse(BaseModel):
    transaction_id: int
    payment_url: str
    qr_code_data: str

