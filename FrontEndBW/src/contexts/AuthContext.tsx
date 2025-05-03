// src/contexts/AuthContext.tsx (Ví dụ đơn giản)
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: number | string;
  // Thêm các trường khác nếu cần: email, fullname...
}

interface AuthContextType {
  user: User | null;
  // Thêm hàm login/logout nếu cần mô phỏng đầy đủ
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // --- Giả Lập ---
  // Trong thực tế, bạn sẽ lấy thông tin user từ API hoặc state khác
  // Đặt user thành null để giả lập guest, hoặc đặt object user để giả lập đăng nhập
  const [user, setUser] = useState<User | null>(null);
  // const [user, setUser] = useState<User | null>({ id: 123 }); // Ví dụ user đã đăng nhập
  // --- ---

  const value = { user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};