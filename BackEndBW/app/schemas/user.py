from sqlmodel import Field, SQLModel

class UserBase(SQLModel):
    first_name: str = Field(max_length=50)
    last_name: str = Field(max_length=50)
    email: str = Field(max_length=70)
    password: str = Field(max_length=255)
    admin: bool = Field(default=False)

class UserPublic(UserBase):
    id: int
    email: str | None = Field(default=None, exclude=True)
    password: str | None = Field(default=None, exclude=True)