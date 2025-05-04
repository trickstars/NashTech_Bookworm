import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Minus, Plus, X } from 'lucide-react'; // Import icons
import { useCart } from '@/contexts/CartContext'; // Import useCart
import { Link } from 'react-router-dom'; // Import Link cho nút Place Order (ví dụ)
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createOrder } from '@/api/orderApi';
import { toast } from 'sonner';
import axios from 'axios';
import { OrderItem } from '@/types/order';

const MAX_ITEM_QUANTITY = 8;
const MIN_QUANTITY = 1;

// Lấy biến môi trường và định nghĩa kích thước ảnh (có thể đặt ở constants)
const picsumBaseUrl = import.meta.env.VITE_PICSUM_SEED_BASE_URL || 'https://picsum.photos/seed/';
const fallbackImageUrl = import.meta.env.VITE_FALLBACK_IMAGE_URL || '/images/fallback_book.png';
const CART_IMAGE_WIDTH = 80; // Kích thước nhỏ hơn cho ảnh trong giỏ hàng
const CART_IMAGE_HEIGHT = Math.round(CART_IMAGE_WIDTH * 1.05); // Giữ tỉ lệ

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
        toast.error("Please sign in to place your order.");
        openLoginModal(); // Mở modal đăng nhập
        return;
    }

    // 2. Kiểm tra giỏ hàng rỗng
    if (!cartItems || cartItems.length === 0) {
        toast.error("Your cart is empty.");
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
        toast.success("Order placed successfully!");
        clearCart(); // Xóa giỏ hàng sau khi đặt thành công

        // 6. (Tùy chọn) Điều hướng đến trang xác nhận hoặc lịch sử đơn hàng
        // navigate(`/order-confirmation/${createdOrder.id}`);

    } catch (error: any) {
         // 7. Xử lý lỗi từ API (ví dụ: item not found, lỗi server...)
         console.error("Failed to place order:", error);
         let errorMessage = "An error occurred while placing the order.";
            // --- KIỂM TRA LỖI CỤ THỂ TỪ BACKEND ---
          if (axios.isAxiosError(error) && error.response) {
            const detail = error.response.data.detail;
            console.log("Detai;", detail)
            // Kiểm tra mã lỗi và sự tồn tại của missing_book_id
            // --- SỬA ĐỔI LOGIC TẠO ERROR MESSAGE ---
            if (detail.error_code === "BOOK_NOT_FOUND" && detail.missing_book_id != null) {
              const missingId = detail.missing_book_id;
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
         toast.error(errorMessage, { duration: 5000 }); // Hiển thị toast lỗi lâu hơn một chút
    } finally {
         setIsPlacingOrder(false); // Kết thúc loading
    }
};
 // --- ---

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_2fr)_minmax(0,_1fr)] gap-8 xl:gap-12">
      {/* Left Column: Cart Items */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Your cart: {totalItemsCount} item{totalItemsCount !== 1 ? 's' : ''}
        </h2>

        {/* Cart Items List */}
        <div>
          {/* Header Row */}
          <div className="flex items-center text-sm font-medium text-muted-foreground border-b pb-2 mb-4 gap-4">
            <span className="w-full flex-[2_2_0%]">Product</span> {/* Use flex-basis */}
            <span className="w-auto flex-[1_1_0%] text-right">Price</span>
            <span className="w-auto flex-[1_1_0%] text-center px-2">Quantity</span>
            <span className="w-auto flex-[1_1_0%] text-right">Total</span>
            <span className="w-8 flex-shrink-0"></span> {/* Placeholder for remove button column alignment */}
          </div>

          {/* Item Rows */}
          {cartItems.length > 0 ? (
            // Sử dụng divide-y để tạo đường kẻ giữa các item
            <div className="divide-y">
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
          <Card>
            <CardHeader>
              <CardTitle>Cart Totals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {/* Có thể thêm Subtotal, Tax, Shipping ở đây */}
               <Separator />
               <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total</span>
                  {/* Lấy tổng tiền từ context */}
                  <span>${subtotal.toFixed(2)}</span>
               </div>
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
  );
};

export default CartPage;