// src/api/bookApi.ts
import { Author } from '@/types/author';
import {apiClient} from './apiClient';
// Import kiểu Book từ nơi bạn định nghĩa
import type { Book, BookDetail } from '@/types/book'; // Giả sử bạn dùng alias @ -> src
import type { Category } from '@/types/category';

export interface GetBooksParams {
  // Filter options (có thể là number hoặc null)
  category?: number | null; // Đổi từ categoryId, kiểu number | null
  author?: number | null;   // Đổi từ authorId, kiểu number | null
  rating?: number | null;   // Giữ nguyên, kiểu number | null

  // Sort options
  order_by?: 'sale' | 'popularity' | 'price'; // Đổi từ sortBy, dùng literal type
  order?: 'asc' | 'desc';                             // Giữ nguyên, optional

  // Pagination options
  page?: number;           // Giữ nguyên, optional (backend có default)
  limit?: number;          // Giữ nguyên, optional
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
  CATEGORIES: '/categories', // Endpoint lấy danh sách category
  AUTHORS: '/authors',     // Endpoint lấy danh sách author
  BOOKS: '/books',         // Endpoint lấy danh sách sách (với filter/sort/page)
  GET_BOOK_BY_ID: (id: string | number) => `/books/${id}`, // Endpoint lấy sách theo ID
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

export const getBookById = async (id: string | number): Promise<BookDetail | null> => {
  // Không fetch nếu không có ID hợp lệ
  if (!id || id === 'undefined') {
      console.warn("getBookById called with invalid ID:", id);
      return null;
  }
  try {
    // apiClient sẽ tự động chuyển key trả về thành camelCase
    const response = await apiClient.get<BookDetail>(ENDPOINTS.GET_BOOK_BY_ID(id));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Axios error fetching book ${id}:`, error.message, error.response?.status);
      // Trả về null nếu là lỗi 404 Not Found
      if (error.response?.status === 404) {
        return null;
      }
      // Có thể throw lỗi khác để component xử lý
      throw new Error(`Failed to fetch book ${id}: ${error.message}`);
    } else {
      console.error(`Unexpected error fetching book ${id}:`, error);
      throw new Error(`An unexpected error occurred while fetching book ${id}`);
    }
    // return null; // Hoặc luôn trả về null khi lỗi
  }
};

// Import axios để dùng isAxiosError
import axios from 'axios';