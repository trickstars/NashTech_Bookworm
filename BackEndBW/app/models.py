from sqlmodel import Field, SQLModel, Relationship
# from typing import Optional, list
from datetime import date, datetime

from .schemas.author import AuthorBase
from .schemas.category import CategoryBase
from .schemas.book import BookBase

# Optional field?
class Category(CategoryBase, table=True):
    id: int | None = Field(default=None, primary_key=True)

    books: list["Book"] = Relationship(back_populates="category")

class Author(AuthorBase, table=True):
    id: int | None = Field(default=None, primary_key=True)

    books: list["Book"] = Relationship(back_populates="author")

class Book(BookBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    category_id: int | None = Field(default=None, foreign_key="category.id")
    author_id: int | None = Field(default=None, foreign_key="author.id")

    category: Category | None = Relationship(back_populates="books")
    author: Author | None = Relationship(back_populates="books")
    discount: "Discount" = Relationship(back_populates="book", cascade_delete=True)
    reviews: list["Review"] = Relationship(back_populates="book")
    # order_items: list["OrderItem"] = Relationship(back_populates="book") # no need to save this information

class Discount(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    book_id: int = Field(foreign_key="book.id", ondelete="CASCADE")
    discount_start_date: date
    discount_end_date: date
    discount_price: float

    book: Book = Relationship(back_populates="discount")

class Review(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    book_id: int = Field(foreign_key="book.id")
    review_title: str = Field(max_length=120)
    review_details: str | None = Field(default=None)
    review_date: datetime
    rating_star: str = Field(max_length=255)

    book: Book = Relationship(back_populates="reviews")

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    first_name: str = Field(max_length=50)
    last_name: str = Field(max_length=50)
    email: str = Field(max_length=70)
    password: str = Field(max_length=255)
    admin: bool = Field(default=False)

    orders: list["Order"] = Relationship(back_populates="user", cascade_delete=True)

class Order(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", ondelete="CASCADE")
    order_date: datetime
    order_amount: float

    user: User = Relationship(back_populates="orders")
    items: list["OrderItem"] = Relationship(back_populates="order")

class OrderItem(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="order.id", ondelete="CASCADE")
    book_id: int = Field(foreign_key="book.id")
    quantity: int
    price: float

    order: Order | None = Relationship(back_populates="items")
    book: Book | None = Relationship()
