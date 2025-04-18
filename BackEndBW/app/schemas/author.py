from sqlmodel import SQLModel, Field

class AuthorBase(SQLModel):
    author_name: str = Field(max_length=255)
    author_bio: str

class AuthorCreate(AuthorBase):
    pass 

class AuthorUpdate(AuthorBase):
    author_name: str | None = None
    author_bio: str | None = None