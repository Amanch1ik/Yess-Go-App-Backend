from datetime import datetime, timedelta
from typing import Optional, Dict, Any

import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings
from app.models.user import User
from app.models.wallet import Wallet
from app.core.exceptions import AuthenticationException
<<<<<<< HEAD
from app.core.database import get_db
=======
from app.core.database import SessionLocal
from app.core.notifications import sms_service
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


class AuthService:
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify a plain password against its hash
        """
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        """
        Hash a password for storing
        """
        return pwd_context.hash(password)

    @classmethod
    def create_access_token(
            cls,
            data: Dict[str, Any],
            expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Create a JWT access token
        """
        to_encode = data.copy()

        expire = datetime.utcnow() + (
            expires_delta if expires_delta else timedelta(minutes=15)
        )
        to_encode.update({"exp": expire})

        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
        return encoded_jwt

    @classmethod
    def authenticate_user(
            cls,
            db: Session,
            phone_number: str,
            password: str
    ) -> Optional[User]:
        """
        Authenticate a user by phone number + password
        """
        user = db.query(User).filter(User.phone == phone_number).first()

        if not user:
            raise AuthenticationException("Пользователь не найден")

        if not cls.verify_password(password, user.password_hash):
            raise AuthenticationException("Неверный пароль")

        return user

    @classmethod
    def register_user(
            cls,
            db: Session,
            phone_number: str,
            password: str,
            first_name: str,
            last_name: str,
            **kwargs
    ) -> User:
        """
        Register a new user
        """
        existing_user = db.query(User).filter(User.phone == phone_number).first()
        if existing_user:
            raise AuthenticationException("Пользователь с таким номером телефона уже существует")

        hashed_password = cls.get_password_hash(password)

        new_user = User(
            phone=phone_number,
            password_hash=hashed_password,
            first_name=first_name,
            last_name=last_name,
            name=f"{first_name} {last_name}",
            **kwargs
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Создаём кошелёк для нового пользователя
        wallet = Wallet(
            user_id=new_user.id,
            balance=0.00
        )
        db.add(wallet)
        db.commit()

        return new_user

    @classmethod
    async def send_verification_code(
        cls,
        db: Session,
        phone_number: str
    ) -> dict:
        """
        Отправка SMS-кода на номер телефона через Twilio Verify
        """
        # Проверяем, не зарегистрирован ли уже пользователь
        existing_user = db.query(User).filter(User.phone == phone_number).first()
        if existing_user and existing_user.phone_verified:
            raise AuthenticationException("Пользователь с таким номером уже зарегистрирован")
        
        # Отправляем код через Twilio Verify
        result = await sms_service.send_verification_code(phone_number)
        
        if not result.get("success"):
            raise AuthenticationException(f"Не удалось отправить код: {result.get('error', 'Unknown error')}")
        
        # Сохраняем информацию о верификации (опционально, для логирования)
        if existing_user:
            existing_user.verification_expires_at = datetime.utcnow() + timedelta(minutes=10)
        else:
            # Создаем временную запись
            temp_user = User(
                phone=phone_number,
                phone_verified=False,
                is_active=False
            )
            db.add(temp_user)
        
        db.commit()
        
        response = {"message": "Код отправлен", "sid": result.get("sid")}
        
        # В DEBUG режиме добавляем дополнительную информацию для тестирования
        if settings.DEBUG:
            response["debug_info"] = {
                "phone": phone_number,
                "status": result.get("status"),
                "note": "В Trial режиме Twilio отправляет SMS только на верифицированный номер. Проверьте SMS на телефоне или Twilio Dashboard."
            }
        
        return response

    @classmethod
    async def verify_code_and_register(
        cls,
        db: Session,
        phone_number: str,
        code: str,
        password: str,
        first_name: str,
        last_name: str,
        **kwargs
    ) -> User:
        """
        Проверка кода через Twilio Verify и завершение регистрации
        """
        # Проверяем код через Twilio Verify
        verify_result = await sms_service.verify_code(phone_number, code)
        
        if not verify_result.get("valid"):
            raise AuthenticationException("Неверный или истекший код подтверждения")
        
        # Находим или создаем пользователя
        user = db.query(User).filter(User.phone == phone_number).first()
        
        if user and user.phone_verified and user.password_hash:
            raise AuthenticationException("Пользователь уже зарегистрирован")
        
        # Завершаем регистрацию
        hashed_password = cls.get_password_hash(password)
        
        if user:
            # Обновляем существующую запись
            user.password_hash = hashed_password
            user.first_name = first_name
            user.last_name = last_name
            user.name = f"{first_name} {last_name}"
            user.phone_verified = True
            user.is_active = True
            user.verification_code = None
            user.verification_expires_at = None
        else:
            # Создаем нового пользователя
            user = User(
                phone=phone_number,
                password_hash=hashed_password,
                first_name=first_name,
                last_name=last_name,
                name=f"{first_name} {last_name}",
                phone_verified=True,
                is_active=True,
                **kwargs
            )
            db.add(user)
        
        db.commit()
        db.refresh(user)
        
        # Создаём кошелёк, если его ещё нет
        existing_wallet = db.query(Wallet).filter(Wallet.user_id == user.id).first()
        if not existing_wallet:
            wallet = Wallet(
                user_id=user.id,
                balance=0.00
            )
            db.add(wallet)
            db.commit()
        
        return user


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Extract and return the current authenticated user from JWT
    Использует dependency injection для сессии БД вместо создания новой
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Токен истек",
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный токен",
        )

    user_id = payload.get("sub")

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невалидный токен",
        )

    # Используем переданную сессию вместо создания новой
    user = db.query(User).filter(User.id == int(user_id)).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Пользователь деактивирован",
        )

    return user
