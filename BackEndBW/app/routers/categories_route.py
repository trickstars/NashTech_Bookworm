from fastapi import APIRouter, HTTPException
from sqlmodel import select

from ..dependencies.db_dep import SessionDep
from ..models import Category
from ..schemas.category import CategoryCreate, CategoryPublic, CategoryUpdate

router = APIRouter(prefix='/categories', tags=["categories"])

@router.get("/", response_model=list[CategoryPublic])
async def get_all_categories(session: SessionDep) -> list[Category]:
    categories = session.exec(select(Category).order_by(Category.category_name)).all()
    # print(categories)
    if len(categories) == 0:
        raise HTTPException(status_code=404, detail="Resources not found")
    return categories

@router.get("/{category_id}")
async def get_category_by_id(category_id: int, session: SessionDep) -> Category:
    category = session.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Resources not found")
    return category

@router.post("/")
async def create_category(create_category_info: CategoryCreate, session: SessionDep) -> Category:
    new_category = Category.model_validate(create_category_info)
    session.add(new_category)
    session.commit()
    session.refresh(new_category)
    return new_category

@router.patch("/{category_id}")
async def update_category(category_id: int, update_category_info: CategoryUpdate, session: SessionDep) -> Category:
    category = session.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Resources not found")
    category_data = update_category_info.model_dump(exclude_unset=True)
    category.sqlmodel_update(category_data)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category

@router.delete("/{category_id}")
async def delete_category(category_id: int, session: SessionDep):
    category = session.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Resources not found")
    session.delete(category)
    session.commit()
    return {"message": "Resource deleted"}