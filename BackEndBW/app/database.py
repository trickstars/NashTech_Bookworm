from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv
import os
from pathlib import Path

# Get path to env file
env_path = Path(__file__).resolve().parent.parent / '.env'

# Load environment variables
load_dotenv(dotenv_path=env_path)

user = os.getenv("DATABASE_USER")
password = os.getenv("USER_PASS")
host = os.getenv("DATABASE_HOST")
# port = os.getenv("DATABASE_PORT")
name = os.getenv("DATABASE_NAME")
DATABASE_URL = f"postgresql://{user}:{password}@{host}/{name}"

engine = create_engine(DATABASE_URL, echo=True)

def init_db():
    SQLModel.metadata.create_all(engine)

if __name__ == "__main__":
    init_db()