# app/services/order_service.py
from typing import List, Optional
from sqlmodel import Session, select, case, and_, or_
from fastapi import HTTPException, status
from datetime import date, datetime, timezone

from app.models import Order, OrderItem, Book, Discount, User # Import các model cần thiết
from app.schemas.order import OrderCreate, OrderItemBase # Import schema input

# Ok, đã hiểu. Nếu frontend sẽ tự tính toán và gửi lên giá cuối cùng (price) cho từng OrderItem (đã bao gồm cả discount nếu có), thì logic ở backend create_order_service sẽ trở nên đơn giản hơn đáng kể. Chúng ta sẽ không cần join với bảng Discount hay Book để lấy/tính giá nữa, mà sẽ tin tưởng vào giá mà frontend gửi lên trong schema OrderItemBase.

# Lưu ý quan trọng về bảo mật: Việc hoàn toàn tin tưởng giá từ client có thể tiềm ẩn rủi ro nếu kẻ xấu cố tình sửa đổi giá gửi lên. Trong môi trường production thực tế, bạn nên cân nhắc việc backend vẫn phải xác minh lại giá hoặc tính toán lại giá dựa trên book_id và các quy tắc khuyến mãi hiện hành để đảm bảo tính toàn vẹn. Tuy nhiên, tôi sẽ thực hiện theo yêu cầu của bạn là sử dụng giá do frontend cung cấp.

async def create_order_service(session: Session, order_create: OrderCreate, user_id: int) -> Order:
    """
    Tạo đơn hàng mới cho người dùng đã xác thực.
    """
    if not order_create.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot create an empty order")
    
    # print("Order nay ntn?", order_create.items)

    total_amount = 0.0
    order_items_to_create: List[OrderItem] = []
    book_ids = [item.book_id for item in order_create.items]
    # print("Tao day ne", book_ids)

    # --- Kiểm tra sự tồn tại của các Book ID ---
    # Query để lấy các ID sách thực sự tồn tại trong DB từ danh sách ID gửi lên
    stmt = select(Book.id).where(Book.id.in_(book_ids))
    existing_book_ids_result = session.exec(stmt)
    existing_book_ids = set(existing_book_ids_result.all())
    # print("To day ne", existing_book_ids)

    # --- Validate và tạo list OrderItem Objects ---
    for item_data in order_create.items:
        # Kiểm tra xem book_id client gửi lên có thực sự tồn tại không
        if item_data.book_id not in existing_book_ids:
            # print("VO DAY CHUA M??")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, # Hoặc 400 Bad Request
                detail={
                "error_code": "BOOK_NOT_FOUND",
                "message": f"Could not create order. Some books are missing",
                "missing_book_id": item_data.book_id
            }
            )

        # --- Sử dụng giá từ client ---
        # !!! Cảnh báo Bảo mật: Tin tưởng giá từ client có thể rủi ro !!!
        # Nên có bước xác thực giá ở đây trong môi trường production.
        item_price = item_data.price
        # --- ---
        # Kiểm tra số lượng hợp lệ (Schema đã làm nhưng kiểm tra lại nếu cần)
        if not (1 <= item_data.quantity <= 8):
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid quantity for book ID {item_data.book_id}")

        item_total = item_price * item_data.quantity
        total_amount += item_total

        # Tạo đối tượng OrderItem với giá từ client
        order_item = OrderItem(
            book_id=item_data.book_id,
            quantity=item_data.quantity,
            price=item_price # <-- Sử dụng giá từ item_data
            # order_id sẽ được gán sau khi Order được tạo
        )
        order_items_to_create.append(order_item)

    # --- Tạo đối tượng Order ---
    new_order = Order(
        user_id=user_id,
        order_amount=round(total_amount, 2),
        order_date=datetime.now(timezone.utc) # Gán ngày giờ thủ công
    )

    # print("TOI DUOC DAY CHUA???")

    # --- Thêm vào Session và Commit ---
    try:
        session.add(new_order)
        session.commit()
        session.refresh(new_order)

        for item in order_items_to_create:
            item.order_id = new_order.id
            session.add(item)

        session.commit()
        session.refresh(new_order, attribute_names=["items"])

    except Exception as e:
        session.rollback()
        print(f"Error creating order: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create order")

    return new_order # Trả về đối tượng Order ORM
