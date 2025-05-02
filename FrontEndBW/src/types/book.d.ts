// src/types/book.ts
export interface Book {
  id: number | string;
  bookCoverPhoto: string; // từ book_cover_photo
  bookTitle: string;      // từ book_title
  authorName: string;     // từ author_name
  finalPrice: number;     // từ final_price (giá bán)
  bookPrice: number;      // từ book_price (giá gốc)
}