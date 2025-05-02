// src/api/bookApi.ts
import { Author } from '@/types/author';
import apiClient from './apiClient';
// Import kiểu Book từ nơi bạn định nghĩa
import type { Book } from '@/types/book'; // Giả sử bạn dùng alias @ -> src
import type { Category } from '@/types/category';

export interface GetBooksParams {
  page?: number;
  limit?: number;
  sortBy?: string;  // ví dụ: 'price', 'popularity', 'sale'
  order?: 'asc' | 'desc';
  categoryId?: number | string;
  authorId?: number | string;
  rating?: number;
  // Thêm các tham số khác nếu backend hỗ trợ
}

export interface BookListResponse {
  items: Book[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

// Định nghĩa các đường dẫn API (endpoint) - cần khớp với backend FastAPI của bạn
const ENDPOINTS = {
  ON_SALE: '/books/top-discounted', // Ví dụ endpoint sách giảm giá
  FEATURED_RECOMMENDED: '/books/recommended', // Ví dụ endpoint sách nổi bật + filter
  FEATURED_POPULAR: '/books/popular',
  // GET_BOOK_BY_ID: (id: string | number) => `/books/${id}`,
  CATEGORIES: '/categories', // Endpoint lấy danh sách category
  AUTHORS: '/authors',     // Endpoint lấy danh sách author
  BOOKS: '/books',         // Endpoint lấy danh sách sách (với filter/sort/page)
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiClient.get<Category[]>(ENDPOINTS.CATEGORIES);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) console.error('Axios error fetching categories:', error.message);
    else console.error('Unexpected error fetching categories:', error);
    return [];
  }
};

export const getAuthors = async (): Promise<Author[]> => {
  try {
    const response = await apiClient.get<Author[]>(ENDPOINTS.AUTHORS);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) console.error('Axios error fetching authors:', error.message);
    else console.error('Unexpected error fetching authors:', error);
    return [];
  }
};

// --- Hàm lấy sách tổng quát ---
export const getBooks = async (params: GetBooksParams = {}): Promise<BookListResponse> => {
  try {
    // Axios tự động chuyển object params thành query string
    const response = await apiClient.get<BookListResponse>(ENDPOINTS.BOOKS, { params });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) console.error('Axios error fetching books:', error.message);
    else console.error('Unexpected error fetching books:', error);
    // Trả về cấu trúc mặc định khi lỗi để tránh crash component
    return { items: [], totalItems: 0, totalPages: 1, currentPage: params.page || 1 };
  }
};

/**
 * Lấy danh sách sách đang giảm giá.
 * Giả định API trả về một mảng các đối tượng Book.
 */
export const getOnSaleBooks = async (): Promise<Book[]> => {
  try {
    const response = await apiClient.get<Book[]>(ENDPOINTS.ON_SALE);
    return response.data;
  } catch (error) {
    // Xử lý lỗi cơ bản: log lỗi và trả về mảng rỗng
    // Trong ứng dụng thực tế, bạn có thể muốn xử lý lỗi phức tạp hơn
    // (ví dụ: throw error để component cha bắt, hiển thị thông báo lỗi...)
    if (axios.isAxiosError(error)) {
      console.error('Axios error fetching on-sale books:', error.message, error.response?.data);
    } else {
      console.error('Unexpected error fetching on-sale books:', error);
    }
    return []; // Trả về mảng rỗng khi có lỗi
  }
};

/**
 * Lấy danh sách sách nổi bật - Recommended.
 * Giả định API trả về một mảng các đối tượng Book.
 */
export const getFeaturedRecommendedBooks = async (): Promise<Book[]> => {
  try {
    const response = await apiClient.get<Book[]>(ENDPOINTS.FEATURED_RECOMMENDED);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error fetching featured recommended books:', error.message, error.response?.data);
    } else {
      console.error('Unexpected error fetching featured recommended books:', error);
    }
    return [];
  }
};

/**
 * Lấy danh sách sách nổi bật - Popular.
 * Giả định API trả về một mảng các đối tượng Book.
 */
export const getFeaturedPopularBooks = async (): Promise<Book[]> => {
  try {
    const response = await apiClient.get<Book[]>(ENDPOINTS.FEATURED_POPULAR);
    return response.data;
  } catch (error) {
     if (axios.isAxiosError(error)) {
       console.error('Axios error fetching featured popular books:', error.message, error.response?.data);
     } else {
       console.error('Unexpected error fetching featured popular books:', error);
     }
    return [];
  }
};

// --- Ví dụ cho hàm lấy sách có phân trang/filter cho trang Shop sau này ---
/*
import type { AxiosRequestConfig } from 'axios';

export interface BookListResponse {
  items: Book[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface GetBooksParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  // Thêm các tham số filter khác nếu cần
  category?: string;
  author?: string;
}

export const getBooks = async (params: GetBooksParams = {}): Promise<BookListResponse> => {
  try {
    // Chuyển đổi params thành query string nếu cần gửi theo cách đó
    const config: AxiosRequestConfig = { params };
    const response = await apiClient.get<BookListResponse>(ENDPOINTS.GET_BOOKS, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error fetching books:', error.message, error.response?.data);
    } else {
      console.error('Unexpected error fetching books:', error);
    }
    // Trả về cấu trúc dữ liệu mặc định khi lỗi
    return { items: [], totalItems: 0, totalPages: 1, currentPage: 1 };
  }
};
*/

// Import axios để dùng isAxiosError
import axios from 'axios';