// src/pages/ShopPage.tsx
import BookCard from "@/components/common/BookCard"; // Reuse BookCard
import ShopSidebar from "../components/ShopSidebar"; // Import Sidebar
import { Button } from "@/components/ui/button";
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
import { ChevronDown } from 'lucide-react'; // Icon for dropdowns

// --- Sample Data (Chỉ dùng cho phần hiển thị grid, logic lọc/sort/page chưa có) ---
const sampleBooks = [
  // Thêm khoảng 12 cuốn sách mẫu giống như trong HomePage
  { id: 20, imageUrl: '/placeholder-book.png', title: 'Book Title Example 1', author: 'Author Name 1', price: 19.99 },
  { id: 21, imageUrl: '/placeholder-book.png', title: 'Book Title Example 2', author: 'Author Name 2', price: 25.50 },
  { id: 22, imageUrl: '/placeholder-book.png', title: 'Book Title Example 3', author: 'Author Name 3', price: 14.00 },
  { id: 23, imageUrl: '/placeholder-book.png', title: 'Book Title Example 4', author: 'Author Name 4', price: 31.20 },
  { id: 24, imageUrl: '/placeholder-book.png', title: 'Book Title Example 5', author: 'Author Name 5', price: 19.99 },
  { id: 25, imageUrl: '/placeholder-book.png', title: 'Book Title Example 6', author: 'Author Name 6', price: 25.50 },
  { id: 26, imageUrl: '/placeholder-book.png', title: 'Book Title Example 7', author: 'Author Name 7', price: 14.00 },
  { id: 27, imageUrl: '/placeholder-book.png', title: 'Book Title Example 8', author: 'Author Name 8', price: 31.20 },
  { id: 28, imageUrl: '/placeholder-book.png', title: 'Book Title Example 9', author: 'Author Name 9', price: 19.99 },
  { id: 29, imageUrl: '/placeholder-book.png', title: 'Book Title Example 10', author: 'Author Name 10', price: 25.50 },
  { id: 30, imageUrl: '/placeholder-book.png', title: 'Book Title Example 11', author: 'Author Name 11', price: 14.00 },
  { id: 31, imageUrl: '/placeholder-book.png', title: 'Book Title Example 12', author: 'Author Name 12', price: 31.20 },
];

// --- Placeholder dynamic values (Thay bằng state thực tế) ---
const appliedFilters = "Category #1"; // Ví dụ điều kiện lọc
const startItem = 1;
const endItem = 12;
const totalItems = 126;
const currentPage = 1;
const totalPages = Math.ceil(totalItems / (endItem - startItem + 1)); // Tính tổng số trang (ví dụ)
// --- End Placeholder ---


const ShopPage = () => {
  // --- Các hàm xử lý state cho filter, sort, pagination sẽ được thêm ở đây ---

  return (
    // Bố cục 2 cột: Sidebar trái, Nội dung chính phải
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8"> {/* Tăng độ rộng sidebar */}
      {/* Cột Sidebar */}
      <div>
        <ShopSidebar />
      </div>

      {/* Cột Nội dung chính */}
      <div className="space-y-6">
        {/* --- Top Bar: Title, Info, Controls --- */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          {/* Left side: Title and Filter info */}
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Books
              {appliedFilters && ( // Hiển thị nếu có filter
                <span className="text-base font-normal text-muted-foreground ml-2">
                  (Filtered by {appliedFilters})
                </span>
              )}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Showing {startItem}–{endItem} of {totalItems} books
            </p>
          </div>

          {/* Right side: Sort and Show dropdowns */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  Sort by on sale <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>On Sale</DropdownMenuItem>
                <DropdownMenuItem>Popularity</DropdownMenuItem>
                <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
                <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Show Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                   Show 12 <ChevronDown className="h-4 w-4" /> {/* Giá trị mặc định ví dụ */}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                 <DropdownMenuLabel>Items per page</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem>Show 12</DropdownMenuItem>
                 <DropdownMenuItem>Show 24</DropdownMenuItem>
                 <DropdownMenuItem>Show 36</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* --- Book Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {sampleBooks.map((book) => (
            <BookCard
              key={book.id}
              imageUrl={book.imageUrl}
              title={book.title}
              author={book.author}
              price={book.price}
              className="w-full" // Quan trọng: Ghi đè width cố định
            />
          ))}
        </div>

        {/* --- Pagination --- */}
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" aria-disabled={currentPage <= 1} tabIndex={currentPage <= 1 ? -1 : undefined} className={currentPage <= 1 ? "pointer-events-none opacity-50" : undefined}/>
            </PaginationItem>
            {/* Logic hiển thị số trang cần phức tạp hơn, đây chỉ là ví dụ tĩnh */}
            <PaginationItem>
              <PaginationLink href="#" isActive={currentPage === 1}>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
               <PaginationLink href="#" isActive={currentPage === 2}>2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
               <PaginationLink href="#" isActive={currentPage === 3}>3</PaginationLink>
            </PaginationItem>
            {totalPages > 3 && ( // Chỉ hiển thị ... nếu có nhiều hơn 3 trang
                <PaginationItem>
                    <PaginationEllipsis />
                </PaginationItem>
            )}
            <PaginationItem>
               <PaginationNext href="#" aria-disabled={currentPage >= totalPages} tabIndex={currentPage >= totalPages ? -1 : undefined} className={currentPage >= totalPages ? "pointer-events-none opacity-50" : undefined}/>
            </PaginationItem>
          </PaginationContent>
        </Pagination>

      </div> {/* End Main Content Column */}
    </div> // End Grid Layout
  );
};

export default ShopPage; // Đảm bảo có export default