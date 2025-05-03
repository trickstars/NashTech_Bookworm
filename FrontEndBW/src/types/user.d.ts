// src/types/user.ts

// Định nghĩa cấu trúc dữ liệu User mà frontend sẽ sử dụng
// Dựa trên schema UserRead của backend (đã camelCase)
export interface User {
    firstName: string;
    lastName: string;
    admin: boolean; // Chuyển 'admin' thành 'isAdmin' cho rõ nghĩa (tùy chọn)
    id: number;
  }
  
  // Có thể dùng alias nếu tên UserRead đã được dùng ở nơi khác
  // export type AuthenticatedUser = User;