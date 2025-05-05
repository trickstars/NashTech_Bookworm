// src/api/reviewApi.ts
import {apiClient} from './apiClient';
import type { ReviewListResponse, ReviewParams, Review, ReviewCreatePayload } from '@/types/review'; // Import types
import axios from 'axios';

const ENDPOINTS = {
  REVIEWS: (productId: string | number) => `/books/${productId}/reviews`, // Ví dụ endpoint
};

export const getReviewsByProductId = async (
  productId: string | number,
  params: ReviewParams = {}
): Promise<ReviewListResponse> => {
  try {

    if (!productId || productId === 'undefined') {
      // Trả về trạng thái rỗng hợp lệ thay vì null
      throw Error("Book ID is missing");
    }

    const response = await apiClient.get<ReviewListResponse>(
      ENDPOINTS.REVIEWS(productId),
      { params }
    );
    // Giả sử backend trả về đúng cấu trúc ReviewListResponse
    // Axios interceptor sẽ tự camelize keys nếu cần
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) console.error(`Axios error fetching reviews for product ${productId}:`, error.message);
    else console.error(`Unexpected error fetching reviews for product ${productId}:`, error);
    // Trả về cấu trúc mặc định khi lỗi
    throw error
  }
};

// Thêm hàm post review nếu cần
// --- HÀM MỚI: Post Review ---
// Backend schema là ReviewCreate, frontend gửi ReviewCreatePayload (camelCase)
// Interceptor sẽ chuyển thành snake_case nếu cần
export const postReview = async (productId: string | number, reviewData: ReviewCreatePayload): Promise<Review> => {
  try {
      // Dùng authApiClient vì cần đăng nhập để post review
      // Backend sẽ tự lấy user_id từ token
      const response = await apiClient.post<Review>(ENDPOINTS.REVIEWS(productId), reviewData);
      // API trả về review vừa tạo (đã camelCase)
      return response.data;
  } catch (error: any) {
      console.error(`Error posting review for product ${productId}:`, error.response?.data || error.message);
      const detail = error.response?.data?.detail;
      throw new Error(typeof detail === 'string' ? detail : error.message || "Failed to submit review.");
  }
}
// --- ---