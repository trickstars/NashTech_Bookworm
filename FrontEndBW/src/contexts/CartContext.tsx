// src/contexts/CartContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext'; // Import useAuth

export const MAX_ITEM_QUANTITY = 8; // Giới hạn số lượng tối đa cho mỗi item trong giỏ
export const LOCAL_STORAGE_CART_KEY = 'bookwormCart'; // Key cho localStorage
export const GUEST_USER_ID = 'guest'; // Định danh cho người dùng chưa đăng nhập

import type { CartState, CartUserItems, CartItemData, CartBookDetails } from '@/types/cart'; // Giả sử đã tạo src/types/cart.ts
import type { Book } from '@/types/book'; // Cần Book để nhận đầy đủ thông tin khi add

interface CartContextType {
    cartItems: CartItemData[]; // Danh sách item của user hiện tại (dạng mảng)
    addItem: (book: Book, quantity: number) => boolean; // Nhận cả object Book
    updateItemQuantity: (productId: string | number, newQuantity: number) => void;
    removeItem: (productId: string | number) => void;
    // getCartItemCount: () => number; // Tổng số lượng sản phẩm
    cartItemCount: number; // Tổng số lượng sản phẩm (đã tính toán bên ngoài)
    getCartTotal: () => number; // Tổng tiền
    clearCart: () => void; // Xóa giỏ hàng của user hiện tại
  }

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth(); // Lấy thông tin user từ AuthContext
  const [cartState, setCartState] = useState<CartState>({}); // State chứa toàn bộ giỏ hàng của tất cả user/guest
  const [isCartLoaded, setIsCartLoaded] = useState(false); // Flag để biết đã load xong chưa


  // Xác định key để lưu/lấy giỏ hàng cho user hiện tại
  const currentUserCartKey = useMemo(() => {
      return user ? String(user.id) : GUEST_USER_ID;
  }, [user]);

  // Load giỏ hàng từ localStorage khi component mount hoặc user thay đổi
  // Load giỏ hàng từ localStorage khi mount lần đầu
  useEffect(() => {
    console.log("CartContext Mounted. Loading cart...");
    try {
      const storedCart = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        if (typeof parsedCart === 'object' && parsedCart !== null) {
          setCartState(parsedCart);
           console.log("Cart loaded from storage:", parsedCart);
        } else {
           localStorage.removeItem(LOCAL_STORAGE_CART_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
      localStorage.removeItem(LOCAL_STORAGE_CART_KEY); // Xóa dữ liệu lỗi
    } finally {
        setIsCartLoaded(true); // Đánh dấu đã load xong (kể cả khi lỗi hoặc không có gì)
    }
  }, []); // Chỉ chạy 1 lần

  // Lưu giỏ hàng vào localStorage mỗi khi cartState thay đổi
  // Lưu giỏ hàng vào localStorage khi cartState thay đổi (và đã load xong)
  useEffect(() => {
    if (isCartLoaded) { // Chỉ lưu sau khi đã load xong lần đầu
       try {
          // console.log("Saving cart state to storage:", cartState);
          localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(cartState));
       } catch (error) {
          console.error("Failed to save cart to localStorage:", error);
       }
    }
  }, [cartState, isCartLoaded]);

  // Lấy danh sách items của user hiện tại dưới dạng mảng
  const currentUserCartItemsArray = useMemo((): CartItemData[] => {
    if (!isCartLoaded) return []; // Chưa load xong thì trả về rỗng
    const userCart = cartState[currentUserCartKey] || {};
    return Object.values(userCart);
}, [cartState, currentUserCartKey, isCartLoaded]);

  // Hàm thêm item vào giỏ
  // Hàm thêm item (cập nhật để nhận và lưu bookDetails)
  const addItem = useCallback((book: Book, quantity: number): boolean => {
    const pId = String(book.id);

    // Lấy thông tin chi tiết cần lưu
    const bookDetails: CartBookDetails = {
        id: book.id,
        bookCoverPhoto: book.bookCoverPhoto,
        bookTitle: book.bookTitle,
        authorName: book.authorName,
        finalPrice: book.finalPrice,
        bookPrice: book.bookPrice,
    };

    // Dùng functional update để đảm bảo state mới nhất
    let quantityExceeded = false;
    setCartState(prevCartState => {
      const currentUserCart = prevCartState[currentUserCartKey] || {};
      const currentQuantity = currentUserCart[pId]?.quantity || 0; // Lấy quantity từ CartItemData
      const newQuantity = currentQuantity + quantity;

      if (newQuantity > MAX_ITEM_QUANTITY) {
        console.warn(`Cannot add item ${pId}. Quantity limit (${MAX_ITEM_QUANTITY}) exceeded.`);
        quantityExceeded = true; // Đánh dấu là đã vượt quá
        return prevCartState; // Không thay đổi state
      }

      const updatedUserCart: CartUserItems = {
        ...currentUserCart,
        [pId]: { // Lưu cả quantity và bookDetails
            quantity: newQuantity,
            bookDetails: bookDetails
        }
      };

      const newCartState: CartState = {
        ...prevCartState,
        [currentUserCartKey]: updatedUserCart
      };
      console.log(`Item ${pId} added/updated. New state:`, newCartState);
      return newCartState;
    });

    return !quantityExceeded; // Trả về true nếu không vượt quá giới hạn
  }, [currentUserCartKey]); // Thêm currentUserCartKey vào dependency

  // Hàm cập nhật số lượng
  const updateItemQuantity = useCallback((productId: string | number, newQuantity: number): void => {
    const pId = String(productId);
    // Clamp giá trị mới trong khoảng hợp lệ
    const clampedQuantity = Math.max(1, Math.min(MAX_ITEM_QUANTITY, newQuantity));

    setCartState(prevCartState => {
       const currentUserCart = prevCartState[currentUserCartKey] || {};
       // Chỉ cập nhật nếu item tồn tại
       if (currentUserCart[pId]) {
           const updatedUserCart: CartUserItems = {
               ...currentUserCart,
               [pId]: {
                   ...currentUserCart[pId], // Giữ lại bookDetails
                   quantity: clampedQuantity
               }
           };
            const newCartState: CartState = {
               ...prevCartState,
               [currentUserCartKey]: updatedUserCart
           };
           console.log(`Item ${pId} quantity updated to ${clampedQuantity}. New state:`, newCartState);
           return newCartState;
       }
       return prevCartState; // Không thay đổi nếu item không tồn tại
    });
 }, [currentUserCartKey]); // Thêm currentUserCartKey vào dependency

 // Hàm xóa item
 const removeItem = useCallback((productId: string | number): void => {
    const pId = String(productId);
    setCartState(prevCartState => {
        const currentUserCart = prevCartState[currentUserCartKey] || {};
        // Tạo object mới không chứa productId cần xóa
        const { [pId]: _, ...remainingItems } = currentUserCart; // Destructuring để loại bỏ key pId

        const newCartState: CartState = {
            ...prevCartState,
            [currentUserCartKey]: remainingItems
        };
        console.log(`Item ${pId} removed. New state:`, newCartState);
        return newCartState;
    });
 }, [currentUserCartKey]); // Thêm currentUserCartKey vào dependency

 // Hàm xóa toàn bộ giỏ hàng của user hiện tại
  const clearCart = useCallback((): void => {
    setCartState(prevCartState => {
       const { [currentUserCartKey]: _, ...remainingCart } = prevCartState;
       const newCartState = remainingCart;
       console.log(`Cart cleared for ${currentUserCartKey}. New state:`, newCartState);
       return newCartState;
    });
  }, [currentUserCartKey]); // Thêm currentUserCartKey vào dependency


  /// Hàm lấy tổng số lượng item
  const getCartItemCount = (): number => {
    if (!isCartLoaded) return 0;
    const userCart = cartState[currentUserCartKey] || {};
    return Object.values(userCart).reduce((sum, item) => sum + item.quantity, 0);
  };

  // Hàm tính tổng tiền
  const getCartTotal = (): number => {
    if (!isCartLoaded) return 0;
    const userCart = cartState[currentUserCartKey] || {};
    return Object.values(userCart).reduce((sum, item) => sum + (item.bookDetails.finalPrice * item.quantity), 0);
 };

 // --- Tính toán tổng số lượng và tổng tiền bằng useMemo ---
 const cartItemCount = useMemo(() => {
  if (!isCartLoaded) return 0;
  const userCart = cartState[currentUserCartKey] || {};
  return Object.values(userCart).reduce((sum, item) => sum + item.quantity, 0);
}, [cartState, currentUserCartKey, isCartLoaded]); // Tính lại khi state thay đổi

const cartTotal = useMemo(() => {
   if (!isCartLoaded) return 0;
   const userCart = cartState[currentUserCartKey] || {};
   return Object.values(userCart).reduce((sum, item) => sum + (item.bookDetails.finalPrice * item.quantity), 0);
}, [cartState, currentUserCartKey, isCartLoaded]); // Tính lại khi state thay đổi
// --- ---

 // Giá trị cung cấp cho context
 const value = useMemo(() => ({
    cartItems: currentUserCartItemsArray, // Cung cấp mảng items đã lọc
    addItem,
    updateItemQuantity,
    removeItem,
    cartItemCount: cartItemCount, // <-- Cung cấp giá trị đã tính toán
    getCartTotal: () => cartTotal, // Hàm getCartTotal giờ trả về giá trị đã memoize
    clearCart,
  }), [currentUserCartItemsArray, currentUserCartKey]); // Thêm currentUserCartKey vào dependency

  // Chỉ render children khi đã load xong cart từ storage lần đầu
  return (
    <CartContext.Provider value={value}>
        {isCartLoaded ? children : null /* Hoặc hiển thị loading indicator */}
    </CartContext.Provider>
);
};

// Hook để sử dụng CartContext
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};