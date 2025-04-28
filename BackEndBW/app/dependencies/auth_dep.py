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

# --- OAuth2 Scheme ---
# URL trỏ đến endpoint lấy token ban đầu
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# --- Dependency get_current_user (kiểm tra access token) ---
async def get_current_user(
    session: SessionDep,
    token: Annotated[str, Depends(oauth2_scheme)] # ???
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_expired_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token has expired",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        username: str | None = payload.get("sub")
        token_type: str | None = payload.get("type") # Kiểm tra type token

        # Quan trọng: Dependency này chỉ chấp nhận access token
        if username is None or token_type != "access":
            raise credentials_exception

        token_data = TokenData(username=username)

    except jwt.ExpiredSignatureError:
        raise token_expired_exception
    except (jwt.InvalidTokenError, ValidationError):
        raise credentials_exception

    user = get_user_by_username(session, username=token_data.username)
    if user is None:
        raise credentials_exception

    return user

# --- Type Aliases (giữ nguyên) ---
CurrentUser = Annotated[User, Depends(get_current_user)]