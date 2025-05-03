# app/routers/auth.py
from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

# from app.models import User
from app.schemas.user import UserPublic
from app.config import settings
from app.schemas.token import Token, RefreshTokenRequest
# from app.schemas.user_schemas import UserRead
from app.services.auth_service import authenticate_user, refresh_token_service
from app.utils.security import create_access_token, create_refresh_token
# Import CurrentUser, bỏ CurrentActiveUser
from app.dependencies.auth_dep import CurrentUser
from app.dependencies.db_dep import SessionDep

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/token", response_model=Token)
async def login_for_access_token(
    session: SessionDep,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
):
    user = authenticate_user(
        session, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_data = {"sub": str(user.id), "user_id":user.id, "user_fullname": user.first_name + " " + user.last_name, "user_email": user.email}
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data=access_token_data, expires_delta=access_token_expires
    )

    refresh_token_expires = timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    refresh_token = create_refresh_token(
        data={"sub": str(user.id)}, expires_delta=refresh_token_expires
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
async def refresh_access_token(
    session: SessionDep,
    refresh_request: RefreshTokenRequest
):
    new_tokens = refresh_token_service(session, token=refresh_request.refresh_token)
    return new_tokens


@router.get("/users/me", response_model=UserPublic)
async def read_users_me(
    # --- SỬA DEPENDENCY Ở ĐÂY ---
    current_user: CurrentUser # Sử dụng CurrentUser thay vì CurrentActiveUser
    # --- ---
):
    return current_user