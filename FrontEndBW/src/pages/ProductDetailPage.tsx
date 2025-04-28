import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Star, Minus, Plus, ChevronDown } from 'lucide-react';

// --- Placeholder Data ---
const product = {
  id: '123',
  categoryName: 'Fiction',
  categorySlug: 'fiction',
  imageUrl: '/placeholder-book-large.png',
  author: 'Anna Banks',
  title: 'Book Title: Example of a Long Title for Product Detail Page',
  description: 'Book description. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
  accolades: [
    'The multi-million copy bestseller',
    'Soon to be a major film',
    'A Number One New York Times Bestseller',
    'Vanity Fair Beautiful New York Times',
    'Unforgettable... as engrossing as it is moving - Daily Mail',
    "I can't even express how much I love this book! - Reese Witherspoon",
  ],
  originalPrice: 40.00,
  salePrice: 29.99,
};

const reviews = {
  averageRating: 4.6,
  totalReviews: 1536,
  ratingCounts: [
    { stars: 5, count: 1001 },
    { stars: 4, count: 258 },
    { stars: 3, count: 100 },
    { stars: 2, count: 52 },
    { stars: 1, count: 125 },
  ],
  items: [
    { id: 'r1', title: 'Amazing Story! You will LOVE it', rating: 5, date: 'April 12, 2021', text: 'Such an incredibly complex story! I had to buy it because there was a waiting list of 30+ at the local library for this book. Thrilled that I made the purchase.' },
    { id: 'r2', title: 'Amazing Story! You will LOVE it', rating: 5, date: 'April 12, 2021', text: 'Such an incredibly complex story! I had to buy it because there was a waiting list of 30+ at the local library for this book. Thrilled that I made the purchase.' },
    { id: 'r3', title: 'Amazing Story! You will LOVE it', rating: 5, date: 'April 12, 2021', text: 'Such an incredibly complex story! I had to buy it because there was a waiting list of 30+ at the local library for this book. Thrilled that I made the purchase.' },
    { id: 'r4', title: 'Amazing Story! You will LOVE it', rating: 5, date: 'April 12, 2021', text: 'Such an incredibly complex story! I had to buy it because there was a waiting list of 30+ at the local library for this book. Thrilled that I made the purchase.' },
  ],
  pagination: {
    currentPage: 1,
    totalPages: 12,
    startItem: 1,
    endItem: 12,
    totalItems: 3134,
  }
};
// --- End Placeholder Data ---


