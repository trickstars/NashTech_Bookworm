# app/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    # JWT Settings
    SECRET_KEY: str = "YOUR_VERY_SECRET_KEY_HERE" # !!! THAY BẰNG KHÓA BÍ MẬT THỰC SỰ !!!
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 # Token hết hạn sau 30 phút
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 7 * 60 * 24 # Refresh token hết hạn sau 7 ngày

    # Database URL (Ví dụ, bạn có thể đã có ở database.py)
    # DATABASE_URL: str = "postgresql+psycopg2://user:password@host:port/db_name"

    # Dùng để đọc từ file .env nếu có
    # model_config = SettingsConfigDict(env_file=".env")

# Tạo một instance để sử dụng trong dự án
settings = Settings()

# --- Rất quan trọng ---
# !!! KHÔNG BAO GIỜ HARDCODE SECRET_KEY TRONG CODE PRODUCTION !!!
# Hãy sử dụng biến môi trường hoặc một cơ chế quản lý secret an toàn.
# Ví dụ tạo key ngẫu nhiên: openssl rand -hex 32