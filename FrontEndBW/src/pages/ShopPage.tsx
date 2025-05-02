// src/pages/ShopPage.tsx
import { useState, useEffect, useMemo } from 'react';
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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
import { getBooks, getCategories, getAuthors } from '@/api/bookApi';
import type { Category } from '@/types/category'; // Import kiểu Category
import type { Author } from '@/types/author'; // Import kiểu Author
import type { BookListResponse, GetBooksParams } from '@/api/bookApi'; // Import kiểu BookListResponse
import type { Book } from '@/types/book';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE_OPTIONS = [5, 15, 20, 25];
const SORT_OPTIONS = [
    { value: 'popularity.desc', label: 'Sort by popularity' },
    { value: 'price.asc', label: 'Sort by price: low to high' },
    { value: 'price.desc', label: 'Sort by price: high to low' },
    // Bỏ 'sale.desc' nếu backend không hỗ trợ hoặc đổi tên cho đúng
    // { value: 'sale.desc', label: 'Sort by on sale' },
];

const ShopPage = () => {
  const [booksResponse, setBooksResponse] = useState<BookListResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [error, setError] = useState<string | null>(null); // Lỗi chung cho fetch books
  const [filterError, setFilterError] = useState<string | null>(null); // Lỗi riêng cho fetch filters

  const [activeCategory, setActiveCategory] = useState<string | number | null>(null);
  const [activeAuthor, setActiveAuthor] = useState<string | number | null>(null);
  const [activeRating, setActiveRating] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState<number>(ITEMS_PER_PAGE_OPTIONS[0]);
  const [sortOption, setSortOption] = useState<string>(SORT_OPTIONS[0].value);

  // --- Các hàm xử lý state cho filter, sort, pagination sẽ được thêm ở đây ---
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setIsLoadingFilters(true);
      setFilterError(null); // Reset lỗi filter trước khi fetch
      try {
        const [catData, authorData] = await Promise.all([
          getCategories(),
          getAuthors()
        ]);
        setCategories(catData);
        setAuthors(authorData);
      } catch (err) {
        console.error("Failed to fetch filter options:", err);
        setFilterError('Could not load filter options.');
      } finally {
        setIsLoadingFilters(false);
      }
    };
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoadingBooks(true);
      setError(null); // Reset lỗi books trước khi fetch

      const [sortBy, order] = sortOption.split('.');
      const params: GetBooksParams = {
        page: currentPage,
        limit: limit,
        sortBy: sortBy,
        order: order as 'asc' | 'desc',
        ...(activeCategory && { categoryId: activeCategory }),
        ...(activeAuthor && { authorId: activeAuthor }),
        ...(activeRating && { rating: activeRating }),
      };

      try {
        const data = await getBooks(params);
        setBooksResponse(data);
      } catch (err) {
        setError('Failed to load books. Please try adjusting filters or try again later.');
        console.error("Error fetching books:", err);
        setBooksResponse(null);
      } finally {
        setIsLoadingBooks(false);
      }
    };
    fetchBooks();
  }, [activeCategory, activeAuthor, activeRating, currentPage, limit, sortOption]);

  const handleFilterChange = (type: 'category' | 'author' | 'rating', value: string | number | null) => {
    setCurrentPage(1); // Luôn reset về trang 1 khi đổi filter
    if (type === 'category') setActiveCategory(value);
    else if (type === 'author') setActiveAuthor(value);
    else if (type === 'rating') setActiveRating(value as number | null);
  };

  const handleSortChange = (value: string) => {
     if (value) {
         setSortOption(value);
         setCurrentPage(1);
     }
  };

  const handleLimitChange = (value: string) => {
    const newLimit = parseInt(value, 10);
    if (!isNaN(newLimit)) {
      setLimit(newLimit);
      setCurrentPage(1);
    }
  };

  const handlePageChange = (newPage: number) => {
      // Không cần kiểm tra totalPages ở đây vì useEffect sẽ fetch lại
      if (newPage >= 1) {
          setCurrentPage(newPage);
      }
  };

  const books = booksResponse?.items ?? [];
  const totalItems = booksResponse?.totalItems ?? 0;
  const totalPages = booksResponse?.totalPages ?? 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  const filterText = useMemo(() => { /* ... (logic giữ nguyên) ... */
      const filters = [];
      if (activeCategory) {
          const cat = categories.find(c => c.id === activeCategory);
          if (cat) filters.push(`Category: ${cat.name}`);
      }
      if (activeAuthor) {
           const auth = authors.find(a => a.id === activeAuthor);
           if (auth) filters.push(`Author: ${auth.name}`);
      }
      if (activeRating) {
           filters.push(`${activeRating} Star${activeRating > 1 ? 's' : ''}`);
      }
      return filters.length > 0 ? `(Filtered by ${filters.join(', ')})` : '';
  }, [activeCategory, activeAuthor, activeRating, categories, authors]);

  const currentSortLabel = SORT_OPTIONS.find(opt => opt.value === sortOption)?.label || 'Sort by...';
  const currentLimitLabel = `Show ${limit}`;

  return (
    // Bố cục 2 cột: Sidebar trái, Nội dung chính phải
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8"> {/* Tăng độ rộng sidebar */}
      {/* Cột Sidebar */}
      <div>
        <ShopSidebar 
        categories={categories}
        authors={authors}
        activeCategory={activeCategory}
        activeAuthor={activeAuthor}
        activeRating={activeRating}
        onFilterChange={handleFilterChange}
        isLoading={isLoadingFilters} // Truyền trạng thái loading filter
        />
        {/* Hiển thị lỗi nếu không tải được filter */}
        {filterError && !isLoadingFilters && <p className="text-xs text-destructive mt-2">{filterError}</p>}
      </div>

      {/* Cột Nội dung chính */}
      <div className="space-y-6">
        {/* --- Top Bar: Title, Info, Controls --- */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          {/* Left side: Title and Filter info */}
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Books <span className="text-base font-normal text-muted-foreground ml-1">{filterText}</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {!isLoadingBooks && (totalItems > 0 ? `Showing ${startItem}–${endItem} of ${totalItems} books` : 'No books found matching your criteria.')}
              {isLoadingBooks && <span className='animate-pulse'>Loading...</span>}
            </p>
          </div>

          {/* Right side: Sort and Show dropdowns */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Sort Dropdown */}
            {/* Sort Dropdown */}
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="outline" className="flex items-center gap-1">
                   {currentSortLabel} <ChevronDown className="h-4 w-4" />
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                 <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 <DropdownMenuRadioGroup value={sortOption} onValueChange={handleSortChange}>
                   {SORT_OPTIONS.map(opt => (
                     <DropdownMenuRadioItem key={opt.value} value={opt.value}>{opt.label}</DropdownMenuRadioItem>
                   ))}
                 </DropdownMenuRadioGroup>
               </DropdownMenuContent>
             </DropdownMenu>

            {/* Show Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-1">
                     {currentLimitLabel} <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                   <DropdownMenuLabel>Items per page</DropdownMenuLabel>
                   <DropdownMenuSeparator />
                   <DropdownMenuRadioGroup value={String(limit)} onValueChange={handleLimitChange}>
                     {ITEMS_PER_PAGE_OPTIONS.map(opt => (
                        <DropdownMenuRadioItem key={opt} value={String(opt)}>Show {opt}</DropdownMenuRadioItem>
                     ))}
                   </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </div>

        {/* --- Book Grid --- */}
        {isLoadingBooks ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
             {Array.from({ length: limit }).map((_, index) => (
                <div key={`skeleton-${index}`} className="border rounded-md p-2 space-y-2 bg-card animate-pulse">
                    <div className="aspect-[4/5] bg-muted rounded-t-md"></div>
                    <div className="h-5 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-5 bg-muted rounded w-1/3 mt-2"></div>
                </div>
             ))}
          </div>
        ) : error ? (
          <p className="text-destructive text-center py-10">{error}</p>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} {...book} className="w-full" />
            ))}
          </div>
        ) : (
           <p className="text-muted-foreground text-center py-16">No books match your current filters.</p>
        )}


        {/* --- Pagination --- */}
        {!isLoadingBooks && totalItems > 0 && totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                  aria-disabled={currentPage <= 1}
                  tabIndex={currentPage <= 1 ? -1 : undefined}
                  className={cn(currentPage <= 1 ? "pointer-events-none opacity-50" : undefined, "cursor-pointer")} // Thêm cursor-pointer
                />
              </PaginationItem>
              {/* Cần logic phức tạp hơn để render số trang ở giữa */}
              <PaginationItem>
                 <span className="px-4 py-2 text-sm">Page {currentPage} of {totalPages}</span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                  aria-disabled={currentPage >= totalPages}
                  tabIndex={currentPage >= totalPages ? -1 : undefined}
                  className={cn(currentPage >= totalPages ? "pointer-events-none opacity-50" : undefined, "cursor-pointer")} // Thêm cursor-pointer
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

      </div> {/* End Main Content Column */}
    </div> // End Grid Layout
  );
};

export default ShopPage; // Đảm bảo có export default