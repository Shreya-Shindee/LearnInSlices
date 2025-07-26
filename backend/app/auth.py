"""
Authentication Service
JWT-based authentication with secure token management

Features:
- User registration and login
- JWT token generation and validation
- Password hashing and verification
- Token refresh mechanism
- Session management
"""

import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from passlib.hash import bcrypt
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models import User
from app.schemas import UserCreate, UserLogin, TokenResponse, UserResponse

logger = logging.getLogger(__name__)

# Configuration
SECRET_KEY = "your-secret-key-here"  # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """
    Authentication service for user management and JWT tokens
    """
    
    def __init__(self):
        self.secret_key = SECRET_KEY
        self.algorithm = ALGORITHM
        self.access_token_expire = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        self.refresh_token_expire = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    def hash_password(self, password: str) -> str:
        """Hash a password"""
        return pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def create_access_token(self, data: Dict[str, Any]) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + self.access_token_expire
        to_encode.update({"exp": expire, "type": "access"})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def create_refresh_token(self, data: Dict[str, Any]) -> str:
        """Create JWT refresh token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + self.refresh_token_expire
        to_encode.update({"exp": expire, "type": "refresh"})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("Token has expired")
            return None
        except jwt.JWTError as e:
            logger.warning(f"Token verification failed: {e}")
            return None
    
    async def create_user(self, db: Session, user_data: UserCreate) -> User:
        """Create a new user"""
        try:
            # Check if user already exists
            existing_user = db.query(User).filter(
                or_(User.email == user_data.email, User.username == user_data.username)
            ).first()
            
            if existing_user:
                if existing_user.email == user_data.email:
                    raise ValueError("Email already registered")
                else:
                    raise ValueError("Username already taken")
            
            # Hash password
            hashed_password = self.hash_password(user_data.password)
            
            # Create user
            user = User(
                email=user_data.email,
                username=user_data.username,
                hashed_password=hashed_password,
                full_name=user_data.full_name,
                daily_goal_minutes=user_data.daily_goal_minutes or 15
            )
            
            db.add(user)
            await db.commit()
            await db.refresh(user)
            
            logger.info(f"User created successfully: {user.username}")
            return user
            
        except Exception as e:
            await db.rollback()
            logger.error(f"User creation failed: {e}")
            raise
    
    async def authenticate_user(self, db: Session, credentials: UserLogin) -> User:
        """Authenticate user with credentials"""
        try:
            # Find user by email or username
            user = db.query(User).filter(
                or_(User.email == credentials.email_or_username,
                    User.username == credentials.email_or_username)
            ).first()
            
            if not user:
                raise ValueError("Invalid credentials")
            
            if not self.verify_password(credentials.password, user.hashed_password):
                raise ValueError("Invalid credentials")
            
            if not user.is_active:
                raise ValueError("Account is disabled")
            
            # Update last login
            user.last_login = datetime.utcnow()
            await db.commit()
            
            logger.info(f"User authenticated successfully: {user.username}")
            return user
            
        except Exception as e:
            logger.error(f"Authentication failed: {e}")
            raise
    
    async def create_tokens(self, user_id: str) -> TokenResponse:
        """Create access and refresh tokens for user"""
        token_data = {"sub": str(user_id)}
        
        access_token = self.create_access_token(token_data)
        refresh_token = self.create_refresh_token(token_data)
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    
    async def refresh_tokens(self, db: Session, refresh_token: str) -> TokenResponse:
        """Refresh access token using refresh token"""
        try:
            # Verify refresh token
            payload = self.verify_token(refresh_token)
            if not payload or payload.get("type") != "refresh":
                raise ValueError("Invalid refresh token")
            
            user_id = payload.get("sub")
            if not user_id:
                raise ValueError("Invalid token payload")
            
            # Verify user still exists and is active
            user = db.query(User).filter(
                and_(User.id == user_id, User.is_active == True)
            ).first()
            
            if not user:
                raise ValueError("User not found or inactive")
            
            # Create new tokens
            new_tokens = await self.create_tokens(user_id)
            new_tokens.user = UserResponse.from_orm(user)
            
            return new_tokens
            
        except Exception as e:
            logger.error(f"Token refresh failed: {e}")
            raise
    
    async def get_user_from_token(self, db: Session, token: str) -> Optional[User]:
        """Get user from access token"""
        try:
            payload = self.verify_token(token)
            if not payload or payload.get("type") != "access":
                return None
            
            user_id = payload.get("sub")
            if not user_id:
                return None
            
            user = db.query(User).filter(
                and_(User.id == user_id, User.is_active == True)
            ).first()
            
            return user
            
        except Exception as e:
            logger.error(f"User retrieval from token failed: {e}")
            return None


# Dependency for getting current user
async def get_current_user(
    token: str = Depends(HTTPBearer()),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to get current authenticated user"""
    auth_service = AuthService()
    
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    user = await auth_service.get_user_from_token(db, token.credentials)
    if user is None:
        raise credentials_exception
    
    return user
