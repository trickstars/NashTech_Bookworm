from sqlmodel import SQLModel, Field
from pydantic import BaseModel
from datetime import datetime

class ReviewBase(SQLModel):
    review_title: str = Field(max_length=120)
    review_details: str | None = Field(default=None)
    review_date: datetime
    rating_star: int = Field(ge=1, le=5)

class ReviewPublic(ReviewBase):
    pass

class ReviewCreate(ReviewBase):
    # book_id: int
    review_date: datetime | None = Field(default=None, exclude=True)

class ReviewListResponse(BaseModel):
    items: list[ReviewPublic]
    total_items: int
    total_pages: int
    current_page: int
    average_rating: float | None = None
    rating_count: int = 0
    # Đổi kiểu thành Dict[str, int] (key là "1", "2",..., "5")
    rating_counts: dict[str, int] = {}