// src/api/apiClient.ts
import axios from 'axios';
// import { refreshTokenApi } from './authApi';
import { addAuthorizationHeader, errorInterceptor, handleApiError, handleAuthApiError, requestInterceptor, responseInterceptor } from './interceptors';

// Lấy base URL của API từ biến môi trường
// Trong Vite, biến môi trường cần có tiền tố VITE_
// Ví dụ: tạo file .env ở gốc dự án với nội dung: VITE_API_BASE_URL=http://localhost:8000/api/v1
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; // Thay bằng URL backend FastAPI của bạn (ví dụ có prefix /api/v1)

console.log('API Base URL:', API_BASE_URL); // Để kiểm tra xem biến môi trường đã được đọc đúng chưa

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Accept: 'application/json', // Có thể thêm nếu backend yêu cầu
  },
  withCredentials: true, // <-- Đảm bảo có dòng này
  // --- Thêm transform cho response và request ---
  // Biến đổi keys của response data từ snake_case thành camelCase
  // transformResponse: [
  //   ...(axios.defaults.transformResponse as any[]), // Giữ các transform mặc định
  //   (data) => humps.camelizeKeys(data), // Áp dụng camelizeKeys
  // ],
  // (Tùy chọn) Biến đổi keys của request data từ camelCase thành snake_case
  // Chỉ cần nếu backend yêu cầu snake_case cho request body/params
  // transformRequest: [
  //   (data) => humps.decamelizeKeys(data), // Áp dụng decamelizeKeys
  //   ...(axios.defaults.transformRequest as any[]), // Giữ các transform mặc định
  // ],
});

// --- Instance Axios cho các request CẦN XÁC THỰC (Authenticated) ---
const authApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // <-- Đảm bảo có dòng này
});

// Áp dụng interceptor chung cho cả hai client
apiClient.interceptors.request.use(requestInterceptor, handleApiError);
apiClient.interceptors.response.use(responseInterceptor, handleApiError);
authApiClient.interceptors.request.use(requestInterceptor, handleApiError); // Quan trọng: authApiClient cũng cần transform request data
authApiClient.interceptors.response.use(responseInterceptor, handleAuthApiError);

// --- Interceptor CHỈ DÀNH CHO authApiClient: Thêm Authorization Header ---
authApiClient.interceptors.request.use(addAuthorizationHeader);
// --- ---

// Export cả hai instance
export { apiClient, authApiClient };