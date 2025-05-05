// src/contexts/AuthContext.tsx (Ví dụ đơn giản)
import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { loginUser, getMe, logoutApi } from '@/api/authApi'; // Import API functions
// import type { TokenResponse } from '@/types/token';
import type { User } from '@/types/user'; // Schema User trả về từ /me
import { LOCAL_STORAGE_CART_KEY, GUEST_USER_ID } from './CartContext';


interface AuthContextType {
  user: User | null;
  accessToken: string | null; // Chỉ lưu access token ở đây, refresh token trong localStorage là đủ
  isAuthenticated: boolean;
  isLoading: boolean; // Trạng thái loading khi kiểm tra token lúc đầu
  login: (emailAsUsername: string, password: string) => Promise<boolean>; // Trả về true/false
  logout: () => void;
  // --- Thêm State và Hàm cho Modal ---
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  // --- ---
}

// --- localStorage Keys ---
const ACCESS_TOKEN_KEY = 'accessToken';
// const REFRESH_TOKEN_KEY = 'refreshToken'

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Bắt đầu là true
  // --- State cho Dialog ---
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  // --- ---

  // Hàm đăng xuất
  const logout = useCallback(async () => {
    console.log("Logging out...");
    // Xóa token khỏi localStorage
    const currentToken = localStorage.getItem(ACCESS_TOKEN_KEY); // Lấy token để gọi API logout

    // Gọi API logout backend ĐỂ SERVER XÓA COOKIE
    if (currentToken) { // Chỉ gọi logout API nếu đang có vẻ đăng nhập
         try {
             await logoutApi(); // Hàm này dùng authApiClient nên token sẽ được gửi tự động
         } catch (e) {
             console.error("Logout API call failed (ignoring):", e);
         }
    }

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    // localStorage.removeItem(REFRESH_TOKEN_KEY);

    // Reset state context
    setUser(null);
    setAccessToken(null);
    setIsAuthenticated(false);

    // --- QUAN TRỌNG: Xử lý Cart ---
    // Khi logout, giỏ hàng hiện tại sẽ tự động trở thành giỏ hàng 'guest'
    // vì currentUserCartKey trong CartContext sẽ thay đổi theo `user` trong AuthContext
    // Không cần xóa localStorage cart ở đây, trừ khi muốn xóa hẳn cart khi logout
    // localStorage.removeItem(LOCAL_STORAGE_CART_KEY); // << Tùy chọn: Xóa hẳn cart khi logout
    console.log("User logged out, tokens removed.");
    // Có thể gọi API logout backend ở đây nếu cần (để vô hiệu hóa refresh token phía server)
    // await logoutApi();
  }, []);

  // Lắng nghe sự kiện để logout
  useEffect(() => {
    const handleSessionExpired = () => {
        console.log("AuthContext: Received sessionExpired event. Logging out.");
        logout(); // Gọi hàm logout nội bộ để reset state
    };
    window.addEventListener('sessionExpired', handleSessionExpired);
    return () => { window.removeEventListener('sessionExpired', handleSessionExpired); };
}, [logout]); // Dependency là hàm logout

  // Hàm load và kiểm tra token khi mount
  const initializeAuth = useCallback(async () => {
    console.log("Initializing Auth...");
    setIsLoading(true);
    const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    // const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY); // Chưa cần dùng refresh ở đây
    let userData: User | null = null;

    if (storedAccessToken) {
      console.log("Found access token, validating...");
      const userData = await getMe(); // Gọi API /me để lấy thông tin user
      if (userData) {
        console.log("Token valid, user data:", userData);
        setUser(userData);
        setAccessToken(storedAccessToken);
        setIsAuthenticated(true);
      } else {
        // Token không hợp lệ hoặc hết hạn
        console.log("No valid session found initially.");
        logout()
        // TODO: Có thể thử gọi API refresh token ở đây nếu muốn tự động gia hạn
      }
    } else {
        console.log("No access token found.");
        setIsAuthenticated(false); // Đảm bảo trạng thái là false nếu không có token
    }
    setIsLoading(false);
    console.log("Auth initialized.");
  }, [logout]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]); // Chỉ chạy 1 lần khi mount

  // Hàm đăng nhập
  const login = async (emailAsUsername: string, password: string): Promise<boolean> => {
    // setIsLoading(true); // Báo đang xử lý login
    try {
      const tokenData = await loginUser(emailAsUsername, password); // Gọi API login

      localStorage.setItem(ACCESS_TOKEN_KEY, tokenData.accessToken);
      // localStorage.setItem(REFRESH_TOKEN_KEY, tokenData.refreshToken);
      // Lấy thông tin user ngay sau khi login thành công
      const userData = await getMe();

      if (userData) {
         // Cập nhật state context
        setAccessToken(tokenData.accessToken);
        setUser(userData);
        setIsAuthenticated(true);
        console.log("Login successful, user:", userData);

        // --- QUAN TRỌNG: Xử lý Cart ---
        // Di chuyển giỏ hàng của guest (nếu có) sang giỏ hàng của user
        const storedCart = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
        if (storedCart) {
            try {
              // merge cart
                const parsedCart = JSON.parse(storedCart);
                const guestCart = parsedCart[GUEST_USER_ID];
                if (guestCart && Object.keys(guestCart).length > 0) {
                    const userCartKey = String(userData.id);
                    // Gộp giỏ hàng guest vào user (có thể cần logic merge phức tạp hơn nếu xung đột)
                    const userCart = parsedCart[userCartKey] || {};
                    parsedCart[userCartKey] = { ...guestCart, ...userCart }; // Ưu tiên item trong userCart nếu trùng? Cần xem lại logic merge!
                    // Xóa giỏ hàng guest
                    delete parsedCart[GUEST_USER_ID];
                    localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(parsedCart));
                     console.log("Guest cart merged/moved to user cart for ID:", userCartKey);
                }
            } catch (e) { console.error("Error merging guest cart:", e); }
        }
        // --- ---
        setIsLoginModalOpen(false);
        // setIsLoading(false);
        return true; // Login thành công

      } else {
         // Nếu không lấy được user data sau khi có token -> lỗi
         throw new Error("Login succeeded but failed to fetch user data.");
      }
      // setIsLoading(false); // Đặt lại isLoading của context
      // return true;

    } catch (error: any) {
      console.error("Login failed:", error.message);
      // Xóa token cũ nếu có lỗi đăng nhập
      // logout(); // Gọi hàm logout để dọn dẹp
      // setIsLoading(false);
      localStorage.removeItem(ACCESS_TOKEN_KEY); // Xóa token nếu lưu tạm trước đó (dù không nên)
      // localStorage.removeItem(REFRESH_TOKEN_KEY);
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false); // Đảm bảo state là false
      // setIsLoginModalOpen(false); // Đóng modal nếu đang mở khi có lỗi
      throw error; // Ném lại lỗi để component Form xử lý và hiển thị
    }
  };

  // --- Hàm mở/đóng Modal ---
  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);
  // --- ---


  // --- Cập nhật context value ---
  const value = {
    user, accessToken, isAuthenticated, isLoading, login, logout,
    isLoginModalOpen, openLoginModal, closeLoginModal // Thêm vào value
};
// --- ---

  // Chỉ render children khi đã load xong trạng thái auth ban đầu
  return (
      <AuthContext.Provider value={value}>
          {!isLoading ? children : <div>Authenticating...</div> /* Hoặc spinner toàn trang */}
      </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};