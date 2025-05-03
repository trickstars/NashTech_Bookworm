# app/utils/security.py
from datetime import datetime, timedelta, timezone
# from typing import Optional, Dict, Any
from fastapi import HTTPException, status

import jwt
from passlib.context import CryptContext

from ..config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Password Hashing ---
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# --- JWT Token Handling ---
ALGORITHM = settings.ALGORITHM
SECRET_KEY = settings.SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_MINUTES = settings.REFRESH_TOKEN_EXPIRE_MINUTES

# --- Hàm helper nội bộ ---
def _create_token(
    data: dict[str, any],
    token_type: str, # "access" hoặc "refresh"
    expires_delta: timedelta
) -> str:
    """Hàm nội bộ tạo JWT với type và thời gian hết hạn cụ thể."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire, "type": token_type})

    # Đảm bảo có 'sub' claim
    if "sub" not in to_encode or to_encode["sub"] is None:
        raise ValueError("Subject ('sub') claim is required and cannot be null in token data")

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_access_token(data: dict[str, any], expires_delta: timedelta | None = None) -> str:
    """Tạo JWT access token."""
    if expires_delta:
        delta = expires_delta
    else:
        delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return _create_token(data=data, token_type="access", expires_delta=delta)

def create_refresh_token(data:dict[str, any], expires_delta: timedelta | None = None) -> str:
    """Tạo JWT refresh token."""
    if expires_delta:
        delta = expires_delta
    else:
        delta = timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    # Đảm bảo refresh token chỉ chứa thông tin cần thiết (thường là 'sub')
    # Tránh đưa các thông tin nhạy cảm hoặc không cần thiết vào refresh token
    refresh_data = {"sub": data.get("user_email") or data.get("sub")} # Chỉ lấy subject
    if not refresh_data["sub"]: # ky qua ??
         raise ValueError("Cannot create refresh token without subject ('sub') in data")

    return _create_token(data=refresh_data, token_type="refresh", expires_delta=delta)

# --- Hàm mới: Xác thực token và lấy payload ---
def verify_token_and_get_payload(token: str) -> dict[str, any]:
    """
    Giải mã, xác thực chữ ký và thời gian hết hạn của token.
    Trả về payload nếu hợp lệ, ngược lại raise HTTPException.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials", # Thông báo chung chung hơn
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_expired_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token has expired",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token, SECRET_KEY, algorithms=[ALGORITHM] # Tự động kiểm tra exp và signature
        )
        # Kiểm tra xem 'sub' có tồn tại không (bước xác thực payload cơ bản)
        if payload.get("sub") is None:
             print("Token missing 'sub' claim") # Logging
             raise credentials_exception
        return payload
    except jwt.ExpiredSignatureError:
        print("Token expired during verification") # Logging
        raise token_expired_exception
    except jwt.InvalidTokenError as e: # Lỗi signature hoặc cấu trúc token sai
        print(f"Invalid token during verification: {e}") # Logging
        raise credentials_exception
    except Exception as e: # Bắt các lỗi không mong muốn khác
        print(f"Unexpected error during token verification: {e}") # Logging
        raise credentials_exception