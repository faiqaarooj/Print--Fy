import secrets
import datetime
from typing import Optional
from fastapi import Request, HTTPException, Depends, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt, JWTError
from .config import SECRET_KEY, ALGORITHM, SESSION_COOKIE_NAME
from .database import get_db
from .models import User
from .schemas import UserProfile

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_session_token(user_id: int) -> str:
    expire = datetime.datetime.utcnow() + datetime.timedelta(days=7)
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "iat": datetime.datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user_optional(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if not token:
        # Check authorization header as fallback
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        return None

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            return None
        return db.query(User).filter(User.id == int(user_id)).first()
    except (JWTError, ValueError):
        return None

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    user = get_current_user_optional(request, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthenticated. Please log in."
        )
    return user

def require_operator(user: User = Depends(get_current_user)) -> User:
    if user.role not in ["operator", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Operator access required."
        )
    return user

def user_to_profile(user: User) -> UserProfile:
    name_parts = (user.name or "").split()
    initials = "".join([p[0] for p in name_parts if p])[:2].upper() or "U"
    return UserProfile(
        id=user.id,
        name=user.name,
        email=user.email,
        studentId=user.student_id,
        role=user.role,
        title=user.title,
        initials=initials
    )
