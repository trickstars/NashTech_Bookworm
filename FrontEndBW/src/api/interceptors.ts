// --- Interceptors (Áp dụng cho cả hai hoặc riêng biệt nếu cần) ---
import humps from 'humps'; // Thư viện giúp chuyển đổi giữa snake_case và camelCase

import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { refreshTokenApi } from './authApi';
import { authApiClient } from './apiClient';

const ACCESS_TOKEN_KEY = 'accessToken'; // Key lưu access token trong localStorage
// const REFRESH_TOKEN_KEY = 'refreshToken'

// --- Interceptor xử lý lỗi cho authApiClient ---
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
    
    // const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    
    // if (!storedRefreshToken) {
    //   console.log("No refresh token found. Logout needed.");
    //   isRefreshing = false;
    //   // TODO: Trigger logout (ví dụ: dùng event bus hoặc gọi hàm global)
    //   // logoutUserGlobally(); // Hàm giả định
    //   // window.location.href = '/login'; // Hoặc redirect cứng
    //   return Promise.reject(error);
    // }
    
    try {
      // Gọi API refresh token
      const tokenResponse = await refreshTokenApi();
      
      console.log("Token refresh successful.");
      // Lưu token mới
      localStorage.setItem(ACCESS_TOKEN_KEY, tokenResponse.accessToken);
      // localStorage.setItem(REFRESH_TOKEN_KEY, tokenResponse.refreshToken);
      
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
      isRefreshing = false;
      return authApiClient(originalRequest); // <-- Retry request
      
    } catch (refreshError: any) {
      console.error("Refresh token failed:", refreshError);
      // Xử lý lỗi khi refresh thất bại -> logout
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      // localStorage.removeItem(REFRESH_TOKEN_KEY);
      
      // Gửi sự kiện để AuthContext xử lý logout state
      window.dispatchEvent(new CustomEvent('sessionExpired'));

      // Xử lý các request trong hàng đợi -> reject hết
      processQueue(refreshError instanceof Error ? refreshError : new Error("Refresh token failed"), null);
      isRefreshing = false;

      
      // TODO: Trigger logout (ví dụ: dùng event bus hoặc gọi hàm global)
      // logoutUserGlobally();
      // window.location.href = '/login'; // Hoặc redirect cứng
      
      // Sửa message lỗi gốc và reject
      if (error.response) {
        if (error.response.data && typeof error.response.data === 'object') { (error.response.data as any).detail = "Token has expired"; }
        error.message = "Your session is expired, please login";
      } else {
            error.message = "Your session is expired, please login";
      }

      return Promise.reject(error); // Ném lại lỗi refresh hoặc lỗi gốc ban đầu
      
    } finally {
      // Reset cờ sau khi xử lý xong (kể cả lỗi hay thành công)
      // isRefreshing = false;
    }
  }
  
  // Với các lỗi khác hoặc đã retry, chỉ cần log và ném lại
  console.error("API Error Interceptor (Unhandled or Retry Failed):", error.response?.status, error.message);
  return Promise.reject(error);
};

// ==> Request Interceptor: Chuyển đổi data/params sang snake_case (áp dụng cho cả hai)
export const requestInterceptor = (config: InternalAxiosRequestConfig) => {
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
export const responseInterceptor = (response: AxiosResponse) => {
   if (response.data && typeof response.data === 'object') {
      if (!(response.data instanceof Blob)) {
          response.data = humps.camelizeKeys(response.data);
      }
   }
   return response;
};

// Interceptor cho Request: Thêm header Authorization
export const addAuthorizationHeader = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token && config.headers) { // Thêm kiểm tra config.headers tồn tại
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

// Interceptor xử lý lỗi cơ bản cho apiClient (public)
export const handleApiError = (error: AxiosError): Promise<AxiosError> => {
    console.error(
        `API Error (Public): ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        { Status: error.response?.status, Data: error.response?.data , Message: error.message }
    );
    return Promise.reject(error);
};

export const errorInterceptor = (error: any) => {
   // Có thể thêm xử lý lỗi chung ở đây
   console.error("API Error Interceptor:", error.response?.status, error.response?.data);
   return Promise.reject(error);
};




