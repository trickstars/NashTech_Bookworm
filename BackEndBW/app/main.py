from fastapi import FastAPI

from .database import init_db

from .routers import authors_route

app = FastAPI()

app.include_router(authors_route.router)

# @app.on_event("startup")
# async def startup():
#     print("Initializing DB...")
#     init_db()

@app.get("/")
def root():
    return {"message": "Hello, what resources do you request?"}

