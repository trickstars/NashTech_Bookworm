from pydantic import BaseModel
from ..constants.enums import SortFactor

class FilterParam(BaseModel):
    """
    Query parameters for filtering data.
    """
    author: int | None = None
    category: int | None = None
    rating: int | None = None

class OrderParam(BaseModel):
    """
    Query parameters for ordering data.
    """
    order_by: SortFactor | None = None
    asc: bool = False

class PaginationParam(BaseModel):
    """
    Query parameters for pagination.
    """
    page: int = 1
    limit: int = 20