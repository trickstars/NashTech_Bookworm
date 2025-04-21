from sqlmodel import Field, SQLModel, Relationship, CheckConstraint
# from typing import Optional, list
from datetime import date, datetime

from .schemas.author import AuthorBase
from .schemas.category import CategoryBase
from .schemas.book import BookBase

# Optional field?
class Category(CategoryBase, table=True):
    id: int | None = Field(default=None, primary_key=True)

    books: list["Book"] = Relationship(back_populates="category") # co the set passive delete (nhung khong quan trong)

class Author(AuthorBase, table=True):
    id: int | None = Field(default=None, primary_key=True)

    books: list["Book"] = Relationship(back_populates="author") # co the set passive delete (nhung khong quan trong)

class Book(BookBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    category_id: int | None = Field(foreign_key="category.id") # mac dinh se la no action (co nen set restrict ?)
    author_id: int | None = Field(foreign_key="author.id")

    category: Category | None = Relationship(back_populates="books")
    author: Author | None = Relationship(back_populates="books")
    discount: "Discount" | None = Relationship(back_populates="book", cascade_delete=True)
    reviews: list["Review"] = Relationship(back_populates="book", passive_deletes=True)
    # order_items: list["OrderItem"] = Relationship(back_populates="book") # no need to save this information

class Discount(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    book_id: int = Field(foreign_key="book.id", unique=True, ondelete="CASCADE")
    discount_start_date: date # khong co yeu cau, vi the tam thoi khong de null
    discount_end_date: date | None = Field(default=None)
    discount_price: float = Field(ge=0)

    __table_args__= (CheckConstraint("discount_start_date < discount_end_date", name="check_discount_dates"),)

    book: Book = Relationship(back_populates="discount", passive_deletes=True)

class Review(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    book_id: int = Field(foreign_key="book.id", ondelete="CASCADE")
    review_title: str = Field(max_length=120)
    review_details: str | None = Field(default=None)
    review_date: datetime
    rating_star: int = Field(ge=1, le=5)

    book: Book = Relationship(back_populates="reviews")

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    first_name: str = Field(max_length=50)
    last_name: str = Field(max_length=50)
    email: str = Field(max_length=70)
    password: str = Field(max_length=255)
    admin: bool = Field(default=False)

    orders: list["Order"] = Relationship(back_populates="user", passive_deletes=True) # don hang nen duoc giu lai dung cho nhieu muc dich khac (report,..)

class Order(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(foreign_key="user.id", ondelete="SET NULL")
    order_date: datetime
    order_amount: float

    user: User = Relationship(back_populates="orders")
    items: list["OrderItem"] = Relationship(back_populates="order", passive_delete=True) # co the dung cascase?

class OrderItem(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="order.id", ondelete="CASCADE")
    book_id: int = Field(foreign_key="book.id")
    quantity: int = Field(ge=1, le=8)
    price: float = Field(ge=0) # co set None duoc khong?

    order: Order | None = Relationship(back_populates="items")
    book: Book | None = Relationship()
