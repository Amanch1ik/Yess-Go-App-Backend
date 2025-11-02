from datetime import datetime, timedelta
from typing import Optional, Dict, Any

import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.core.exceptions import AuthenticationException

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify a plain password against its hash
        
        Args:
            plain_password (str): Password in plain text
            hashed_password (str): Hashed password from database
        
        Returns:
            bool: True if password is correct, False otherwise
        """
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        """
        Hash a password for storing
        
        Args:
            password (str): Plain text password
        
        Returns:
            str: Hashed password
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
        
        Args:
            data (Dict[str, Any]): Payload data for the token
            expires_delta (Optional[timedelta]): Token expiration time
        
        Returns:
            str: Encoded JWT token
        """
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        
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
        Authenticate a user by phone number and password
        
        Args:
            db (Session): Database session
            phone_number (str): User's phone number
            password (str): User's password
        
        Returns:
            Optional[User]: Authenticated user or None
        """
        user = db.query(User).filter(User.phone_number == phone_number).first()
        
        if not user:
            raise AuthenticationException("Пользователь не найден")
        
        if not cls.verify_password(password, user.hashed_password):
            raise AuthenticationException("Неверный пароль")
        
        return user

    @classmethod
    def register_user(
        cls, 
        db: Session, 
        phone_number: str, 
        password: str, 
        **kwargs
    ) -> User:
        """
        Register a new user
        
        Args:
            db (Session): Database session
            phone_number (str): User's phone number
            password (str): User's password
            **kwargs: Additional user details
        
        Returns:
            User: Created user
        """
        # Check if user already exists
        existing_user = db.query(User).filter(User.phone_number == phone_number).first()
        
        if existing_user:
            raise AuthenticationException("Пользователь с таким номером телефона уже существует")
        
        hashed_password = cls.get_password_hash(password)
        
        new_user = User(
            phone_number=phone_number,
            hashed_password=hashed_password,
            **kwargs
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return new_user
