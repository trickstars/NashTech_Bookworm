from sqlmodel import SQLModel, Field

class AuthorBase(SQLModel):
    author_name: str = Field(max_length=255)
    author_bio: str | None = Field(default=None)

class AuthorCreate(AuthorBase):
    pass 

class AuthorUpdate(AuthorBase):
    author_name: str | None = None
    author_bio: str | None = None

class AuthorPublic(AuthorBase):
    id: int
    author_bio: str = Field(default=None, exclude=True)