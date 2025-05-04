from fastapi import FastAPI
# --- Thêm import cho CORS ---
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db

from .routers import authors_route
from .routers import books_route
from .routers import auth
from .routers import categories_route
from .routers import orders_route

# --- Danh sách các origins được phép truy cập ---
# Thay đổi các URL này cho phù hợp với môi trường của bạn
# Ví dụ cho môi trường dev (Vite default port 5173)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    # Thêm URL frontend production của bạn vào đây khi triển khai
    # "https://your-frontend-domain.com",
]

app = FastAPI(title="Bookworm API")

# --- Thêm CORSMiddleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Danh sách origins được phép
    allow_credentials=True, # Cho phép gửi cookie/header Authorization từ frontend
    allow_methods=["*"],    # Cho phép tất cả các method (GET, POST, PUT, DELETE...)
    allow_headers=["*"],    # Cho phép tất cả các header
)
# --- ---

# --- Đăng ký các Routers ---
app.include_router(auth.router)
app.include_router(authors_route.router)
app.include_router(categories_route.router)
app.include_router(books_route.router)
app.include_router(orders_route.router)

# @app.on_event("startup")
# async def startup():
#     print("Initializing DB...")
#     init_db()

@app.get("/")
def root():
    return {"message": "Welcome to Bookworm API"}
