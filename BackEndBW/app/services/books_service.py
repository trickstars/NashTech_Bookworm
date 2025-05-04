from fastapi import HTTPException
from sqlmodel import select, case, and_, or_, desc, func
from sqlalchemy import Select, Subquery
from sqlalchemy.orm import aliased
# from sqlalchemy import label

from datetime import date
import math

from ..dependencies.db_dep import SessionDep

from ..models import Book, Category, Review, Discount, Author

from ..schemas.query_params import FilterParam, OrderParam, PaginationParam
# from ..schemas.book import BookCard

from ..constants.enums import Featured, SortFactor, SortOrder

async def get_books(filter_param: FilterParam, order_param: OrderParam, pagination_param: PaginationParam, session: SessionDep):
    """
    Get books with optional filtering, ordering, and pagination.
    """

    current_date = date.today()

    final_price = case(
        (
            and_(
                Discount.id.is_not(None),
                or_(
                    Discount.discount_end_date.is_(None),
                    Discount.discount_end_date > current_date,
                )
            ),
            Discount.discount_price
        ),
        else_=Book.book_price
    ).label("final_price")


    query = select(Book, final_price, Author.author_name).join(Discount, isouter=True).join(Author, isouter=True)
    # query = select(Book)

    # print("Filter prM", filter_param)
    # print("Order prM", order_param)
    # print("Pagination prM", pagination_param)

    # Apply filters
    if filter_param:
        query = get_books_filtered(query, filter_param)
        
    # Apply ordering
    if order_param.order_by:
        query = get_books_ordered_by(query, order_param)

    total_books = int(session.exec(select(func.count()).select_from(query)).first())
    total_pages = math.ceil(total_books / pagination_param.limit) if pagination_param else 1
    current_page = pagination_param.page if pagination_param else 1
    if pagination_param and pagination_param.page > total_pages:
        raise HTTPException(status_code=400, detail="Page out of range")
    
    # Apply pagination
    if pagination_param:
        query = get_book_by_pagination(query, pagination_param)
    
    print("Query day ne", query)
        
    book_alias = query.alias("book")
    # books = session.exec(select(book_alias).select_from(query)).all()
    books = session.exec(select(*book_alias.c)).mappings().all()
    if len(books) == 0:
        # print("Toi day ne")
        raise HTTPException(status_code=404, detail="Resources not found")
    # print("Books", books)
    return books, total_books, total_pages, current_page

# Special get books
async def get_featured_books(featured_type: Featured, session: SessionDep):
    """
    Get recommended books
    """
    current_date = date.today()

    final_price = case(
        (
            and_(
                Discount.id.is_not(None),
                or_(
                    Discount.discount_end_date.is_(None),
                    Discount.discount_end_date > current_date,
                )
            ),
            Discount.discount_price
        ),
        else_=Book.book_price
    ).label("final_price")

    count_rv = func.count(Review.id).label("review_count")
    avg_rv_rating = func.coalesce(func.avg(Review.rating_star), 0).label("avg_rating")

    chosen_feature = avg_rv_rating if featured_type == Featured.RECOMMENDED else count_rv
    query = (select(*Book.__table__.c, final_price, Author.author_name,
                    chosen_feature,
                    )
                    .join(Discount, isouter=True)
                    .join(Author, isouter=True)
                    .join(Review, isouter=True)
                    .group_by(Book.id, Discount.id, Author.author_name)
                    .order_by(desc(chosen_feature), final_price))
    
    books = session.exec(query.limit(8)).mappings().all()
    if len(books) == 0:
        # print("Toi day ne")
        raise HTTPException(status_code=404, detail="Resources not found")
    # print("Books", books)
    return books

async def get_book_by_id(book_id: int, session: SessionDep) -> any:
    """
    Get book by ID
    """
    current_date = date.today()

    final_price = case(
        (
            and_(
                Discount.id.is_not(None),
                or_(
                    Discount.discount_end_date.is_(None),
                    Discount.discount_end_date > current_date,
                )
            ),
            Discount.discount_price
        ),
        else_=Book.book_price
    ).label("final_price")

    book = session.exec(select(*Book.__table__.c, final_price, Author.author_name, Category.category_name)
                        .join(Discount, isouter=True).join(Author, isouter=True).join(Category, isouter=True)
                        .where(Book.id == book_id)).first()
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return book    

# Filtering
def get_books_filtered(query: Select, filter_param: FilterParam) -> Subquery:
    """
    Get books filtered by author, category, and rating
    """
    if filter_param.author:
        query = query.where(Book.author_id == filter_param.author)
    if filter_param.category:
        query = query.where(Book.category_id == filter_param.category)
    if filter_param.rating:
        query = query.join(Review, Book.id == Review.book_id).group_by(Book.id, Discount.id, Author.author_name).having(func.avg(Review.rating_star) >= filter_param.rating)
    return query.subquery()


