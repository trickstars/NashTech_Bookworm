// src/api/apiClient.ts
import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import humps from 'humps'; // Thư viện giúp chuyển đổi giữa snake_case và camelCase

// Lấy base URL của API từ biến môi trường
// Trong Vite, biến môi trường cần có tiền tố VITE_
// Ví dụ: tạo file .env ở gốc dự án với nội dung: VITE_API_BASE_URL=http://localhost:8000/api/v1
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; // Thay bằng URL backend FastAPI của bạn (ví dụ có prefix /api/v1)
const ACCESS_TOKEN_KEY = 'accessToken'; // Key lưu access token trong localStorage

console.log('API Base URL:', API_BASE_URL); // Để kiểm tra xem biến môi trường đã được đọc đúng chưa

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Accept: 'application/json', // Có thể thêm nếu backend yêu cầu
  },
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
});

// --- Interceptors (Áp dụng cho cả hai hoặc riêng biệt nếu cần) ---

// ==> Request Interceptor: Chuyển đổi data/params sang snake_case (áp dụng cho cả hai)
const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const newConfig = { ...config };
  // Chỉ decamelize nếu data là plain object
  if (newConfig.data && typeof newConfig.data === 'object' &&
      !(newConfig.data instanceof FormData) &&
      !(newConfig.data instanceof URLSearchParams) &&
      !(newConfig.data instanceof Blob))
  {
      newConfig.data = humps.decamelizeKeys(newConfig.data);
  }
  // Chuyển đổi params
  if (newConfig.params && typeof newConfig.params === 'object') {
      newConfig.params = humps.decamelizeKeys(newConfig.params);
  }
  return newConfig;
};

// ==> Response Interceptor: Chuyển đổi response keys sang camelCase (áp dụng cho cả hai)
const responseInterceptor = (response: AxiosResponse) => {
   if (response.data && typeof response.data === 'object') {
      if (!(response.data instanceof Blob)) {
          response.data = humps.camelizeKeys(response.data);
      }
   }
   return response;
};

const errorInterceptor = (error: any) => {
   // Có thể thêm xử lý lỗi chung ở đây
   console.error("API Error Interceptor:", error.response?.status, error.response?.data);
   return Promise.reject(error);
};

// Áp dụng interceptor chung cho cả hai client
apiClient.interceptors.request.use(requestInterceptor, errorInterceptor);
apiClient.interceptors.response.use(responseInterceptor, errorInterceptor);
authApiClient.interceptors.request.use(requestInterceptor, errorInterceptor); // Quan trọng: authApiClient cũng cần transform request data
authApiClient.interceptors.response.use(responseInterceptor, errorInterceptor);

// --- Interceptor CHỈ DÀNH CHO authApiClient: Thêm Authorization Header ---
authApiClient.interceptors.request.use(
 (config: InternalAxiosRequestConfig) => {
   const token = localStorage.getItem(ACCESS_TOKEN_KEY);
   if (token) {
     config.headers.Authorization = `Bearer ${token}`;
   } else {
     // Xử lý trường hợp không có token khi gọi API cần xác thực (tùy chọn)
     // Có thể hủy request hoặc để backend trả lỗi 401
     console.warn('No access token found for authenticated request to', config.url);
   }
   return config;
 },
 (error) => {
   return Promise.reject(error); // Chuyển lỗi request đi tiếp
 }
);
// --- ---

// Export cả hai instance
export { apiClient, authApiClient };