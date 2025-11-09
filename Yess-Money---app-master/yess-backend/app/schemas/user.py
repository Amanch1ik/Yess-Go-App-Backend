"""User schemas"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    phone_number: str = Field(..., description="Номер телефона пользователя")
    first_name: str = Field(..., description="Имя пользователя")
    last_name: str = Field(..., description="Фамилия пользователя")
    email: Optional[EmailStr] = None


class UserCreate(BaseModel):
    phone_number: str = Field(..., description="Номер телефона пользователя")
    password: str = Field(..., description="Пароль пользователя")
    first_name: str = Field(..., description="Имя пользователя")
    last_name: str = Field(..., description="Фамилия пользователя")
    city_id: Optional[int] = None
    referral_code: Optional[str] = None  # Код пригласившего


class UserLogin(BaseModel):
    phone_number: str = Field(..., description="Номер телефона")
    password: str = Field(..., description="Пароль")


class UserResponse(BaseModel):
    id: int
    phone_number: str
    first_name: str
    last_name: str
    email: Optional[str] = None
    city_id: Optional[int] = None
    referral_code: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: Optional[int] = None
    user: Optional["UserResponse"] = None


class VerificationCodeRequest(BaseModel):
    phone_number: str = Field(..., description="Номер телефона для отправки кода")


class VerifyCodeRequest(BaseModel):
    phone_number: str = Field(..., description="Номер телефона")
    code: str = Field(..., min_length=4, max_length=10, description="Код подтверждения")
    password: str = Field(..., min_length=6, description="Пароль пользователя")
    first_name: str = Field(..., description="Имя пользователя")
    last_name: str = Field(..., description="Фамилия пользователя")
    city_id: Optional[int] = None
    referral_code: Optional[str] = None
