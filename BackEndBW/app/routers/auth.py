# app/routers/auth.py
from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, status, Request, Response
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

# --- Hằng số cho tên cookie và cài đặt ---
REFRESH_TOKEN_COOKIE_KEY = "refreshToken" # Tên cookie

def _set_refresh_cookie(response: Response, token: str):
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE_KEY,
        value=token,
        httponly=True,                   # Quan trọng: Ngăn JS truy cập
        samesite='none',                  # Chống CSRF (Strict hoặc Lax)
        secure=False,                     # Chỉ gửi qua HTTPS (True cho production)
        path="/auth",                    # Giới hạn đường dẫn cho cookie (chỉ gửi đến /auth/...)
        # max_age tính bằng giây
        max_age=settings.REFRESH_TOKEN_EXPIRE_MINUTES * 60
        # domain=... # Chỉ định domain nếu cần chia sẻ cookie qua subdomain
    )
    # print("SET COOKIE THANH CONG ROI MAY DUA OI")

def _delete_refresh_cookie(response: Response):
     response.delete_cookie(
        key=REFRESH_TOKEN_COOKIE_KEY,
        path="/auth",
        samesite='none',
        secure=False,
        httponly=True
    )

@router.post("/token", response_model=Token)
async def login_for_access_token(
    response: Response, # Inject Response object để set cookie
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

    # --- Set HttpOnly Cookie cho Refresh Token ---
    _set_refresh_cookie(response, refresh_token)
    # --- ---

    return {
        "access_token": access_token,
        # "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
async def refresh_access_token(
    response: Response, # Inject Response để set cookie mới
    session: SessionDep,
    refreshToken: Annotated[str | None, Cookie()] = None
    # refresh_request: RefreshTokenRequest
):
    print("##############################33")
    print("REFRESH _CHANNNN", refreshToken)
    if not refreshToken:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token cookie")
    try:
        new_tokens = refresh_token_service(session, token=refreshToken)
    except HTTPException as e:
         # Nếu refresh token không hợp lệ, xóa cookie cũ và raise lỗi
         _delete_refresh_cookie(response)
         raise e # Ném lại lỗi từ service (thường là 401)
    except Exception as e:
         _delete_refresh_cookie(response)
         print(f"Unexpected error during token refresh: {e}")
         raise HTTPException(status_code=500, detail="Could not refresh token")
    
    # Set HttpOnly Cookie MỚI cho refresh token MỚI
    _set_refresh_cookie(response, new_tokens["refresh_token"])

    return {"access_token": new_tokens["access_token"], "token_type": new_tokens["token_type"]}

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout_user(
    response: Response, # Inject Response để xóa cookie
    # Thêm dependency CurrentUser để đảm bảo chỉ user đã đăng nhập mới logout được
    current_user: CurrentUser # Bỏ "= Depends()" nếu dùng Annotated
):
    """Xóa HttpOnly refresh token cookie."""
    print(f"User {current_user.id} logging out.")
    _delete_refresh_cookie(response)
    # TODO: Thêm logic vô hiệu hóa refresh token trong DB nếu dùng stateful
    return None # Status 204 không cần body


@router.get("/users/me", response_model=UserPublic)
async def read_users_me(
    # --- SỬA DEPENDENCY Ở ĐÂY ---
    current_user: CurrentUser # Sử dụng CurrentUser thay vì CurrentActiveUser
    # --- ---
):
    return current_user