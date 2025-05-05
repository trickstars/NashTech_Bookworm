from enum import Enum

class BookSortFactor(str, Enum):
    """
    Enum for book sorting factors.
    """
    SALE = "sale"
    POPULARITY = "popularity"
    PRICE = "price"

class ReviewSortFactor(str, Enum):
    """
    Enum for review sorting factors.
    """
    DATE = "date"

class SortOrder(str, Enum):
    """
    Enum for sorting order.
    """
    ASCENDING = "asc"
    DESCENDING = "desc"

class Featured(str, Enum):
    """
    Enum for featured books.
    """
    RECOMMENDED = "recommended"
    POPULAR = "popular"