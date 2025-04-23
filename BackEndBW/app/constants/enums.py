from enum import Enum

class SortFactor(str, Enum):
    """
    Enum for sorting factors.
    """
    SALE = "sale"
    POPULARITY = "popularity"
    PRICE = "price"