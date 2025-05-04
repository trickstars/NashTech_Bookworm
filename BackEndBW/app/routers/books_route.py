from fastapi import APIRouter, HTTPException, Query, Depends
# from sqlmodel import select, func, desc

# from typing import Annotated
# from datetime import date

from ..dependencies.db_dep import SessionDep
from ..models import Book, Discount
from ..schemas.book import BookCard, BookDetail, BookListResponse
from ..schemas.query_params import FilterParam, OrderParam, PaginationParam
from ..services import books_service
from ..constants.enums import Featured, SortFactor

router = APIRouter(prefix='/books', tags=["books"])

@router.get("/", response_model=BookListResponse)
async def get_books(*, filter_param: FilterParam = Depends(), 
                    order_param: OrderParam = Depends(), 
                    pagination_param: PaginationParam = Depends(), session: SessionDep) -> list[any]:
    print("Filter PRm", filter_param)
    print("Order PRm", order_param)
    print("Pagination PRm", pagination_param)
    books, total_books, total_pages, current_page = await books_service.get_books(filter_param, order_param, pagination_param, session)
    return BookListResponse(items=books, total_items=total_books, total_pages=total_pages, current_page=current_page)

@router.get("/top-discounted", response_model=list[BookCard])
async def get_top_discounted_books(session: SessionDep) -> list[any]:
    books, _, _, _ = await books_service.get_books(filter_param=None, order_param=OrderParam(order_by=SortFactor.SALE), pagination_param=PaginationParam(limit=10), session=session)
    return books

@router.get("/recommended", response_model=list[BookCard])
async def get_recommended_books(session: SessionDep) -> list[any]:
    books = await books_service.get_featured_books(Featured.RECOMMENDED, session)
    return books

@router.get("/popular", response_model=list[BookCard])
async def get_popular_books(session: SessionDep) -> list[any]:
    books = await books_service.get_featured_books(Featured.POPULAR, session)
    return books

@router.get("/{book_id}", response_model=BookDetail)
async def get_book_by_id(book_id: int, session: SessionDep) -> any:
    return await books_service.get_book_by_id(book_id, session)

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