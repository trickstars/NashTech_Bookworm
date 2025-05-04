# app/services/auth_service.py
from typing import Optional
from sqlmodel import Session, select
from datetime import timedelta
import jwt
from fastapi import HTTPException, status

from app.models import User
from app.services.users_service import get_user_by_email, get_user_by_id
from app.utils.security import verify_password, create_access_token, create_refresh_token, verify_token_and_get_payload
from app.config import settings
# from app.schemas.token import TokenData
# from app.dependencies import SessionDep

def authenticate_user(session: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(session, email)
    if not user:
        return None
    if not verify_password(password, user.password):
        return None
    return user

def refresh_token_service(session: Session, token: str) -> dict[str, any]:
    # Gọi hàm xác thực tập trung
    # Hàm này sẽ raise HTTPException nếu token không hợp lệ hoặc hết hạn
    payload = verify_token_and_get_payload(token)

    user_id: str | None = payload.get("sub") # Đã được kiểm tra tồn tại trong helper
    token_type: str | None = payload.get("type")

    # Kiểm tra logic cụ thể cho refresh token SAU KHI đã xác thực cơ bản
    if token_type != "refresh":
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type, expected 'refresh'",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = get_user_by_id(session, user_id=user_id) # Lấy user từ DB bằng ID

    if user is None: # Chỉ cần kiểm tra user tồn tại
        # User trong token không còn tồn tại trong DB
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found for refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Tạo token mới (logic giữ nguyên)
    access_token_data = {"sub": str(user.id), "user_id": user.id, "user_fullname": user.first_name + " " + user.last_name, "user_email": user.email}

    new_access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    new_access_token = create_access_token(
        data = access_token_data, expires_delta=new_access_token_expires
    )

    new_refresh_token_expires = timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    new_refresh_token = create_refresh_token(
        data={"sub": str(user.id)}, expires_delta=new_refresh_token_expires
    )

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }
