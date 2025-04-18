from sqlmodel import SQLModel, Field

class BookBase(SQLModel):
    book_title: str = Field(max_length=255)
    book_summary: str
    book_price: float = Field(ge=0) #DECIMAL ?
    book_cover_photo: str = Field(max_length=20)

# class BookCreate(BookBase):
#     pass 
# nang cao

# class BookUpdate(BookBase):
#     author_name: str | None = None
#     author_bio: str | None = None
# nang cao

class BookCard(BookBase):
    book_summary: str = Field(default=None, exclude=True)
    book_discount_price: float | None = None
    author_name: str