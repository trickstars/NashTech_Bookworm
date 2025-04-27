import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, X } from 'lucide-react'; // Import icons

// --- Sample Data (Thay bằng state quản lý giỏ hàng thật) ---
const cartItems = [
  { id: 'p1', productId: '123', title: 'Book Title Example 1', author: 'Author Name', imageUrl: '/placeholder-book.png', price: 29.99, quantity: 2, originalPrice: 49.99 },
  { id: 'p2', productId: '456', title: 'Another Book Title Longer Example', author: 'Another Author', imageUrl: '/placeholder-book.png', price: 39.99, quantity: 1 },
];
// --- End Sample Data ---


const calculateSubtotal = (items: typeof cartItems) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

const calculateTotalItems = (items: typeof cartItems) => {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

const CartPage = () => {
  // TODO: Thay thế cartItems bằng state thực tế (ví dụ: từ context, Redux, Zustand...)
  const subtotal = calculateSubtotal(cartItems);
  const totalItemsCount = calculateTotalItems(cartItems);

  // TODO: Thêm các hàm xử lý tăng/giảm số lượng, xóa sản phẩm

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
            <div className="divide-y"> {/* Dùng divide-y để tạo đường kẻ giữa các item */}
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center py-4 gap-4">
                  {/* Product Details */}
                  <div className="flex items-center gap-3 md:gap-4 flex-[2_2_0%]"> {/* Use flex-basis */}
                    <div className="w-16 h-20 md:w-20 md:h-24 bg-secondary rounded overflow-hidden flex-shrink-0">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover"/>
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium line-clamp-2">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.author}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-[1_1_0%]"> {/* Use flex-basis */}
                    <p className="font-medium">${item.price.toFixed(2)}</p>
                    {item.originalPrice && (
                      <p className="text-xs text-muted-foreground line-through">${item.originalPrice.toFixed(2)}</p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="flex justify-center flex-[1_1_0%] px-2"> {/* Use flex-basis */}
                    <div className="flex items-center border rounded-md">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-r-none" disabled={item.quantity <= 1}>
                        <Minus className="h-3 w-3"/>
                      </Button>
                      <Input
                         type="number"
                         min="1"
                         defaultValue={item.quantity}
                         className="h-8 w-10 text-center border-y-0 border-x focus-visible:ring-0 text-sm p-0"
                         readOnly // Hoặc thêm onChange handler
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-l-none">
                        <Plus className="h-3 w-3"/>
                      </Button>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="font-medium text-right flex-[1_1_0%]"> {/* Use flex-basis */}
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>

                   {/* Remove Button */}
                  <div className="w-8 flex-shrink-0 text-right">
                     <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8">
                         <X className="h-4 w-4" />
                     </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
               <Separator />
               <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
               </div>
            </CardContent>
            <CardFooter>
              <Button size="lg" className="w-full">
                Place order
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CartPage;