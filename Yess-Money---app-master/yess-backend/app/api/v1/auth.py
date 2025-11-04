"""
Authentication endpoints
"""
from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.services.auth_service import AuthService, get_current_user
from app.schemas.user import UserCreate, UserResponse, TokenResponse
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
) -> Any:
    """
    Регистрация нового пользователя
    """
    try:
        new_user = AuthService.register_user(
            db=db,
            phone=user_data.phone,
            password=user_data.password,
            name=user_data.name,
            city_id=user_data.city_id,
            referral_code=user_data.referral_code
        )

        return UserResponse.from_orm(new_user)

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Any:
    """
    Аутентификация пользователя
    """
    try:
        user = AuthService.authenticate_user(
            db=db,
            phone=form_data.username,
            password=form_data.password
        )

        access_token = AuthService.create_access_token({"sub": str(user.id)})
        refresh_token = AuthService.create_refresh_token({"sub": str(user.id)})

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user_id=user.id
        )

    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Получение данных текущего пользователя
    """
    return current_user
