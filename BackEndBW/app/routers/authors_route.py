from fastapi import APIRouter, HTTPException
from sqlmodel import select

from ..dependencies.db_dep import SessionDep
from ..models import Author
from ..schemas.author import AuthorCreate, AuthorPublic, AuthorUpdate

router = APIRouter(prefix='/authors', tags=["authors"])

@router.get("/", response_model=list[AuthorPublic])
async def get_all_authors(session: SessionDep) -> list[Author]:
    authors = session.exec(select(Author).order_by(Author.author_name)).all()
    # print(authors)
    if len(authors) == 0:
        raise HTTPException(status_code=404, detail="Resources not found")
    return authors

@router.get("/{author_id}")
async def get_author_by_id(author_id: int, session: SessionDep) -> Author:
    author = session.get(Author, author_id)
    if author is None:
        raise HTTPException(status_code=404, detail="Resources not found")
    return author

@router.post("/")
async def create_author(create_author_info: AuthorCreate, session: SessionDep) -> Author:
    new_author = Author.model_validate(create_author_info)
    session.add(new_author)
    session.commit()
    session.refresh(new_author)
    return new_author

@router.patch("/{author_id}")
async def update_author(author_id: int, update_author_info: AuthorUpdate, session: SessionDep) -> Author:
    author = session.get(Author, author_id)
    if author is None:
        raise HTTPException(status_code=404, detail="Resources not found")
    author_data = update_author_info.model_dump(exclude_unset=True)
    author.sqlmodel_update(author_data)
    session.add(author)
    session.commit()
    session.refresh(author)
    return author

@router.delete("/{author_id}")
async def delete_author(author_id: int, session: SessionDep):
    author = session.get(Author, author_id)
    if author is None:
        raise HTTPException(status_code=404, detail="Resources not found")
    session.delete(author)
    session.commit()
    return {"message": "Resource deleted"}