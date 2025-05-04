// src/api/apiClient.ts
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import humps from 'humps'; // Thư viện giúp chuyển đổi giữa snake_case và camelCase
import { refreshTokenApi } from './authApi';

// Lấy base URL của API từ biến môi trường
// Trong Vite, biến môi trường cần có tiền tố VITE_
// Ví dụ: tạo file .env ở gốc dự án với nội dung: VITE_API_BASE_URL=http://localhost:8000/api/v1
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; // Thay bằng URL backend FastAPI của bạn (ví dụ có prefix /api/v1)
const ACCESS_TOKEN_KEY = 'accessToken'; // Key lưu access token trong localStorage
const REFRESH_TOKEN_KEY = 'refreshToken'

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
    console.log("Truoc hum", newConfig.data)
      newConfig.data = humps.decamelizeKeys(newConfig.data);
    console.log("Sau hum", newConfig.data)

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


// --- Biến cờ để tránh gọi refresh liên tục ---
let isRefreshing = false;
// --- Hàng đợi các request bị lỗi 401 trong khi đang refresh ---
// Lưu ý: Đây là cách xử lý queue đơn giản, có thể cần thư viện nếu logic phức tạp hơn
let failedQueue: { resolve: (value: any) => void; reject: (reason?: any) => void; config: InternalAxiosRequestConfig }[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      // Gắn token mới vào config và retry request trong queue
      prom.config.headers['Authorization'] = 'Bearer ' + token;
      // Dùng authApiClient để retry vì đây là request cần xác thực
      prom.resolve(authApiClient(prom.config));
    }
  });
  failedQueue = []; // Xóa hàng đợi
};

// --- Interceptor xử lý lỗi cho authApiClient ---
export const handleAuthApiError = async (error: AxiosError): Promise<AxiosResponse | AxiosError> => {
  const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
  
  // Chỉ xử lý lỗi 401, không phải từ endpoint refresh và chưa thử retry
  if (error.response?.status === 401 && originalRequest.url !== '/auth/refresh' && !originalRequest._retry) {

    // Nếu đang refresh rồi thì đưa request vào hàng đợi
    if (isRefreshing) {
      console.log("Request added to refresh queue:", originalRequest.url);
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }
    
    console.log("Access token expired/invalid. Attempting refresh...");
    originalRequest._retry = true; // Đánh dấu đã thử retry
    isRefreshing = true;
    
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    
    if (!storedRefreshToken) {
      console.log("No refresh token found. Logout needed.");
      isRefreshing = false;
      // TODO: Trigger logout (ví dụ: dùng event bus hoặc gọi hàm global)
      // logoutUserGlobally(); // Hàm giả định
      // window.location.href = '/login'; // Hoặc redirect cứng
      return Promise.reject(error);
    }
    
    try {
      // Gọi API refresh token
      const tokenResponse = await refreshTokenApi(storedRefreshToken);
      
      console.log("Token refresh successful.");
      // Lưu token mới
      localStorage.setItem(ACCESS_TOKEN_KEY, tokenResponse.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokenResponse.refreshToken);
      
      // Cập nhật header mặc định cho các request sau của authApiClient (tùy chọn)
      // authApiClient.defaults.headers.common['Authorization'] = `Bearer ${tokenResponse.accessToken}`;
      
      // Cập nhật header cho request gốc bị lỗi
      if (originalRequest.headers) {
        originalRequest.headers['Authorization'] = `Bearer ${tokenResponse.accessToken}`;
      }
      
      // Xử lý các request trong hàng đợi với token mới
      processQueue(null, tokenResponse.accessToken);
      
      // Retry request gốc với token mới
      console.log("Retrying original request:", originalRequest.url);
      return authApiClient(originalRequest); // <-- Retry request
      
    } catch (refreshError: any) {
      console.error("Refresh token failed:", refreshError);
      // Xử lý lỗi khi refresh thất bại -> logout
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      
      // Xử lý các request trong hàng đợi -> reject hết
      processQueue(refreshError instanceof Error ? refreshError : new Error("Refresh token failed"), null);
      
      // TODO: Trigger logout (ví dụ: dùng event bus hoặc gọi hàm global)
      // logoutUserGlobally();
      // window.location.href = '/login'; // Hoặc redirect cứng
      
      return Promise.reject(refreshError); // Ném lại lỗi refresh hoặc lỗi gốc ban đầu
      
    } finally {
      // Reset cờ sau khi xử lý xong (kể cả lỗi hay thành công)
      isRefreshing = false;
    }
  }
  
  // Với các lỗi khác hoặc đã retry, chỉ cần log và ném lại
  console.error("API Error Interceptor (Unhandled or Retry Failed):", error.response?.status, error.message);
  return Promise.reject(error);
};

// Áp dụng interceptor chung cho cả hai client
apiClient.interceptors.request.use(requestInterceptor, errorInterceptor);
apiClient.interceptors.response.use(responseInterceptor, errorInterceptor);
authApiClient.interceptors.request.use(requestInterceptor, errorInterceptor); // Quan trọng: authApiClient cũng cần transform request data
authApiClient.interceptors.response.use(responseInterceptor, handleAuthApiError);

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