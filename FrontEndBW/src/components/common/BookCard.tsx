// src/components/common/BookCard.tsx
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"; // Giả sử bạn cấu hình alias @ là src/
  import { cn } from "@/lib/utils"; // Import hàm tiện ích cn từ shadcn
  
  interface BookCardProps {
    imageUrl: string;
    title: string;
    author: string;
    price: number;
    originalPrice?: number; // Giá gốc (tùy chọn)
    className?: string;
  }
  
  const BookCard = ({
    imageUrl,
    title,
    author,
    price,
    originalPrice,
    className,
  }: BookCardProps) => {
    return (
      <Card className={cn("shrink-0", className)}> {/* Width cố định và không co lại cho list ngang */}
        <CardHeader className="p-0 aspect-square overflow-hidden"> {/* Tỷ lệ vuông cho ảnh */}
          {/* Placeholder cho ảnh sách */}
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" loading="lazy"/>
            {/* Hoặc hiển thị chữ nếu không có ảnh */}
            {/* <span className="text-muted-foreground text-sm">Book Image</span> */}
          </div>
        </CardHeader>
        <CardContent className="p-4 pb-2">
          <CardTitle className="text-base font-semibold line-clamp-1" title={title}>
            {title}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1" title={author}>{author}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div>
            {originalPrice && (
              <p className="text-xs text-muted-foreground line-through">
                ${originalPrice.toFixed(2)}
              </p>
            )}
            <p className="text-base font-medium">
              ${price.toFixed(2)}
            </p>
          </div>
        </CardFooter>
      </Card>
    );
  };
  
  export default BookCard;