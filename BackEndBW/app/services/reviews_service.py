# app/services/reviews_service.py
import math
from typing import List, Optional, Dict, Any
from sqlmodel import Session, select, func, desc, asc, case, and_, or_ # Import đầy đủ
from fastapi import HTTPException, status
from datetime import datetime, timezone # Import timezone

# Import models và schemas liên quan
from app.models import Review, Book, User # Giả sử có User model
from app.schemas.review import ReviewCreate, ReviewListResponse, ReviewPublic # Sử dụng schema bạn cung cấp
# Import các schema query params (Giả định tên và cấu trúc)
from app.schemas.query_params import ReviewFilterParam, ReviewOrderParam, PaginationParam
from app.constants.enums import ReviewSortFactor

# Hàm helper (nếu cần)
# Ví dụ:
# def get_book_if_exists(session: Session, book_id: int) -> Book:
#     book = session.get(Book, book_id)
#     if not book:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Book with id {book_id} not found")
#     return book

async def get_reviews_by_book_id_service(
    session: Session,
    book_id: int,
    filter_param: ReviewFilterParam, # Sử dụng schema filter
    order_param: ReviewOrderParam,   # Sử dụng schema order
    pagination_param: PaginationParam # Sử dụng schema pagination
) -> ReviewListResponse:
    """
    Lấy danh sách đánh giá cho một cuốn sách cụ thể, kèm thống kê,
    có filter, sort, và pagination.
    """

    # --- Query để lấy thống kê tổng thể (count, avg, counts per star) cho sách này ---
    stats_statement = select(
        func.count(Review.id).label("total_count"),
        func.coalesce(func.avg(Review.rating_star), 0.0).label("average_rating"),
        func.sum(case((Review.rating_star == 5, 1), else_=0)).label("count_5"),
        func.sum(case((Review.rating_star == 4, 1), else_=0)).label("count_4"),
        func.sum(case((Review.rating_star == 3, 1), else_=0)).label("count_3"),
        func.sum(case((Review.rating_star == 2, 1), else_=0)).label("count_2"),
        func.sum(case((Review.rating_star == 1, 1), else_=0)).label("count_1")
    ).where(Review.book_id == book_id)

    stats_result = session.exec(stats_statement)
    stats = stats_result.first()

    total_review_count = stats.total_count if stats else 0
    average_rating = stats.average_rating if stats else 0.0
    rating_counts_dict: Dict[str, int] = {
        "5": stats.count_5 if stats else 0,
        "4": stats.count_4 if stats else 0,
        "3": stats.count_3 if stats else 0,
        "2": stats.count_2 if stats else 0,
        "1": stats.count_1 if stats else 0,
    }
    # --- ---

    # --- Query cơ sở để lấy danh sách reviews (items) ---
    select_statement = select(Review).where(Review.book_id == book_id)

    # --- Áp dụng Filter (ví dụ: filter theo rating) ---
    if filter_param and filter_param.rating is not None:
         # Đảm bảo rating nằm trong khoảng hợp lệ (1-5)
         if 1 <= filter_param.rating <= 5:
             select_statement = select_statement.where(Review.rating_star == filter_param.rating)
         else:
             raise Exception("Filter param invalid: must be an integer between 1 and 5")
    # --- ---
    # print("#############")
    # print("In ra mot ti nhe (moir)", len(session.exec(select_statement).all()))

    # --- Query để đếm số lượng items SAU KHI filter (cho pagination) ---
    # Cần tạo một câu lệnh count riêng dựa trên câu lệnh đã filter
    count_filtered_statement = select(func.count()).select_from(select_statement.with_only_columns(Review.id).subquery())
    total_filtered_items_result = session.exec(count_filtered_statement)
    total_items_for_pagination = total_filtered_items_result.one_or_none() or 0
    print("########################################################")
    print("Ket qua la gi", total_filtered_items_result)
    print("To day ne", total_items_for_pagination)
    # --- ---

    # --- Tính toán phân trang dựa trên số item đã filter ---
    limit = pagination_param.limit if pagination_param and pagination_param.limit > 0 else 10 # Default limit
    total_pages = math.ceil(total_items_for_pagination / limit) if total_items_for_pagination > 0 else 1
    current_page = pagination_param.page if pagination_param else 1
    current_page = max(1, min(current_page, total_pages)) # Đảm bảo trang hợp lệ
    offset = (current_page - 1) * limit
    # --- ---

    # --- Áp dụng Sắp xếp (lên câu lệnh đã filter) ---
    ordered_query = select_statement # Bắt đầu từ query đã filter
    if order_param and order_param.order_by:
        sort_col_name = order_param.order_by
        # Giả sử SortOrder là Enum với value 'asc'/'desc'
        sort_dir = order_param.order.value if order_param.order else 'desc'

        order_column = None
        if sort_col_name == 'date': # Giả sử order_by='date'
            order_column = Review.review_date
        else:
            raise Exception("Order param is not valid")
        # Thêm các trường sort khác nếu cần

        if order_column is not None:
            if sort_dir == 'asc':
                ordered_query = ordered_query.order_by(asc(order_column), desc(Review.rating_star))
            else:
                ordered_query = ordered_query.order_by(desc(order_column), desc(Review.rating_star))
        else:
            # Sắp xếp mặc định nếu order_by không hợp lệ
            ordered_query = ordered_query.order_by(desc(Review.review_date), desc(Review.id))
    else:
        # Sắp xếp mặc định nếu không có order_param
        ordered_query = ordered_query.order_by(desc(Review.review_date), desc(Review.id))
    # --- ---

    # --- Áp dụng Phân trang ---
    paginated_query = ordered_query.offset(offset).limit(limit)
    # --- ---

    # --- Thực thi query cuối cùng để lấy items ---
    review_results = session.exec(paginated_query)
    items_orm = review_results.all()
    # --- ---

    # --- Tạo đối tượng Response ---
    # Chuyển đổi items ORM thành schema ReviewPublic
    items_public = [ReviewPublic.model_validate(item) for item in items_orm]

    response_data = ReviewListResponse(
        items=items_public,
        total_pages=total_pages,
        current_page=current_page,
        average_rating=round(average_rating, 1) if average_rating is not None else None,
        rating_count=total_review_count, # Tổng số review của sách (không phụ thuộc filter)
        rating_counts=rating_counts_dict, # Phân loại sao của sách (không phụ thuộc filter)
        total_items=total_items_for_pagination # Thêm lại totalItems (số lượng sau filter)
    )

    return response_data