# Sorting
def get_books_ordered_by(query: Subquery, orderParam: OrderParam) -> Subquery:
    """
    Get books ordered by a specific parameter
    """
    print("Order param", orderParam)
    print("Enum sale", SortFactor.SALE)
    if orderParam.order_by == SortFactor.SALE:
        return get_books_ordered_by_sale(query)
    elif orderParam.order_by == SortFactor.POPULARITY:
        return get_books_ordered_by_popularity(query)
    elif orderParam.order_by == SortFactor.PRICE:
        return get_books_ordered_by_final_price(query, True if orderParam.order == SortOrder.ASCENDING else False)
    else:
        raise HTTPException(status_code=400, detail="Invalid order parameter")

def get_books_ordered_by_sale(query: Subquery) -> Subquery:
    """
    Get books ordered by sale
    """

    book_alias = query.alias("book")

    # current_date = date.today()

    # final_price = case(
    #     (
    #         and_(
    #             Discount.id.is_not(None),
    #             or_(
    #                 Discount.discount_end_date.is_(None),
    #                 Discount.discount_end_date > current_date,
    #             )
    #         ),
    #         Discount.discount_price
    #     ),
    #     else_=book_alias.c.book_price
    # ).label("final_price")

    # 2. Tính giá trị giảm giá
    discount_value = (book_alias.c.book_price - book_alias.c.final_price).label("discount_value")

    # 3. Build query với LEFT JOIN để vẫn giữ sách không có discount

    stmt = (
        select(book_alias, discount_value).select_from(book_alias)
        # .join(Discount, isouter=True)
        .order_by(desc("discount_value"), "final_price")
    ).subquery()

    print("This query", stmt)

    return stmt

def get_books_ordered_by_popularity(query: Subquery) -> Subquery:
    """
    Get books ordered by popularity
    """
    # book_alias = query.alias("book")

    statement = (
        select(
            query, 
            func.count().label("review_count"),)
        .join_from(query, Review, isouter=True)
        .group_by(*query.c)
        .order_by(desc("review_count"), "final_price")
    ).subquery()

    print("This query", statement)
    return statement

def get_books_ordered_by_final_price(query:Subquery, ascending: bool = False) -> Subquery:
    """
    Get books ordered by final price
    """
    try:
        # current_date = date.today()

        book_alias = query.alias("book")

        # final_price = case(
        #     (
        #         and_(
        #             Discount.id.is_not(None),
        #             or_(
        #                 Discount.discount_end_date.is_(None),
        #                 Discount.discount_end_date > current_date,
        #             )
        #         ),
        #         Discount.discount_price
        #     ),
        #     else_=book_alias.c.book_price
        # ).label("final_price")

        query = (select(book_alias)
                #  .join(Discount, isouter=True)
                 .order_by("final_price" if ascending else desc("final_price"))).subquery()
    except Exception as e:
        print("Loi trong nay nhe", e)
        return []
    
    print("This query", query)
    return query

def get_book_by_pagination(query: Subquery, pagination_param: PaginationParam) -> Subquery:
    """
    Get books by pagination
    """

    book_alias = query.alias("book")

    return select(book_alias).offset((pagination_param.page - 1) * pagination_param.limit).limit(pagination_param.limit).subquery()

# async def get_books_filtered_by_author(author_id: int) -> list[Book]:
#     """
#     Get books filtered by author ID
#     """
#     query = select(Book).where(Book.author_id == author_id).subquery()
    # books = session.exec(select(Book).where(Book.author_id == author_id)).all()
    # if len(books) == 0:
    #     raise HTTPException(status_code=404, detail="Resources not found")
    # return books

# async def get_books_filtered_by_category(category_id: int) -> list[Book]:
#     """
#     Get books filtered by category ID
#     """
#     query = select(Book).where(Book.category_id == category_id).subquery()
    # books = session.exec(select(Book).where(Book.category_id == category_id)).all()
    # if len(books) == 0:
    #     raise HTTPException(status_code=404, detail="Resources not found")
    # return books

# async def get_books_filtered_by_rating(rating_threshold: int) -> list[Book]:
#     """
#     Get books filtered by rating
#     """
#     query = select(Book).join(Review, Book.id == Review.book_id).group_by(Book.id).having(func.avg(Review.rating_star) >= rating_threshold).subquery()
    # books = session.exec(
    #     select(Book, 
    #            func.avg(Review.rating_star).label("average_rating")
    #         )
    #     .join(Review, Book.id == Review.book_id) #bang co the rat lon ?
    #     .group_by(Book.id)
    #     .having(func.avg(Review.rating_star) >= rating_threshold)
    # ).all()

    # if len(books) == 0:
    #     raise HTTPException(status_code=404, detail="Resources not found")
    # # print(books)
    # return [{**dict(book), "avg_rating": avg_rating} for book, avg_rating in books]