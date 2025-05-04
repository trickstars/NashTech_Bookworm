# app/routers/orders_route.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

# Import Schemas
from ..schemas.order import OrderCreate, OrderRead, OrderItemRead
# Import Dependencies
from ..dependencies.db_dep import SessionDep
from ..dependencies.auth_dep import CurrentUser # Import dependency lấy user hiện tại
# Import Service function
from ..services.orders_service import create_order_service
# Import User model để dùng trong CurrentUser type hint
from ..models import User

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
async def create_new_order(
    order_data: OrderCreate, # Dữ liệu từ body request
    session: SessionDep,
    current_user: CurrentUser # Lấy user đang đăng nhập từ dependency
):
    """
    Tạo một đơn hàng mới cho người dùng đang đăng nhập.
    Frontend gửi lên danh sách items: [{"book_id": id, "quantity": qty}, ...]
    """
    if not current_user or current_user.id is None:
         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    try:
        # Gọi service để tạo order, truyền vào user_id
        created_order = await create_order_service(
            session=session,
            order_create=order_data,
            user_id=current_user.id
        )
        # Service trả về đối tượng Order ORM, FastAPI tự chuyển thành OrderRead response model
        return created_order
    except HTTPException as http_exc:
        # Nếu service raise HTTPException (ví dụ: book not found), thì raise lại nó
        raise http_exc
    except Exception as e:
        # Bắt các lỗi khác từ service
        print(f"Error in create order route: {e}") # Log lỗi
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An error occurred while creating the order.")

# --- Thêm các endpoint khác cho Order nếu cần (GET orders, GET order by ID...) ---
# Ví dụ:
# @router.get("/my-orders", response_model=List[OrderRead])
# async def get_my_orders(session: SessionDep, current_user: CurrentUser):
#     # ... logic lấy orders của current_user.id ...
#     pass