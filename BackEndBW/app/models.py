from sqlmodel import Field, SQLModel, Relationship, CheckConstraint
# from typing import Optional, list
from datetime import date, datetime

from app.schemas.review import ReviewBase
from app.schemas.order import OrderItemBase

from .schemas.author import AuthorBase
from .schemas.category import CategoryBase
from .schemas.book import BookBase
from .schemas.user import UserBase

# Optional field?
class Category(CategoryBase, table=True):
    id: int | None = Field(default=None, primary_key=True)

    books: list["Book"] = Relationship(back_populates="category", passive_deletes=True) # co the set passive delete (nhung khong quan trong)

class Author(AuthorBase, table=True):
    id: int | None = Field(default=None, primary_key=True)

    books: list["Book"] = Relationship(back_populates="author", passive_deletes=True) # co the set passive delete (nhung khong quan trong)

class Discount(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    book_id: int = Field(foreign_key="book.id", unique=True, ondelete="CASCADE")
    discount_start_date: date # khong co yeu cau, vi the tam thoi khong de null
    discount_end_date: date | None = Field(default=None)
    discount_price: float = Field(ge=0)

    __table_args__= (
        CheckConstraint("discount_start_date < discount_end_date", name="check_discount_dates"),
        CheckConstraint("discount_price > 0", name="check_discount_price"),
    )

    book: "Book" = Relationship(back_populates="discount", passive_deletes=True)

class Book(BookBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    category_id: int | None = Field(foreign_key="category.id", ondelete="SET NULL") # mac dinh se la no action (co nen set restrict ?)
    author_id: int | None = Field(foreign_key="author.id", ondelete="SET NULL")

    category: Category | None = Relationship(back_populates="books")
    author: Author | None = Relationship(back_populates="books")
    discount: Discount | None = Relationship(back_populates="book", cascade_delete=True)
    reviews: list["Review"] = Relationship(back_populates="book", passive_deletes=True)
    # order_items: list["OrderItem"] = Relationship(back_populates="book") # no need to save this information

class Review(ReviewBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    book_id: int = Field(foreign_key="book.id", ondelete="CASCADE")
    
    __table_args__ = (
        CheckConstraint("rating_star >= 1", name="check_rating_star_min"),
        CheckConstraint("rating_star <= 5", name="check_rating_star_max"),
    )

    book: Book = Relationship(back_populates="reviews")

class User(UserBase, table=True):
    id: int | None = Field(default=None, primary_key=True)

    __table_args__ = (
        CheckConstraint(
            r"email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'",
            name="email_format_check"
        ),
    )

    orders: list["Order"] = Relationship(back_populates="user", passive_deletes=True) # don hang nen duoc giu lai dung cho nhieu muc dich khac (report,..)

class Order(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(foreign_key="user.id", ondelete="SET NULL")
    order_date: datetime
    order_amount: float

    user: User = Relationship(back_populates="orders")
    items: list["OrderItem"] = Relationship(back_populates="order", passive_deletes=True) # co the dung cascase?

class OrderItem(OrderItemBase, table=True):
    __tablename__ = "order_item"
    id: int | None = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="order.id", ondelete="CASCADE")

    order: Order | None = Relationship(back_populates="items")
    book: Book | None = Relationship()
