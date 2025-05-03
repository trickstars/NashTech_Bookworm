from sqlmodel import SQLModel, Field, CheckConstraint
from pydantic import BaseModel

class BookBase(SQLModel):
    book_title: str = Field(max_length=255)
    book_summary: str
    book_price: float = Field(ge=0) #DECIMAL ?
    book_cover_photo: str | None = Field(max_length=20, default=None)

    __table_args__ = (
        CheckConstraint("book_price >= 0", name="check_book_price"),
    )

# class BookCreate(BookBase):
#     pass 
# nang cao

# class BookUpdate(BookBase):
#     author_name: str | None = None
#     author_bio: str | None = None
# nang cao

class BookCard(BookBase):
    id: int
    book_summary: str = Field(default=None, exclude=True)
    final_price: float
    author_name: str | None

class BookDetail(BookBase):
    id: int
    final_price: float
    author_name: str | None
    category_name: str | None

# Schema cho cấu trúc response của API lấy danh sách sách
class BookListResponse(BaseModel):
    items: list[BookCard]       # Danh sách các sách theo schema BookRead
    total_items: int          # Tổng số sách (trước khi phân trang)
    total_pages: int          # Tổng số trang
    current_page: int         # Trang hiện tại