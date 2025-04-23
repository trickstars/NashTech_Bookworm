from fastapi import APIRouter, HTTPException, Query, Depends
# from sqlmodel import select, func, desc

# from typing import Annotated
# from datetime import date

from ..dependencies import SessionDep
from ..models import Book, Discount
from ..schemas.book import BookCard
from ..schemas.query_params import FilterParam, OrderParam, PaginationParam
from ..services import books_service
from ..constants.enums import SortFactor

router = APIRouter(prefix='/books', tags=["books"])

@router.get("/", response_model=list[BookCard])
async def get_books(*, filter_param: FilterParam = Depends(), 
                    order_param: OrderParam = Depends(), 
                    pagination_param: PaginationParam = Depends(), session: SessionDep) -> list[any]:
    print("Filter PRm", filter_param)
    print("Order PRm", order_param)
    print("Pagination PRm", pagination_param)
    return await books_service.get_books(filter_param, order_param, pagination_param, session)

@router.get("/top-discounted", response_model=list[BookCard])
async def get_top_discounted_books(session: SessionDep) -> list[any]:
    return await books_service.get_books(filter_param=None, order_param=OrderParam(order_by=SortFactor.SALE), pagination_param=PaginationParam(limit=10), session=session)

# @router.get("/featu")


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