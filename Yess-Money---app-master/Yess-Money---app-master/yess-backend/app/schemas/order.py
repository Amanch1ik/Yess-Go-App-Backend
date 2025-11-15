"""Order schemas"""
from pydantic import BaseModel
from decimal import Decimal


class OrderCalculateRequest(BaseModel):
    user_id: int
    partner_id: int
    order_total: Decimal


class OrderCalculateResponse(BaseModel):
    max_discount: Decimal
    user_balance: Decimal
    actual_discount: Decimal
    final_amount: Decimal


class OrderConfirmRequest(BaseModel):
    user_id: int
    partner_id: int
    order_total: Decimal
    discount: Decimal
    idempotency_key: str


class OrderConfirmResponse(BaseModel):
    success: bool
    message: str
    order_id: int
    new_balance: Decimal
    discount: Decimal
    final_amount: Decimal

