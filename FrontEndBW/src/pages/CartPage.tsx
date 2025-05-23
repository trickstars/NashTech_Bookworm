import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Minus, Plus, X } from 'lucide-react'; // Import icons
import { useCart } from '@/contexts/CartContext'; // Import useCart
import { Link, useNavigate } from 'react-router-dom'; // Import Link cho nút Place Order (ví dụ)
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createOrder } from '@/api/orderApi';
import { toast } from 'sonner';
import axios from 'axios';
import { OrderItem } from '@/types/order';
import ToastWithCountdown from '@/components/common/ToastWithCountDown';

import {
  Dialog,
  DialogContent,
  DialogDescription, // Có thể dùng hoặc không
  DialogHeader,
  DialogTitle,
  // DialogTrigger, // Không cần trigger ở đây
  // DialogClose, // Không dùng nút close mặc định
  DialogOverlay // Có thể cần để style overlay
} from "@/components/ui/dialog";

const MAX_ITEM_QUANTITY = 8;
const MIN_QUANTITY = 1;

// Lấy biến môi trường và định nghĩa kích thước ảnh (có thể đặt ở constants)
const picsumBaseUrl = import.meta.env.VITE_PICSUM_SEED_BASE_URL || 'https://picsum.photos/seed/';
const fallbackImageUrl = import.meta.env.VITE_FALLBACK_IMAGE_URL || '/images/fallback_book.png';
const CART_IMAGE_WIDTH = 80; // Kích thước nhỏ hơn cho ảnh trong giỏ hàng
const CART_IMAGE_HEIGHT = Math.round(CART_IMAGE_WIDTH * 1.05); // Giữ tỉ lệ

// --- Component OrderSuccessDialog (có thể tách file riêng) ---
interface OrderSuccessDialogProps {
  open: boolean;
  onClose: () => void; // Hàm đóng dialog (khi chuyển hướng)
  onRedirect: () => void; // Hàm thực hiện chuyển hướng
  durationSeconds?: number;
}

const OrderSuccessDialog: React.FC<OrderSuccessDialogProps> = ({
  open,
  onClose,
  onRedirect,
  durationSeconds = 10
}) => {
  const [countdown, setCountdown] = useState(durationSeconds);

  // Effect đếm ngược và tự động chuyển hướng
  useEffect(() => {
      if (!open) {
          setCountdown(durationSeconds); // Reset khi đóng
          return;
      }

      if (countdown <= 0) {
          onRedirect(); // Gọi hàm chuyển hướng khi hết giờ
          return;
      }

      const timerId = setInterval(() => {
          setCountdown((prev) => prev - 1);
      }, 1000);

      // Cleanup timer
      return () => clearInterval(timerId);
  }, [open, countdown, durationSeconds, onRedirect]);


  return (
      <Dialog open={open} modal={true}> {/* modal=true giúp focus */}
          {/* DialogOverlay có thể dùng để style lớp phủ nếu cần */}
          {/* <DialogOverlay className="bg-black/60 fixed inset-0 z-40" /> */}
          <DialogContent
              className="sm:max-w-md z-50 [&_button[aria-label='Close']]:hidden" // Đảm bảo dialog nổi lên trên và ẩn nút closebtn
              onInteractOutside={(e) => e.preventDefault()} // Ngăn đóng khi bấm ra ngoài
              onEscapeKeyDown={(e) => e.preventDefault()} // Ngăn đóng bằng Esc
              // Ẩn nút close mặc định (thường là con cuối của DialogContent hoặc trong header)
              // Cách đơn giản là dùng CSS hoặc không render DialogClose
              //  showCloseButton={false} // Một số thư viện UI có prop này, shadcn thì không, phải style
               // Cách style ẩn nút close của shadcn (có thể cần kiểm tra cấu trúc):
               // className="sm:max-w-md [&>button[aria-label='Close']]:hidden"
          >
              <DialogHeader className="text-center">
                  <DialogTitle className="text-2xl text-green-600">Order Placed Successfully!</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                     Thank you for your purchase.
                  </DialogDescription>
              </DialogHeader>
              <div className="py-6 text-center">
                  {/* Dùng Button thay Link để xử lý logic trước khi chuyển hướng */}
                  <Button variant="link" onClick={onRedirect} className="text-primary text-base hover:underline">
                      Back to Home
                  </Button>
              </div>
              <div className="text-center text-xs text-muted-foreground">
                  (Automatically redirecting in {countdown}s)
              </div>
          </DialogContent>
      </Dialog>
  );
};
// --- Kết thúc Component OrderSuccessDialog ---

