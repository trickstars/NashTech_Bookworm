// src/api/reviewApi.ts
import apiClient from './apiClient';
import type { ReviewListResponse, ReviewParams } from '@/types/review'; // Import types
import axios from 'axios';

const ENDPOINTS = {
  REVIEWS: (productId: string | number) => `/products/${productId}/reviews`, // Ví dụ endpoint
};

export const getReviewsByProductId = async (
  productId: string | number,
  params: ReviewParams = {}
): Promise<ReviewListResponse> => {
  try {
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
    return { items: [], totalItems: 0, totalPages: 1, currentPage: params.page || 1 };
  }
};

// Thêm hàm post review nếu cần
// export const postReview = async (productId: string | number, reviewData: any) => { ... };