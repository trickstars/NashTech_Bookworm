// src/types/review.ts

// Schema cho một review item đọc từ API
export interface Review {
  // Các trường này tương ứng với ReviewPublic backend (đã camelCase)
  // id: number | string; // Backend ReviewPublic không có id? Nếu cần thì thêm
  reviewTitle: string;
  reviewDetails: string | null;
  reviewDate: string; // Hoặc Date nếu bạn parse
  ratingStar: number;
  // Thêm các trường khác nếu backend trả về (ví dụ thông tin user)
  // user?: { id: number | string; firstName: string; lastName: string; };
}

// Schema cho response từ API lấy danh sách review
export interface ReviewListResponse {
  items: Review[];
  totalItems: number;          // <-- Thêm lại theo schema mới nhất
  totalPages: number;
  currentPage: number;
  averageRating: number | null;
  ratingCount: number;           // Tổng số review
  ratingCounts: Record<string, number>; // { "5": count, "4": count, ... }
}

// Schema cho tham số query khi lấy list review
export interface ReviewParams {
    page?: number;
    limit?: number;
    // Đổi thành sortBy và order để khớp với logic state/handler hiện tại
    orderBy?: 'date' | 'rating';
    order?: 'asc' | 'desc';
    rating?: number; // Filter theo sao cụ thể
}

// Schema cho dữ liệu gửi lên khi tạo review mới
export interface ReviewCreatePayload {
    ratingStar: number;
    reviewTitle: string; // Tên field khớp với frontend state/form
    reviewDetails?: string;
}