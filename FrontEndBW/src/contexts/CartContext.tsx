// src/contexts/CartContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useAuth } from './AuthContext'; // Import useAuth

export const MAX_ITEM_QUANTITY = 8; // Giới hạn số lượng tối đa cho mỗi item trong giỏ
export const LOCAL_STORAGE_CART_KEY = 'bookwormCart'; // Key cho localStorage
export const GUEST_USER_ID = 'guest'; // Định danh cho người dùng chưa đăng nhập

// Định nghĩa kiểu dữ liệu
interface CartItem {
  // productId là key, quantity là value
  [productId: string]: number;
}

interface CartState {
  // userId hoặc 'guest' là key
  [userOrGuestId: string]: CartItem;
}

interface CartContextType {
  // cartItems: CartItem; // Chỉ items của user hiện tại
  addItem: (productId: string | number, quantity: number) => boolean; // Trả về true/false báo thành công/thất bại
  getCartItemCount: () => number; // Lấy tổng số lượng item trong giỏ của user hiện tại
  // Thêm các hàm khác nếu cần: removeItem, updateQuantity, clearCart...
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth(); // Lấy thông tin user từ AuthContext
  const [cartState, setCartState] = useState<CartState>({}); // State chứa toàn bộ giỏ hàng của tất cả user/guest

  // Xác định key để lưu/lấy giỏ hàng cho user hiện tại
  const currentUserCartKey = useMemo(() => {
      return user ? String(user.id) : GUEST_USER_ID;
  }, [user]);

  // Load giỏ hàng từ localStorage khi component mount hoặc user thay đổi
  useEffect(() => {
    console.log("Attempting to load cart from localStorage for key:", currentUserCartKey);
    try {
      const storedCart = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
      if (storedCart) {
        const parsedCart: CartState = JSON.parse(storedCart);
        // Chỉ load toàn bộ state nếu hợp lệ
        if (typeof parsedCart === 'object' && parsedCart !== null) {
             console.log("Loaded cart state from storage:", parsedCart);
             setCartState(parsedCart);
        } else {
             console.warn("Invalid cart data found in localStorage, resetting.");
             localStorage.removeItem(LOCAL_STORAGE_CART_KEY);
             setCartState({});
        }
      } else {
         console.log("No cart found in localStorage, initializing empty.");
         setCartState({}); // Khởi tạo rỗng nếu chưa có
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
      setCartState({}); // Reset về rỗng nếu lỗi parse
    }
  }, []); // Chỉ chạy 1 lần khi component Provider được mount

  // Lưu giỏ hàng vào localStorage mỗi khi cartState thay đổi
  useEffect(() => {
    // Chỉ lưu khi cartState không phải là object rỗng khởi tạo ban đầu (tránh ghi đè khi mới load)
    if (Object.keys(cartState).length > 0 || localStorage.getItem(LOCAL_STORAGE_CART_KEY)) {
        try {
            console.log("Saving cart state to storage:", cartState);
            localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(cartState));
        } catch (error) {
            console.error("Failed to save cart to localStorage:", error);
        }
    }
  }, [cartState]);

  // Hàm thêm item vào giỏ
  const addItem = (productId: string | number, quantity: number): boolean => {
    const pId = String(productId); // Đảm bảo productId là string key

    setCartState(prevCartState => {
        const currentUserCart = prevCartState[currentUserCartKey] || {};
        const currentQuantity = currentUserCart[pId] || 0;
        const newQuantity = currentQuantity + quantity;

        // Kiểm tra giới hạn tối đa
        if (newQuantity > MAX_ITEM_QUANTITY) {
            console.warn(`Cannot add item ${pId}. Quantity limit (${MAX_ITEM_QUANTITY}) exceeded.`);
            return prevCartState; // Không thay đổi state nếu vượt quá giới hạn
        }

        // Tạo giỏ hàng mới cho user hiện tại
        const updatedUserCart: CartItem = {
            ...currentUserCart,
            [pId]: newQuantity
        };

         // Tạo trạng thái giỏ hàng tổng thể mới
        const newCartState: CartState = {
            ...prevCartState,
            [currentUserCartKey]: updatedUserCart
        };

        console.log(`Item ${pId} added/updated. New quantity: ${newQuantity}. New cart state:`, newCartState);
        return newCartState; // Cập nhật state tổng
    });

    // Kiểm tra lại sau khi state có thể đã được cập nhật (hơi khó vì setState là bất đồng bộ)
    // Để đơn giản, kiểm tra trước khi set state là đủ cho logic này
    const finalQuantityCheck = (cartState[currentUserCartKey]?.[pId] || 0) + quantity;
    return finalQuantityCheck <= MAX_ITEM_QUANTITY; // Trả về true nếu không vượt quá giới hạn
  };

  // Hàm lấy tổng số lượng item trong giỏ của user hiện tại
  const getCartItemCount = (): number => {
    const currentUserCart = cartState[currentUserCartKey] || {};
    const totalCount = Object.values(currentUserCart).reduce((sum, qty) => sum + qty, 0);
    // console.log(`Cart count for ${currentUserCartKey}:`, totalCount);
    return totalCount;
  };

  // Cung cấp state và các hàm qua Context
  const value = {
    addItem,
    getCartItemCount,
    // cartItems: cartState[currentUserCartKey] || {} // Cung cấp cartItems của user hiện tại nếu cần
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Hook để sử dụng CartContext
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};