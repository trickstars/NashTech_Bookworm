from fastapi import APIRouter, HTTPException
from sqlmodel import select, func, desc

from datetime import date

from ..dependencies import SessionDep
from ..models import Book, Discount
from ..schemas.book import BookCard

router = APIRouter(prefix='/books', tags=["books"])

@router.get("/")
async def get_all_books(session: SessionDep) -> list[Book]:
    books = session.exec(select(Book)).all()
    # print(books)
    if len(books) == 0:
        raise HTTPException(status_code=404, detail="Resources not found")
    return books


@router.get("/top-discounted", response_model=list[BookCard])
def get_top_discounted_books(session: SessionDep):
    # Tạo biểu thức tính toán giá trị giảm giá

    # discount_value_expr = (Book.price - Discount.discount_price).label("discount_value")
    current_date = date.today()

    statement = (
        select(
            Book,
            # Book.author.author_name,
            Discount.discount_price,
            func.coalesce(Book.book_price - Discount.discount_price, 0).label("discount_amount")
        )
        .join(Discount, Book.id == Discount.book_id, isouter=True)
        .where(
            (Discount.discount_start_date <= current_date) &
            (Discount.discount_end_date > current_date)
        )
        .order_by(desc("discount_amount"))
        .limit(10)
    )

    results = session.exec(statement).all()

    # print(results)

    return [
        BookCard(
            id=book.id,
            book_title=book.book_title,
            book_price=book.book_price,
            book_cover_photo=book.book_cover_photo,
            author_name=book.author.author_name,
            book_discount_price=discount_price,
        )
        for book, discount_price, _ in results
    ]


@router.get("/{book_id}")
async def get_book_by_id(book_id: int, session: SessionDep) -> Book:
    book = session.get(Book, book_id)
    if book is None:
        raise HTTPException(status_code=404, detail="Resources not found")
    return book

# @router.post("/")
# async def create_book(create_book_info: BookCreate, session: SessionDep) -> Book:
#     new_book = Book.model_validate(create_book_info)
#     session.add(new_book)
#     session.commit()
#     session.refresh(new_book)
#     return new_book

# @router.patch("/{book_id}")
# async def update_book(book_id: int, update_book_info: BookUpdate, session: SessionDep) -> Book:
#     book = session.get(Book, book_id)
#     if book is None:
#         raise HTTPException(status_code=404, detail="Resources not found")
#     book_data = update_book_info.model_dump(exclude_unset=True)
#     book.sqlmodel_update(book_data)
#     session.add(book)
#     session.commit()
#     session.refresh(book)
#     return book

# @router.delete("/{book_id}")
# async def delete_book(book_id: int, session: SessionDep):
#     book = session.get(Book, book_id)
#     if book is None:
#         raise HTTPException(status_code=404, detail="Resources not found")
#     session.delete(book)
#     session.commit()
#     return {"message": "Resource deleted"}