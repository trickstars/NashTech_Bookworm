from pydantic import BaseModel
from ..constants.enums import BookSortFactor, ReviewSortFactor, SortOrder

class BookFilterParam(BaseModel):
    """
    Query parameters for filtering data.
    """
    author: int | None = None
    category: int | None = None
    rating: int | None = None

class ReviewFilterParam(BaseModel):
    rating: int | None = None

class OrderParam(BaseModel):
    """
    Query parameters for ordering data.
    """
    order_by: str | None = None
    order: SortOrder = SortOrder.DESCENDING

class BookOrderParam(OrderParam):
    order_by: BookSortFactor | None = None

class ReviewOrderParam(OrderParam):
    order_by: ReviewSortFactor | None = None

class PaginationParam(BaseModel):
    """
    Query parameters for pagination.
    """
    page: int = 1
    limit: int = 20