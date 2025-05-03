// Có thể đặt trong src/types/cart.ts hoặc trực tiếp trong CartContext.tsx

import type { Book } from './book'; // Hoặc đường dẫn tương đối

// Chọn các trường Book cần thiết để lưu vào giỏ hàng
type CartBookDetails = Pick<Book,
  'id' | 'bookCoverPhoto' | 'bookTitle' | 'authorName' | 'finalPrice' | 'bookPrice'
>;

export interface CartItemData {
  quantity: number;
  bookDetails: CartBookDetails; // Lưu thông tin sách cần thiết
}

// Giỏ hàng của một user/guest: productId là key
export interface CartUserItems {
  [productId: string]: CartItemData;
}

// State tổng thể của context/localStorage
export interface CartState {
  [userOrGuestId: string]: CartUserItems;
}