// src/types/order.ts

// Import các kiểu phụ thuộc nếu cần lồng ghép (ví dụ: Book)
// import type { Book } from './book';
// import type { User } from './user';

/**
 * Đại diện cho một mục (item) trong đơn hàng khi đọc dữ liệu.
 * Tương ứng với OrderItemRead schema ở backend (đã camelCase).
 */
export interface OrderItem {
    // id: number | string;
    bookId: number | string;  // từ book_id
    quantity: number;
    price: number;           // Giá tại thời điểm đặt hàng (từ price)
    // book?: Book; // Tùy chọn: Nếu API trả về thông tin sách lồng nhau
  }
  
  /**
   * Đại diện cho một đơn hàng khi đọc dữ liệu.
   * Tương ứng với OrderRead schema ở backend (đã camelCase).
   */
//   export interface Order {
//     id: number | string;
//     userId: number | string | null; // từ user_id (có thể null)
//     orderDate: string; // từ order_date (thường là chuỗi ISO 8601 từ JSON)
//     orderAmount: number; // từ order_amount
//     items: OrderItem[];   // Mảng các OrderItem
//     // user?: User; // Tùy chọn: Nếu API trả về thông tin user lồng nhau
//   }
  
  // --- Các kiểu dùng cho việc *tạo* đơn hàng (gửi lên API) ---
  
  /**
   * Dữ liệu cho một item khi gửi yêu cầu tạo đơn hàng.
   * Chỉ chứa thông tin cần thiết mà frontend gửi đi.
   */
//   export interface OrderItemCreatePayload {
//     bookId: number | string;
//     quantity: number;
//     // Không cần gửi price vì backend sẽ tự lấy/xác thực
//   }
  
  /**
   * Dữ liệu cho toàn bộ request body khi tạo đơn hàng.
   */
  export interface OrderCreate {
    items: OrderItem[];
  }

  // --- Types cho việc ĐỌC Order (Nhận từ API) ---

// Định nghĩa item trong đơn hàng đã tạo (response)
export interface OrderItemRead extends OrderItem { // Kế thừa từ OrderItem
    id: number | string; // Thêm id của OrderItem
    // book?: Book; // Tùy chọn lồng ghép
}

// Định nghĩa đơn hàng đã tạo (response)
export interface Order {
  id: number | string;
  userId: number | string | null;
  orderDate: string; // Thường là ISO string
  orderAmount: number;
  items: OrderItemRead[]; // Mảng các OrderItemRead
  // user?: User; // Tùy chọn lồng ghép
}