async def create_review_service(
    session: Session,
    book_id: int,
    review_create: ReviewCreate,
    # user_id: Optional[int] = None # Thêm user_id làm tham số (có thể là Optional)
) -> Review: # Trả về model Review
    """
    Tạo một review mới cho sách.
    """
    # 1. Kiểm tra sách tồn tại
    book = session.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Book with id {book_id} not found")

    # 2. Kiểm tra user tồn tại (nếu user_id được cung cấp)
    # if user_id is not None:
    #     user = session.get(User, user_id)
    #     if not user:
    #          raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with id {user_id} not found")
    #     # TODO: Kiểm tra xem user này đã review sách này chưa nếu cần
    #     # statement = select(Review).where(Review.book_id == book_id, Review.user_id == user_id)
    #     # existing_review = session.exec(statement).first()
    #     # if existing_review:
    #     #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User has already reviewed this book")
    # else:
    #     # Xử lý trường hợp review ẩn danh nếu logic cho phép
    #     pass

    # 3. Tạo đối tượng Review model
    db_review = Review(
        book_id=book_id,
        # user_id=user_id, # Gán user_id (có thể là None)
        rating_star=review_create.rating_star,
        review_title=review_create.review_title, # Đổi tên field
        review_details=review_create.review_details, # Đổi tên field
        review_date=datetime.now(timezone.utc) # Gán ngày giờ thủ công
    )

    # 4. Lưu vào DB
    try:
        session.add(db_review)
        session.commit()
        session.refresh(db_review)
        # Có thể cần refresh relationship nếu response model cần dữ liệu lồng ghép
        # session.refresh(db_review, attribute_names=["user"])
    except Exception as e:
        session.rollback()
        print(f"Error saving review: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not save review")

    return db_review # Trả về đối tượng ORM