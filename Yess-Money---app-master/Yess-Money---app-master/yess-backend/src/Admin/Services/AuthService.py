from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from src.Admin.Models.AdminUser import AdminUser

class AdminAuthService:
    """Сервис аутентификации администраторов"""
    
    SECRET_KEY = "your-secret-key"  # В реальном проекте использовать из env
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30

    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    @classmethod
    def verify_password(cls, plain_password: str, hashed_password: str) -> bool:
        """Проверка пароля"""
        return cls.pwd_context.verify(plain_password, hashed_password)

    @classmethod
    def get_password_hash(cls, password: str) -> str:
        """Хэширование пароля"""
        return cls.pwd_context.hash(password)

    @classmethod
    def create_access_token(cls, data: Dict[str, Any]) -> str:
        """Создание JWT токена"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=cls.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, cls.SECRET_KEY, algorithm=cls.ALGORITHM)

    @classmethod
    def authenticate_admin(cls, db: Session, username: str, password: str) -> Optional[AdminUser]:
        """Аутентификация администратора"""
        user = db.query(AdminUser).filter(AdminUser.username == username).first()
        if not user:
            return None
        if not cls.verify_password(password, user.password_hash):
            return None
        
        # Обновляем время последнего входа
        user.last_login = datetime.utcnow()
        db.commit()
        
        return user

    @classmethod
    def create_admin_user(
        cls, 
        db: Session, 
        username: str, 
        email: str, 
        password: str, 
        is_superadmin: bool = False
    ) -> AdminUser:
        """Создание нового администратора"""
        hashed_password = cls.get_password_hash(password)
        
        db_user = AdminUser(
            username=username,
            email=email,
            password_hash=hashed_password,
            is_superadmin=is_superadmin,
            is_active=True
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return db_user
