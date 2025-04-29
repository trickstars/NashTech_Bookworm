from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from pydantic import ValidationError

from ..config import settings
from .db_dep import SessionDep
from ..schemas.token import TokenData

from ..models import User

from ..services.auth_service import get_user_by_username

from ..utils.security import verify_token_and_get_payload

# --- OAuth2 Scheme ---
# URL trỏ đến endpoint lấy token ban đầu
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# --- Dependency get_current_user (kiểm tra access token) ---
async def get_current_user(
    session: SessionDep,
    token: Annotated[str, Depends(oauth2_scheme)] # ???
) -> User:
    # Gọi hàm xác thực tập trung
    # Hàm này sẽ raise HTTPException nếu token không hợp lệ hoặc hết hạn
    payload = verify_token_and_get_payload(token)

    username: str | None = payload.get("sub")
    token_type: str | None = payload.get("type")

    # Kiểm tra logic cụ thể cho access token SAU KHI đã xác thực cơ bản
    if token_type != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type, expected 'access'",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Không cần validate TokenData nữa vì 'sub' đã được kiểm tra trong verify_token...

    user = get_user_by_username(session, username=username)
    if user is None:
        # User có trong token nhưng không có trong DB? -> Token không hợp lệ
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found for token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user

# --- Type Aliases (giữ nguyên) ---
CurrentUser = Annotated[User, Depends(get_current_user)]