// src/components/common/BookCard.tsx
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"; // Giả sử bạn cấu hình alias @ là src/
  import { cn } from "@/lib/utils"; // Import hàm tiện ích cn từ shadcn
  import type { Book } from '@/types/book';
import { Link } from "react-router-dom";
  
  interface BookCardProps extends Book {
    className?: string;
  }

  // Đọc biến môi trường (cung cấp giá trị mặc định nếu cần)
const picsumBaseUrl = import.meta.env.VITE_PICSUM_SEED_BASE_URL || 'https://picsum.photos/seed/';
const fallbackImageUrl = import.meta.env.VITE_FALLBACK_IMAGE_URL || '/images/fallback_book.png';

// Định nghĩa kích thước ảnh mong muốn (có thể đặt vào constants nếu muốn)
const IMAGE_WIDTH = 300;
const IMAGE_HEIGHT = Math.round(IMAGE_WIDTH * 1.05); // Giữ tỉ lệ 1:1.05
  
  const BookCard = ({
  id,
  bookCoverPhoto,
  bookTitle,
  authorName,
  finalPrice,
  bookPrice,
  className,
  }: BookCardProps) => {
    // Xác định xem có hiển thị giá gốc (bị gạch) không
  const showOriginalPrice = bookPrice !== finalPrice;

  // --- Xây dựng URL ảnh Picsum ---
  // Picsum URL: base/{seed}/{width}/{height}
  let actualImageUrl = fallbackImageUrl;

  // Chỉ tạo URL Picsum nếu bookCoverPhoto là string hợp lệ (không null, không rỗng)
  if (bookCoverPhoto && typeof bookCoverPhoto === 'string' && bookCoverPhoto.trim() !== '') {
    actualImageUrl = `${picsumBaseUrl}${bookCoverPhoto}/${IMAGE_WIDTH}/${IMAGE_HEIGHT}`;
 }
 // --- ---

  // --- Hàm xử lý lỗi tải ảnh ---
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Nếu ảnh (kể cả Picsum) tải lỗi, vẫn chuyển về fallback cuối cùng
    if (event.currentTarget.src !== fallbackImageUrl) { // Tránh vòng lặp vô hạn
      event.currentTarget.onerror = null;
      event.currentTarget.src = fallbackImageUrl;
  }
  };

  // URL chi tiết sản phẩm
  const productUrl = `/product/${id}`;
  // --- ---

    return (
      <Card className={cn("shrink-0 rounded-md gap-2 pb-1", className)}> {/* Width cố định và không co lại cho list ngang */}
        <CardHeader className="relative w-full aspect-[1/1.05] bg-secondary overflow-hidden"> {/* Tỷ lệ vuông cho ảnh */}
          {/* Placeholder cho ảnh sách */}
          <Link to={productUrl} aria-label={`View details for ${bookTitle}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <div className="w-full h-full bg-secondary flex items-center justify-center group">
              <img src={actualImageUrl || fallbackImageUrl} // Đường dẫn ảnh sách hoặc ảnh placeholder
              alt={bookTitle} 
              className="absolute inset-0 w-full h-full object-cover" 
              loading="lazy"
              onError={handleImageError}/>
              {/* Hoặc hiển thị chữ nếu không có ảnh */}
              {/* <span className="text-muted-foreground text-sm">Book Image</span> */}
            </div>
          </Link>
        </CardHeader>
        <CardContent className="p-2 px-5 pb-5 bg-card flex-grow min-h-0"> {/* Đảm bảo nội dung không vượt quá chiều cao */}
          <CardTitle className="text-lg font-semibold line-clamp-1" title={bookTitle}>
            {bookTitle}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1" title={authorName}>{authorName}</p>
        </CardContent>
        <CardFooter className="p-2 px-5 border-t [.border-t]:pt-2 bg-muted/50"> {/* Thêm border trên footer */}
          <div className="flex items-baseline gap-1.5">
            {/* --- Logic hiển thị giá mới --- */}
            {showOriginalPrice && bookPrice && ( // Chỉ hiển thị giá gốc nếu cần
              <p className="text-xs text-muted-foreground line-through">
                ${bookPrice.toFixed(2)} {/* Hiển thị giá gốc (bookPrice) */}
              </p>
            )}
            {/* Luôn hiển thị giá cuối cùng (finalPrice) */}
            <p className="text-base font-medium">
              ${finalPrice.toFixed(2)}  {/* Hiển thị giá bán (finalPrice) */}
            </p>
            {/* --- Kết thúc logic giá --- */}
         </div>
        </CardFooter>
      </Card>
    );
  };
  
  export default BookCard;