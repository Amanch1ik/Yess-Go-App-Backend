"""User schemas"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: str


class UserCreate(UserBase):
    password: str
    city_id: Optional[int] = None
    referral_code: Optional[str] = None  # Код пригласившего


class UserLogin(BaseModel):
    phone: str
    password: str


class UserResponse(UserBase):
    id: int
    city_id: Optional[int]
    referral_code: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: int

