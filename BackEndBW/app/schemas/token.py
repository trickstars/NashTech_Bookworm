from pydantic import BaseModel, EmailStr
# from typing import Optional

class Token(BaseModel):
    access_token: str
    # refresh_token: str
    token_type: str

# class TokenData(BaseModel):
#     sub: Optional[str | int] = None

class RefreshTokenRequest(BaseModel): # Schema cho body của request /refresh
    refresh_token: str