const CartPage = () => {
  // TODO: Thay thế cartItems bằng state thực tế (ví dụ: từ context, Redux, Zustand...)
  const {
    cartItems, // Lấy danh sách items dạng mảng
    updateItemQuantity,
    removeItem,
    getCartTotal,
    cartItemCount, // Lấy số lượng item mới nhất
    clearCart
   } = useCart();
   const { isAuthenticated, openLoginModal } = useAuth(); // Lấy trạng thái auth và hàm mở modal

  // State cho việc đặt hàng
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // State cho success modal
  const navigate = useNavigate();
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null); // Ref lưu ID của timer

   // Cleanup timer khi component unmount
  useEffect(() => {
    return () => {
        if (redirectTimerRef.current) {
            clearTimeout(redirectTimerRef.current);
        }
    };
}, []);

   const subtotal = getCartTotal();
   const totalItemsCount = cartItemCount; // Lấy tổng số lượng

  // TODO: Thêm các hàm xử lý tăng/giảm số lượng, xóa sản phẩm
  const handleQuantityChange = (productId: string | number, value: string) => {
    if (value === '') {
        updateItemQuantity(productId, MIN_QUANTITY); // Reset về min nếu xóa trắng
        return;
    }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      // Hàm updateItemQuantity đã có logic clamp
      updateItemQuantity(productId, numValue);
    }
  };

  // Hàm xử lý lỗi ảnh chung
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (event.currentTarget.src !== fallbackImageUrl) {
      event.currentTarget.onerror = null;
      event.currentTarget.src = fallbackImageUrl;
    }
  };

   // --- Handler cho nút Place Order ---
   const handlePlaceOrder = async () => {
    setOrderError(null); // Reset lỗi cũ

    // 1. Kiểm tra đăng nhập
    if (!isAuthenticated) {
        // toast.error("Please sign in to place your order.");
        toast.error(
                  <ToastWithCountdown message={"Please sign in to place your order."} />
                  // Không cần set duration ở đây nữa vì Toaster đã có mặc định 10s
                  // { duration: 10000, closeButton: true } // Các options này giờ đã set ở Toaster
              );
        openLoginModal(); // Mở modal đăng nhập
        return;
    }

    // 2. Kiểm tra giỏ hàng rỗng
    if (!cartItems || cartItems.length === 0) {
        // toast.error("Your cart is empty.");
        toast.error(
          <ToastWithCountdown message="Your cart is empty." />
          // Không cần set duration ở đây nữa vì Toaster đã có mặc định 10s
          // { duration: 10000, closeButton: true } // Các options này giờ đã set ở Toaster
      );
        return;
    }

    setIsPlacingOrder(true); // Bắt đầu loading

    // 3. Chuẩn bị dữ liệu gửi đi (chỉ cần bookId và quantity)
    const orderItemsPayload: OrderItem[] = cartItems.map(item => ({
        bookId: item.bookDetails.id, // Đảm bảo ID là number nếu backend yêu cầu
        quantity: item.quantity,
        price: item.bookDetails.finalPrice
        // Không gửi price vì backend sẽ tự lấy/xác thực
    }));

    try {
        // 4. Gọi API tạo order
        const createdOrder = await createOrder({ items: orderItemsPayload });
        console.log("Order created:", createdOrder);

        // 5. Đặt hàng thành công
        // toast.success("Order placed successfully!");
        // toast.success(
        //   <ToastWithCountdown message="Order placed successfully!" />
        //   // Không cần set duration ở đây nữa vì Toaster đã có mặc định 10s
        //   // { duration: 10000, closeButton: true } // Các options này giờ đã set ở Toaster
        // );

        clearCart(); // Xóa giỏ hàng sau khi đặt thành công
        setIsSuccessModalOpen(true); // Mở success modal
        // 6. (Tùy chọn) Điều hướng đến trang xác nhận hoặc lịch sử đơn hàng
        // navigate(`/order-confirmation/${createdOrder.id}`);

    } catch (error: any) {
         // 7. Xử lý lỗi từ API (ví dụ: item not found, lỗi server...)
         console.error("Failed to place order:", error);
         let errorMessage = "An error occurred while placing the order.";
         let shouldRemoveItemId: string | number | null = null; // Biến lưu ID item cần xóa
            // --- KIỂM TRA LỖI CỤ THỂ TỪ BACKEND ---
          if (axios.isAxiosError(error) && error.response) {
            const detail = error.response.data.detail;
            // console.log("Detai;", detail)
            // Kiểm tra mã lỗi và sự tồn tại của missing_book_id
            // --- SỬA ĐỔI LOGIC TẠO ERROR MESSAGE ---
            if (detail.error_code === "BOOK_NOT_FOUND" && detail.missing_book_id != null) {
              const missingId = detail.missing_book_id;
              shouldRemoveItemId = missingId; // Đánh dấu ID cần xóa

              const missingBook = cartItems.find(item => item.bookDetails.id == missingId);
              if (missingBook) {
                  // Tạo message theo format yêu cầu
                  errorMessage = `"${missingBook.bookDetails.bookTitle}" is not available.`;
              } else {
                  // Fallback nếu không tìm thấy tên sách (ít xảy ra)
                  errorMessage = `A book (ID: ${missingId}) in your cart is not available.`;
              }
          // --- KẾT THÚC SỬA ĐỔI ---
            } else if (typeof detail === 'string') {
                errorMessage = detail;
            } else if (error.message) {
                errorMessage = error.message;
            }
         } else if (error instanceof Error) {
              errorMessage = error.message;
         }
         // --- Kết thúc xử lý lỗi ---
         setOrderError(errorMessage); // Vẫn có thể lưu lỗi vào state nếu cần
        //  toast.error(errorMessage, { duration: 5000 }); // Hiển thị toast lỗi lâu hơn một chút
         toast.error(
          <ToastWithCountdown message={errorMessage} />
          // Không cần set duration ở đây nữa vì Toaster đã có mặc định 10s
          // { duration: 10000, closeButton: true } // Các options này giờ đã set ở Toaster
      );
      // --- TỰ ĐỘNG XÓA ITEM KHỎI GIỎ HÀNG ---
      if (shouldRemoveItemId !== null) {
        console.log(`Removing unavailable item ${shouldRemoveItemId} from cart...`);
        removeItem(shouldRemoveItemId); // Gọi hàm xóa item từ context
    }
     // --- ---

    } finally {
         setIsPlacingOrder(false); // Kết thúc loading
    }
};

