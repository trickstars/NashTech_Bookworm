// src/types/token.ts

// Định nghĩa cấu trúc response trả về từ API /auth/token và /auth/refresh
// Các key đã được camelCase bởi axios/humps
export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string; // Thường là 'bearer'
  }
  
  // (Tùy chọn) Định nghĩa cấu trúc payload bên trong JWT nếu cần tham chiếu
  // Mặc dù frontend thường không nên tự giải mã token để lấy thông tin này
  // mà nên gọi API /me, nhưng có thể hữu ích cho việc ghi chú hoặc debug.
  
  // Payload của Access Token (ví dụ)
  export interface AccessTokenPayload {
    sub: string | number; // Subject (thường là user ID)
    email?: string;       // Claim email đã thêm
    fullname?: string;    // Claim fullname đã thêm
    exp?: number;         // Thời gian hết hạn (Unix timestamp)
    iat?: number;         // Thời gian cấp phát (Unix timestamp)
    type?: 'access';      // Loại token
    // Thêm các claim tùy chỉnh khác nếu có
  }
  
  // Payload của Refresh Token (thường chỉ chứa sub và exp)
  export interface RefreshTokenPayload {
    sub: string | number; // Subject (User ID)
    exp?: number;         // Thời gian hết hạn
    iat?: number;         // Thời gian cấp phát
    type?: 'refresh';     // Loại token
  }