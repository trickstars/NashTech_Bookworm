import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";
import { Minus, Plus } from 'lucide-react';
// Import API function và type mới
import { getBookById } from '@/api/bookApi'; // Hoặc productApi
import type { BookDetail } from '@/types/book'; // Hoặc /types
import { useCart } from '@/contexts/CartContext'; // <-- Import useCart
import { toast } from "sonner"; // <-- Import toast

import CustomerReview from '@/components/CustomerReview';

// --- Placeholder Data ---
// const product = {
//   id: '123',
//   categoryName: 'Fiction',
//   categorySlug: 'fiction',
//   imageUrl: '/placeholder-book-large.png',
//   author: 'Anna Banks',
//   title: 'Book Title: Example of a Long Title for Product Detail Page',
//   description: 'Book description. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
//   accolades: [
//     'The multi-million copy bestseller',
//     'Soon to be a major film',
//     'A Number One New York Times Bestseller',
//     'Vanity Fair Beautiful New York Times',
//     'Unforgettable... as engrossing as it is moving - Daily Mail',
//     "I can't even express how much I love this book! - Reese Witherspoon",
//   ],
//   originalPrice: 40.00,
//   salePrice: 29.99,
// };

// --- Định nghĩa hằng số ---
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 8;
const MAX_ITEM_QUANTITY = 8; // Giới hạn số lượng tối đa cho mỗi item trong giỏ
// --- ---

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart(); // <-- Lấy hàm addItem từ context

  // --- State cho dữ liệu sản phẩm, loading, error ---
  const [productData, setProductData] = useState<BookDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(MIN_QUANTITY); // State cho số lượng
  // --- ---
  // --- useEffect để fetch dữ liệu chi tiết sản phẩm ---
  useEffect(() => {
    // Chỉ fetch khi có ID
    if (id) {
      const fetchProduct = async () => {
        setIsLoading(true);
        setError(null);
        setProductData(null); // Reset data cũ
        try {
          const data = await getBookById(id);
          if (data) {
            setProductData(data);
            setQuantity(MIN_QUANTITY)
          } else {
            setError('Product not found.'); // Lỗi 404 từ API
          }
        } catch (err: any) {
          setError(err.message || 'Failed to load product details.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    } else {
      // Xử lý trường hợp không có ID trên URL
      setError('Product ID is missing.');
      setIsLoading(false);
    }
  }, [id]); // Dependency là ID từ URL
  // --- ---

   // --- Cập nhật Handlers cho Quantity ---
   const decreaseQuantity = () => {
    // Đã đúng: không giảm dưới MIN_QUANTITY
    setQuantity((prev) => Math.max(MIN_QUANTITY, prev - 1));
  };

  const increaseQuantity = () => {
    // Thêm điều kiện không tăng quá MAX_QUANTITY
    setQuantity((prev) => Math.min(MAX_QUANTITY, prev + 1));
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Nếu người dùng xóa trắng input, tạm thời có thể reset về min
    if (value === '') {
       setQuantity(MIN_QUANTITY); // Hoặc set là một giá trị tạm thời khác
       return;
    }
    const numValue = parseInt(value, 10);
    // Chỉ cập nhật nếu là số hợp lệ
    if (!isNaN(numValue)) {
        // Giới hạn giá trị trong khoảng [MIN_QUANTITY, MAX_QUANTITY]
        const clampedValue = Math.max(MIN_QUANTITY, Math.min(MAX_QUANTITY, numValue));
        setQuantity(clampedValue);
    }
    // Nếu nhập chữ hoặc ký tự khác, state quantity không đổi
 };
  // --- ---
  // --- Handler cho nút Add to Cart ---
  const handleAddToCart = () => {
    if (!productData) return; // Phải có productData

    // Truyền cả productData (chứa bookDetails) và quantity
    // Giả sử ProductDetail có các trường giống CartBookDetails
    const success = addItem(productData, quantity);

    if (success) {
        toast.success(`${quantity} "${productData.bookTitle}" added to cart!`);
    } else {
        toast.error(`Cannot add item. Quantity limit (${MAX_ITEM_QUANTITY}) would be exceeded.`);
    }
};
// --- ---

  // --- Xử lý hiển thị Loading / Error / Not Found ---
  if (isLoading) {
    // Có thể dùng Skeleton component ở đây
    return <div className='container mx-auto px-4 py-12 text-center'>Loading product details...</div>;
  }

  if (error) {
    return <div className='container mx-auto px-4 py-12 text-center text-destructive'>{error}</div>;
  }

  // Trường hợp không tìm thấy sản phẩm (API trả về null hoặc lỗi 404 đã được set vào error)
  if (!productData) {
     return <div className='container mx-auto px-4 py-12 text-center text-muted-foreground'>Product not found.</div>;
  }
  // --- ---

  // --- Xây dựng URL ảnh (ví dụ dùng Picsum) ---
  const picsumBaseUrl = import.meta.env.VITE_PICSUM_SEED_BASE_URL || 'https://picsum.photos/seed/';
  const fallbackImageUrl = import.meta.env.VITE_FALLBACK_IMAGE_URL || '/images/fallback_book.png';
  // Kích thước lớn hơn cho trang chi tiết
  const DETAIL_IMAGE_WIDTH = 400;
  const DETAIL_IMAGE_HEIGHT = Math.round(DETAIL_IMAGE_WIDTH * 1.05); // Giữ tỉ lệ

  let actualImageUrl = fallbackImageUrl;
  const bookCoverPhoto = productData?.bookCoverPhoto

  // Chỉ tạo URL Picsum nếu bookCoverPhoto là string hợp lệ (không null, không rỗng)
  if (bookCoverPhoto && typeof bookCoverPhoto === 'string' && bookCoverPhoto.trim() !== '') {
    actualImageUrl = `${picsumBaseUrl}${bookCoverPhoto}/${DETAIL_IMAGE_WIDTH}/${DETAIL_IMAGE_HEIGHT}`;
 }

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (event.currentTarget.src !== fallbackImageUrl) {
      event.currentTarget.onerror = null;
      event.currentTarget.src = fallbackImageUrl;
  }
  };
  // --- ---


  return (
    <div className='flex flex-col gap-6'>
      {/* --- Section 1: Category Name --- */}
      <section className="container mx-auto px-4 pb-4">
        {/* Tăng kích thước, độ đậm cho Category */}
        <h2 className="text-lg font-bold text-foreground">
          {productData.categoryName}
        </h2>
      </section>
      {/* --- --- */}

      {/* --- Section 2: Product Info & Actions --- */}
      <section>
        {/* --- Grid 2 cột chính --- */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_2fr)_minmax(0,_1fr)] gap-8 lg:gap-12">

          {/* --- Cột Trái: Thông tin sách --- */}
          <div className="border rounded-lg p-6">
            {/* Layout con bên trong cột trái: dùng Flexbox */}
            <div className="flex flex-col sm:flex-row gap-6 md:gap-8">
               {/* Khu vực Ảnh + Tác giả */}
               <div className="w-full sm:w-1/3 lg:w-1/4 xl:w-1/5 flex-shrink-0">
                 {/* Thay đổi aspect ratio nếu cần, ví dụ aspect-[3/4] cho sách */}
                 <div className="aspect-[3/4] bg-secondary rounded-lg mb-2 flex items-center justify-center overflow-hidden shadow-sm">
                   <img
                      src={actualImageUrl || fallbackImageUrl}
                      alt={productData.bookTitle}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={handleImageError} // Xử lý lỗi ảnh
                    />
                 </div>
                 {/* Style lại Author */}
                 <p className="text-sm text-center text-muted-foreground">By {productData.authorName}</p>
               </div>

               {/* Khu vực Text: Title, Desc, Accolades */}
               <div className="flex-grow space-y-4">
                 <h1 className="text-xl lg:text-2xl font-bold tracking-tight !mt-0"> {/* Thêm !mt-0 để ghi đè space-y */}
                   {productData.bookTitle}
                 </h1>
                 <p className="text-muted-foreground text-sm leading-relaxed">
                   {productData.bookSummary}
                 </p>
                 {/* Chuyển accolades thành các đoạn <p> hoặc giữ <ul> */}
                 {/* <div className="space-y-1 text-sm text-muted-foreground pt-2">
                    {product.accolades.map((item, index) => (
                        // Dùng <p> thay cho <li> nếu không muốn dấu chấm đầu dòng
                       <p key={index}>"{item}"</p>
                    ))}
                 </div> */}
               </div>
            </div>
          </div>
          {/* --- Kết thúc Cột Trái --- */}


          {/* --- Cột Phải: Action (Giá, Số lượng, Nút) --- */}
          <div className="border rounded-lg p-6 self-start">
             {/* Thêm style giống Card để tạo khối riêng biệt */}
             <div className="space-y-4">
                {/* Price */}
                <div className='pb-4 border-b border-border bg-muted/30 -mx-6 px-6 rounded-t-lg'>
                  <div className="flex justify-start items-baseline gap-2">
                     {/* Logic hiển thị giá gốc/giá bán */}
                     {(productData.bookPrice && productData.bookPrice !== productData.finalPrice) && (
                        <p className="text-md text-muted-foreground line-through">
                          ${productData.bookPrice.toFixed(2)}
                        </p>
                      )}
                     <p className="text-xl font-bold text-primary">
                       ${productData.finalPrice.toFixed(2)}
                     </p>
                  </div>
                </div>

                {/* Quantity */}
                <div className="pt-2 space-x-3">
                  <label htmlFor={`quantity-${id}`} className="text-xs font-medium text-muted-foreground block">Quantity</label>
                  <div className="flex items-center border rounded-md overflow-hidden">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-r-none"
                      onClick={decreaseQuantity} // Gọi hàm giảm số lượng
                      disabled={quantity <= MIN_QUANTITY} // Disable nếu đã ở min
                    >
                      <Minus className="h-4 w-4"/>
                    </Button>
                    <Input
                       id={`quantity-${id}`}
                       type="number"
                       min={MIN_QUANTITY} // <-- Dùng hằng số
                       max={MAX_QUANTITY} // <-- Thêm thuộc tính max và dùng hằng số
                       value={quantity}
                       onChange={handleQuantityChange}
                       className="h-9 px-2 text-center border-none focus-visible:ring-0 text-base flex-grow min-w-[40px]"
                    />
                    <Button 
                     variant="ghost" 
                     size="icon" 
                     className="h-9 w-9 rounded-l-none"
                     onClick={increaseQuantity} // Gọi hàm tăng số lượng
                     disabled={quantity >= MAX_QUANTITY} // Disable nếu đã ở max
                    >
                      <Plus className="h-4 w-4"/>
                    </Button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button size="lg" className="w-full" onClick={handleAddToCart}>
                  Add to cart
                </Button>
             </div>
          </div>
          {/* --- Kết thúc Cột Phải --- */}

        </div>
        {/* --- Kết thúc Grid 2 cột chính --- */}
      </section>
      {/* === Kết thúc Section 1 === */}

      {/* <Separator /> */}
      <CustomerReview productId={productData?.id}></CustomerReview>
    </div>

  );
};

export default ProductDetailPage;