// Hàm để đóng modal và chuyển hướng (gọi từ dialog hoặc timer)
const handleRedirectToHome = useCallback(() => {
  if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current); // Hủy timer nếu còn
      redirectTimerRef.current = null;
  }
  setIsSuccessModalOpen(false); // Đóng modal
  navigate('/'); // Chuyển về trang chủ
}, [navigate]); // Thêm navigate vào dependency

// Effect để tự chuyển hướng sau 10s nếu modal đang mở
useEffect(() => {
if (isSuccessModalOpen) {
    // Clear timer cũ (nếu có) trước khi đặt timer mới
    if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
    }
    console.log("Setting redirect timer...");
    redirectTimerRef.current = setTimeout(() => {
        console.log("Timer finished, redirecting...");
        handleRedirectToHome();
    }, 10000); // 10 giây

    // Cleanup timer khi modal đóng hoặc component unmount
    return () => {
        if (redirectTimerRef.current) {
            console.log("Clearing redirect timer because modal closed or component unmounted.");
            clearTimeout(redirectTimerRef.current);
            redirectTimerRef.current = null;
        }
    };
}
}, [isSuccessModalOpen, handleRedirectToHome]);
 // --- ---

  return (
    <div>
      <div className='pb-4 border-b border-border mb-8'>
          <h2 className="text-xl font-semibold tracking-tight">
            Your cart: {totalItemsCount} item{totalItemsCount !== 1 ? 's' : ''}
          </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_2fr)_minmax(0,_1fr)] gap-8 xl:gap-12">
        {/* Left Column: Cart Items */}
        <div className="space-y-6">
  
          {/* Cart Items List */}
          <div className='border rounded-lg'>
            {/* Header Row */}
            <div className="flex items-center text-sm font-medium text-foreground border-b px-4 py-2 mb-4 gap-4">
              <span className="w-full flex-[2_2_0%]">Product</span> {/* Use flex-basis */}
              <span className="w-auto flex-[1_1_0%] text-right">Price</span>
              <span className="w-auto flex-[1_1_0%] text-center px-2">Quantity</span>
              <span className="w-auto flex-[1_1_0%] text-right">Total</span>
              <span className="w-8 flex-shrink-0"></span> {/* Placeholder for remove button column alignment */}
            </div>
  
            {/* Item Rows */}
            {cartItems.length > 0 ? (
              // Sử dụng divide-y để tạo đường kẻ giữa các item
              <div className="divide-y px-4">
                {cartItems.map((item) => {
                  // Tạo URL ảnh Picsum cho item này
                  const bookSeed = item.bookDetails.bookCoverPhoto;
                  let imageUrl = fallbackImageUrl;
                  if (bookSeed && typeof bookSeed === 'string' && bookSeed.trim() !== '') {
                    imageUrl = `${picsumBaseUrl}${bookSeed}/${CART_IMAGE_WIDTH}/${CART_IMAGE_HEIGHT}`;
                  }
  
                  // --- URL chi tiết sản phẩm ---
                  const productUrl = `/product/${item.bookDetails.id}`;
                  // --- ---
  
                  return (
                    // Mỗi item là một flex container
                    <div key={item.bookDetails.id} className="flex items-center py-4 gap-4">
  
                      {/* Cột Product Details */}
                      <div className="flex items-center gap-3 md:gap-4 flex-[2_2_0%]">
                        <Link 
                          to={productUrl} 
                          aria-label={`View ${item.bookDetails.bookTitle}`}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          <div className="w-16 h-20 md:w-20 md:h-[84px] bg-secondary rounded overflow-hidden flex-shrink-0">
                            <img
                              src={imageUrl || fallbackImageUrl}
                              alt={item.bookDetails.bookTitle}
                              className="w-full h-full object-cover"
                              onError={handleImageError}
                              loading="lazy"
                            />
                          </div>
                        </Link>
                        <div className="flex-grow">
                          <p className="font-medium line-clamp-2">{item.bookDetails.bookTitle}</p>
                          <p className="text-xs text-muted-foreground">{item.bookDetails.authorName}</p>
                        </div>
                      </div>
  
                      {/* Cột Price */}
                      <div className="text-right flex-[1_1_0%]">
                        <p className="font-medium">${item.bookDetails.finalPrice.toFixed(2)}</p>
                        {(item.bookDetails.bookPrice && item.bookDetails.bookPrice !== item.bookDetails.finalPrice) && (
                          <p className="text-xs text-muted-foreground line-through">${item.bookDetails.bookPrice.toFixed(2)}</p>
                        )}
                      </div>
  
                      {/* Cột Quantity */}
                      <div className="flex justify-center flex-[1_1_0%] px-2">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() => {
                              if (item.quantity <= MIN_QUANTITY) {
                                  // Nếu số lượng là 1 (hoặc nhỏ hơn), gọi hàm xóa
                                  removeItem(item.bookDetails.id);
                              } else {
                                  // Nếu số lượng > 1, gọi hàm giảm số lượng
                                  updateItemQuantity(item.bookDetails.id, item.quantity - 1);
                              }
                          }}
                            // disabled={item.quantity <= MIN_QUANTITY}
                            aria-label={`Decrease quantity for ${item.bookDetails.bookTitle}`}
                          >
                            <Minus className="h-3 w-3"/>
                          </Button>
                          <Input
                             type="number"
                             min={MIN_QUANTITY}
                             max={MAX_ITEM_QUANTITY}
                             value={item.quantity}
                             onChange={(e) => handleQuantityChange(item.bookDetails.id, e.target.value)}
                             aria-label={`Quantity for ${item.bookDetails.bookTitle}`}
                             className="h-8 w-10 text-center border-y-0 border-x focus-visible:ring-0 text-sm p-0"
                          />
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => updateItemQuantity(item.bookDetails.id, item.quantity + 1)}
                            disabled={item.quantity >= MAX_ITEM_QUANTITY}
                            aria-label={`Increase quantity for ${item.bookDetails.bookTitle}`}
                          >
                            <Plus className="h-3 w-3"/>
                          </Button>
                        </div>
                      </div>
  
                      {/* Cột Total Price */}
                      <div className="font-medium text-right flex-[1_1_0%]">
                        ${(item.bookDetails.finalPrice * item.quantity).toFixed(2)}
                      </div>
  
                       {/* Nút Remove */}
                      <div className="w-8 flex-shrink-0 text-right">
                         <Button
                           variant="ghost" size="icon"
                           className="text-muted-foreground hover:text-destructive h-8 w-8"
                           onClick={() => removeItem(item.bookDetails.id)}
                           aria-label={`Remove ${item.bookDetails.bookTitle}`}
                         >
                             <X className="h-4 w-4" />
                         </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
               // Thông báo khi giỏ hàng rỗng
              <p className="text-muted-foreground py-16 text-center">Your cart is empty.</p>
            )}
          </div>
        </div>
  
        {/* Right Column: Cart Totals */}
        {cartItems.length > 0 && (
          <div className="lg:sticky lg:top-20 self-start">
            <Card className="overflow-hidden">
              <CardHeader className="flex justify-center items-center text-center bg-muted/50 border-b pb-0 pt-6">
                <CardTitle className="text-base font-bold">Cart Totals</CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex justify-center items-center">
                 {/* Có thể thêm Subtotal, Tax, Shipping ở đây */}
                  {/* Chỉ hiển thị giá, cỡ lớn, đậm */}
                  <p className="text-3xl font-bold">
                      ${subtotal.toFixed(2)}
                  </p>
              </CardContent>
              <CardFooter>
                 {/* --- Cập nhật nút Place order --- */}
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder} // Disable khi đang xử lý
                >
                  {isPlacingOrder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Place order
                </Button>
                {/* --- --- */}
              </CardFooter>
            </Card>
          </div>
        )}
        {/* Hiển thị nếu giỏ hàng rỗng */}
      </div>
      
      {/* === Success Dialog === */}
      <OrderSuccessDialog
          open={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)} // Hàm đóng state
          onRedirect={handleRedirectToHome} // Hàm thực hiện chuyển hướng
          durationSeconds={10} // Thời gian đếm ngược
      />
       {/* === === */}
    </div>
  );
};

export default CartPage;