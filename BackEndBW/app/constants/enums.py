from enum import Enum

class SortFactor(str, Enum):
    """
    Enum for sorting factors.
    """
    SALE = "sale"
    POPULARITY = "popularity"
    PRICE = "price"

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