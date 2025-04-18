from sqlmodel import SQLModel, Field

class CategoryBase(SQLModel):
    category_name: str = Field(max_length=120)
    category_desc: str = Field(max_length=255)

class CategoryCreate(CategoryBase):
    pass 

class CategoryUpdate(CategoryBase):
    category_name: str | None = None
    category_desc: str | None = None