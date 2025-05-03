// src/api/authApi.ts
import apiClient from './apiClient';
// Import các kiểu dữ liệu cần thiết
import type { TokenResponse } from '@/types/token'; // Giả sử bạn định nghĩa TokenResponse trong types
import type { User } from '@/types/user'; // Giả sử bạn định nghĩa User (chỉ chứa id, email, fullName...)
import axios from 'axios';

const ENDPOINTS = {
  LOGIN: '/auth/token', // Endpoint /token của FastAPI
  GET_ME: '/auth/users/me', // Endpoint lấy thông tin user hiện tại
};

/**
 * Gọi API đăng nhập.
 * FastAPI OAuth2PasswordRequestForm yêu cầu 'x-www-form-urlencoded'.
 */
export const loginUser = async (emailAsUsername: string, password: string): Promise<TokenResponse> => {
  // Tạo đối tượng FormData hoặc URLSearchParams
  const formData = new URLSearchParams();
  formData.append('username', emailAsUsername); // Backend mong đợi key 'username'
  formData.append('password', password);
  // formData.append('scope', ''); // Thêm scope nếu cần
  // formData.append('client_id', ''); // Thêm nếu backend yêu cầu client credentials
  // formData.append('client_secret', '');

  try {
    const response = await apiClient.post<TokenResponse>(ENDPOINTS.LOGIN, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' } // Quan trọng: Set header
    });
    // Axios interceptor sẽ tự camelize response keys (accessTokenResponse, refreshTokenResponse)
    return response.data;
  } catch (error: any) {
    // Ném lỗi để component gọi có thể bắt và hiển thị
    console.error("Login API error:", error.response?.data || error.message);
    const detail = error.response?.data?.detail || "Login failed. Please check credentials.";
    throw new Error(detail); // Ném lỗi với thông điệp từ backend nếu có
  }
};

/**
 * Gọi API để lấy thông tin user đang đăng nhập bằng Access TokenResponse.
 */
export const getMe = async (token: string): Promise<User | null> => {
  if (!token) return null;
  try {
    const response = await apiClient.get<User>(ENDPOINTS.GET_ME, {
      headers: { Authorization: `Bearer ${token}` } // Gửi token trực tiếp ở đây
      // Hoặc cấu hình interceptor trong apiClient để tự động thêm header này
    });
    // Axios interceptor sẽ tự camelize response keys (id, email, fullName...)
    return response.data;
  } catch (error) {
    // Nếu lỗi (ví dụ: token hết hạn, không hợp lệ), trả về null
    if (axios.isAxiosError(error)) {
        console.warn("Get Me API error:", error.response?.status, error.response?.data || error.message);
    } else {
        console.error("Unexpected error fetching user:", error);
    }
    return null;
  }
};