const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const quantity = 1;

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    return (
      <div className="flex items-center text-yellow-400">
        {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} className="h-4 w-4 fill-current" />)}
        {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300 fill-current" />)}
      </div>
    );
  };


  return (
    <div className="space-y-12">
      <section>
        <p className="text-sm text-muted-foreground mb-3">
          {product.categoryName}
        </p>

        {/* --- Grid 2 cột chính --- */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_2fr)_minmax(0,_1fr)] gap-8 lg:gap-12">

          {/* --- Cột Trái: Thông tin sách --- */}
          <div>
            {/* Layout con bên trong cột trái: dùng Flexbox */}
            <div className="flex flex-col sm:flex-row gap-6 md:gap-8">
               {/* Khu vực Ảnh + Tác giả */}
               <div className="w-full sm:w-1/3 lg:w-1/4 xl:w-1/5 flex-shrink-0">
                 {/* Thay đổi aspect ratio nếu cần, ví dụ aspect-[3/4] cho sách */}
                 <div className="aspect-[3/4] bg-secondary rounded-lg mb-2 flex items-center justify-center overflow-hidden shadow-sm">
                   <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                 </div>
                 <p className="text-xs text-center text-muted-foreground">By (Author) {product.author}</p>
               </div>

               {/* Khu vực Text: Title, Desc, Accolades */}
               <div className="flex-grow space-y-4">
                 <h1 className="text-2xl lg:text-3xl font-bold tracking-tight !mt-0"> {/* Thêm !mt-0 để ghi đè space-y */}
                   {product.title}
                 </h1>
                 <p className="text-muted-foreground text-sm leading-relaxed">
                   {product.description}
                 </p>
                 {/* Chuyển accolades thành các đoạn <p> hoặc giữ <ul> */}
                 <div className="space-y-1 text-sm text-muted-foreground pt-2">
                    {product.accolades.map((item, index) => (
                        // Dùng <p> thay cho <li> nếu không muốn dấu chấm đầu dòng
                       <p key={index}>"{item}"</p>
                    ))}
                 </div>
               </div>
            </div>
          </div>
          {/* --- Kết thúc Cột Trái --- */}


          {/* --- Cột Phải: Action (Giá, Số lượng, Nút) --- */}
          <div className="lg:sticky lg:top-20 self-start">
             {/* Thêm style giống Card để tạo khối riêng biệt */}
             <div className="space-y-6 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                {/* Price */}
                <div className="flex justify-start items-baseline gap-2">
                   {product.originalPrice && (
                      <p className="text-lg text-muted-foreground line-through">
                        ${product.originalPrice.toFixed(2)}
                      </p>
                    )}
                   <p className="text-3xl font-bold text-primary">
                     ${product.salePrice.toFixed(2)}
                   </p>
                </div>

                {/* Quantity */}
                <div className="flex items-center space-x-3">
                  <label htmlFor={`quantity-${id}`} className="text-sm font-medium">Quantity</label>
                  <div className="flex items-center border rounded-md">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-r-none">
                      <Minus className="h-4 w-4"/>
                    </Button>
                    <Input
                       id={`quantity-${id}`} // id nên là duy nhất
                       type="number"
                       min="1"
                       defaultValue={quantity}
                       className="h-9 w-14 text-center border-y-0 border-x focus-visible:ring-0"
                       readOnly // Hoặc thêm onChange
                    />
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-l-none">
                      <Plus className="h-4 w-4"/>
                    </Button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button size="lg" className="w-full">
                  Add to cart
                </Button>
             </div>
          </div>
          {/* --- Kết thúc Cột Phải --- */}

        </div>
        {/* --- Kết thúc Grid 2 cột chính --- */}
      </section>
      {/* === Kết thúc Section 1 === */}

      <Separator />

      <section>
         <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_2fr)_minmax(0,_1fr)] gap-12">
            <div className="space-y-6">
               <h2 className="text-2xl font-semibold tracking-tight">
                 Customer Reviews
               </h2>

               <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg">
                  <div className="text-center sm:text-left">
                     <p className="text-4xl font-bold">{reviews.averageRating.toFixed(1)}</p>
                     <div className="flex justify-center sm:justify-start mt-1">
                        {renderStars(reviews.averageRating)}
                     </div>
                     <p className="text-xs text-muted-foreground mt-1">based on {reviews.totalReviews} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1 text-xs">
                     {reviews.ratingCounts.map(item => (
                        <div key={item.stars} className="flex items-center gap-2">
                           <span className="w-8 text-right">{item.stars} star</span>
                           <div className="h-2 flex-1 bg-muted rounded overflow-hidden">
                              <div
                                 className="h-full bg-yellow-400"
                                 style={{ width: `${(item.count / reviews.totalReviews) * 100}%` }}
                               ></div>
                           </div>
                           <span className="w-10 text-right text-muted-foreground">{item.count}</span>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                   <p className="text-sm text-muted-foreground">
                      Showing {reviews.pagination.startItem}–{reviews.pagination.endItem} of {reviews.pagination.totalItems} reviews
                   </p>
                   <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            Sort by date <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Date: Newest to Oldest</DropdownMenuItem>
                          <DropdownMenuItem>Date: Oldest to Newest</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              Show 12 <ChevronDown className="h-4 w-4" />
                            </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                            <DropdownMenuItem>Show 12</DropdownMenuItem>
                            <DropdownMenuItem>Show 24</DropdownMenuItem>
                            <DropdownMenuItem>Show 36</DropdownMenuItem>
                         </DropdownMenuContent>
                      </DropdownMenu>
                   </div>
               </div>

               <div className="space-y-6">
                  {reviews.items.map(review => (
                     <article key={review.id} className="border-b pb-6">
                        <div className="flex items-center gap-2 mb-1">
                           <h4 className="font-semibold">{review.title}</h4>
                           <div className="ml-auto flex items-center">
                              {renderStars(review.rating)}
                           </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{review.date}</p>
                        <p className="text-sm leading-relaxed">{review.text}</p>
                     </article>
                  ))}
               </div>

               <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" aria-disabled={reviews.pagination.currentPage <= 1} />
                    </PaginationItem>
                    <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
                    <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
                    <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
                    {reviews.pagination.totalPages > 3 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
                    <PaginationItem>
                      <PaginationNext href="#" aria-disabled={reviews.pagination.currentPage >= reviews.pagination.totalPages}/>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>

            </div>

            <div>
               <Card>
                  <CardHeader>
                     <CardTitle>Write a Review</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div>
                        <label htmlFor="review-title" className="text-sm font-medium block mb-1.5">Add a title</label>
                        <Input id="review-title" placeholder="What's most important to know?" />
                     </div>
                     <div>
                        <label htmlFor="review-details" className="text-sm font-medium block mb-1.5">Details please!</label>
                        <Textarea id="review-details" placeholder="Your review helps other shoppers." rows={5}/>
                     </div>
                     <div>
                         <label className="text-sm font-medium block mb-1.5">Select a rating star <span className="text-destructive">*</span></label>
                         <div className="flex items-center space-x-1 text-gray-400 cursor-pointer">
                            {[1, 2, 3, 4, 5].map(star => (
                               <Star key={star} className="h-6 w-6 hover:text-yellow-400"/>
                            ))}
                         </div>
                     </div>
                     <Button className="w-full">Submit Review</Button>
                  </CardContent>
               </Card>
            </div>
         </div>
      </section>
    </div>
  );
};

export default ProductDetailPage;