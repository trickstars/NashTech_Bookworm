// src/types/review.ts
export interface Review {
    id: number | string;
    title: string;
    rating: number; // Hoặc ratingStar
    date: string; // Hoặc Date
    text: string;
    // Thêm tên người review nếu có
    // reviewerName?: string;
  }
  
  export interface ReviewListResponse {
    items: Review[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    averageRating?: number; // Có thể trả về rating trung bình từ API
    ratingCounts?: { stars: number; count: number }[]; // Phân loại rating
  }
  
  export interface ReviewParams {
    page?: number;
    limit?: number;
    sortBy?: 'date' | 'rating'; // Ví dụ
    order?: 'asc' | 'desc';
    rating?: number; // Lọc theo số sao cụ thể
  }