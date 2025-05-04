// src/api/authApi.ts
import {apiClient, authApiClient} from './apiClient';
// Import các kiểu dữ liệu cần thiết
import type { TokenResponse } from '@/types/token'; // Giả sử bạn định nghĩa TokenResponse trong types
import type { User } from '@/types/user'; // Giả sử bạn định nghĩa User (chỉ chứa id, email, fullName...)
import axios from 'axios';

const ENDPOINTS = {
  LOGIN: '/auth/token', // Endpoint /token của FastAPI
  GET_ME: '/auth/users/me', // Endpoint lấy thông tin user hiện tại
  REFRESH: '/auth/refresh', // <-- Endpoint refresh token
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

// --- HÀM MỚI CHO REFRESH TOKEN ---
/**
 * Gửi refresh token hiện tại để lấy cặp token mới.
 * Sử dụng apiClient vì request này tự nó là một hình thức xác thực.
 */
export const refreshTokenApi = async (currentRefreshToken: string): Promise<TokenResponse> => {
  // Backend mong đợi {"refresh_token": "..."} sau khi decamelize
  const payload = { refreshToken: currentRefreshToken };
  try {
      // Gọi endpoint /auth/refresh
      const response = await apiClient.post<TokenResponse>(ENDPOINTS.REFRESH, payload);
      // Response data đã được camelize bởi interceptor của apiClient
      return response.data;
  } catch (error) {
      console.error("Refresh token API error:", error);
      // Ném lỗi để interceptor gốc (handleAuthApiError) xử lý việc logout
      throw error;
  }
}
// --- ---

/**
 * Gọi API để lấy thông tin user đang đăng nhập bằng Access TokenResponse.
 */
export const getMe = async (): Promise<User | null> => {
  // if (!token) return null;
  try {
    const response = await authApiClient.get<User>('/auth/users/me');
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