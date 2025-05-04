# app/schemas/order.py
# from pydantic import BaseModel, Field, conint
from sqlmodel import SQLModel, Field
from typing import List, Optional
from datetime import datetime

# Schema cho một item trong request tạo order
class OrderItemBase(SQLModel):
    book_id: int = Field(foreign_key="book.id")
    quantity: int = Field(ge=1, le=8)
    price: float = Field()

# Schema đọc thông tin một OrderItem (có thể thêm thông tin sách)
class OrderItemRead(OrderItemBase):
    id: int
    # book: Optional[BookRead] = None # Tùy chọn: trả về cả thông tin sách lồng nhau

# Schema cho request body khi tạo order mới
class OrderCreate(SQLModel):
    items: List[OrderItemBase] # Frontend chỉ cần gửi list các book_id và quantity

# --- Schemas cho Response ---


# Schema đọc thông tin một Order (có thể thêm thông tin user và items)
class OrderRead(SQLModel):
    id: int
    user_id: Optional[int]
    order_date: datetime
    order_amount: float
    items: List[OrderItemRead] = [] # Danh sách các item trong order
    # user: Optional[UserRead] = None # Tùy chọn: trả về thông tin user lồng nhau

    class Config:
        from_attributes = True # Cho phép tạo schema từ ORM object