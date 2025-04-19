from sqlmodel import SQLModel, Field

class CategoryBase(SQLModel):
    category_name: str = Field(max_length=120, unique=True)
    category_desc: str | None = Field(default=None, max_length=255)

class CategoryCreate(CategoryBase):
    pass 

class CategoryUpdate(CategoryBase):
    category_name: str | None = None
    category_desc: str | None = None