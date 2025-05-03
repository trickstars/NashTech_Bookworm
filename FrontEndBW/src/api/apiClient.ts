// src/api/apiClient.ts
import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import humps from 'humps'; // Thư viện giúp chuyển đổi giữa snake_case và camelCase

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

// --- Hoặc dùng Interceptor (linh hoạt hơn nếu cần xử lý phức tạp) ---
// --- Response Interceptor để camelize keys (Giữ nguyên nếu cần) ---
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.data && typeof response.data === 'object') {
      // Chỉ camelize nếu response data là object/array
      // Cẩn thận: không camelize nếu response là Blob hoặc kiểu dữ liệu khác
       if (!(response.data instanceof Blob)) {
           response.data = humps.camelizeKeys(response.data);
       }
    }
    return response;
  },
  (error) => Promise.reject(error)
);

// --- Request Interceptor để decamelize keys (Cập nhật logic) ---
// Fix lỗi formData và URLSearchParams
apiClient.interceptors.request.use(
   (config: InternalAxiosRequestConfig) => {
       const newConfig = { ...config };

       // --- KIỂM TRA KIỂU DỮ LIỆU TRƯỚC KHI CHUYỂN ĐỔI ---
       // Chỉ decamelize nếu data là plain object và không phải là FormData/URLSearchParams
       if (newConfig.data && typeof newConfig.data === 'object' &&
           !(newConfig.data instanceof FormData) &&
           !(newConfig.data instanceof URLSearchParams) &&
           !(newConfig.data instanceof Blob))
       {
           newConfig.data = humps.decamelizeKeys(newConfig.data);
       }

        // Cũng kiểm tra và chuyển đổi cho params nếu cần
        if (newConfig.params && typeof newConfig.params === 'object') {
            newConfig.params = humps.decamelizeKeys(newConfig.params);
        }
        // --- KẾT THÚC KIỂM TRA ---

       return newConfig;
   },
   (error) => {
       return Promise.reject(error);
   }
);
// --- ---

// --- Tùy chọn: Interceptors ---
// Ví dụ: Tự động thêm token vào header Authorization cho các request cần xác thực
// apiClient.interceptors.request.use(
//   (config) => {
//     // Lấy token từ nơi bạn lưu trữ (ví dụ: state, localStorage - không khuyến khích)
//     const token = localStorage.getItem('access_token'); // Ví dụ đơn giản
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Ví dụ: Xử lý lỗi response tập trung hoặc logic refresh token
// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     // Logic kiểm tra lỗi 401 và thử refresh token ở đây...
//     // if (error.response.status === 401 && !originalRequest._retry) { ... }
//     return Promise.reject(error);
//   }
// );
// --- ---

export default apiClient;