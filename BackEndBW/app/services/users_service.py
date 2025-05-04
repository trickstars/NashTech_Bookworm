from ..models import User
from sqlmodel import Session, select
from typing import Optional

def get_user_by_email(session: Session, email: str) -> Optional[User]:
    statement = select(User).where(User.email == email) # Sử dụng email thay vì username
    user = session.exec(statement).first()
    return user

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Lấy user từ database bằng ID."""
    user = db.get(User, user_id) # SQLModel get by primary key
    return user