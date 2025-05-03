// src/pages/ShopPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom'; // Import hook
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
  { value: 'sale.desc', label: 'Sort by on sale', orderBy: 'sale', orderDir: 'desc' },
  { value: 'popularity.desc', label: 'Sort by popularity', orderBy: 'popularity', orderDir: 'desc' },
  { value: 'price.asc', label: 'Sort by price: low to high', orderBy: 'price', orderDir: 'asc' },
  { value: 'price.desc', label: 'Sort by price: high to low', orderBy: 'price', orderDir: 'desc' },
];

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = ITEMS_PER_PAGE_OPTIONS[1]; // Ví dụ: 20
const DEFAULT_SORT_OPTION = SORT_OPTIONS[0]; // popularity.desc
// --- ---

// --- Hàm Helper đọc và parse query param ---
const getQueryParamAsNumber = (param: string | null, defaultValue: number): number => {
  const value = parseInt(param || '', 10);
  return !isNaN(value) && value >= 1 ? value : defaultValue;
};
const getQueryParamAsNullableNumber = (param: string | null): number | null => {
  const value = parseInt(param || '', 10);
  return !isNaN(value) ? value : null;
};
const getQueryParamAsString = (param: string | null): string | null => {
  return param;
};
// --- ---

const ShopPage = () => {
  // --- Hook để đọc và ghi search params ---
  const [searchParams, setSearchParams] = useSearchParams();
  // // --- Cập nhật state types ---
  // const [activeCategory, setActiveCategory] = useState<number | null>(null); // Kiểu number | null
  // const [activeAuthor, setActiveAuthor] = useState<number | null>(null);   // Kiểu number | null
  // const [activeRating, setActiveRating] = useState<number | null>(null);   // Kiểu number | null
  // // --- ---
  // const [currentPage, setCurrentPage] = useState(1);
  // const [limit, setLimit] = useState<number>(ITEMS_PER_PAGE_OPTIONS[2]); // Giá trị mặc định là 20
  // // --- Cập nhật state sort ---
  // const [orderBy, setOrderBy] = useState<any>(SORT_OPTIONS[0].orderBy); // State riêng cho order_by
  // const [orderDir, setOrderDir] = useState<any>(SORT_OPTIONS[0].orderDir); // State riêng cho order

  // --- State đọc giá trị khởi tạo từ URL hoặc dùng Default ---
  const [activeCategory, setActiveCategory] = useState<number | null>(() =>
      getQueryParamAsNullableNumber(searchParams.get('category'))
  );
  const [activeAuthor, setActiveAuthor] = useState<number | null>(() =>
      getQueryParamAsNullableNumber(searchParams.get('author'))
  );
  const [activeRating, setActiveRating] = useState<number | null>(() =>
      getQueryParamAsNullableNumber(searchParams.get('rating'))
  );
  const [currentPage, setCurrentPage] = useState<number>(() =>
      getQueryParamAsNumber(searchParams.get('page'), DEFAULT_PAGE)
  );
  const [limit, setLimit] = useState<number>(() => {
      const limitParam = getQueryParamAsNumber(searchParams.get('limit'), DEFAULT_LIMIT);
      return ITEMS_PER_PAGE_OPTIONS.includes(limitParam) ? limitParam : DEFAULT_LIMIT;
  });
  const [orderBy, setOrderBy] = useState<GetBooksParams['order_by']>(() => {
      const ob = getQueryParamAsString(searchParams.get('order_by'));
      const isValid = ob && SORT_OPTIONS.some(opt => opt.orderBy === ob);
      return isValid ? ob as GetBooksParams['order_by'] : DEFAULT_SORT_OPTION.orderBy as GetBooksParams['order_by'];
  });
  const [orderDir, setOrderDir] = useState<GetBooksParams['order']>(() => {
      const od = getQueryParamAsString(searchParams.get('order'));
      const isValid = od && (od === 'asc' || od === 'desc');
      return isValid ? od as GetBooksParams['order'] : DEFAULT_SORT_OPTION.orderDir as GetBooksParams['order'];
  });
  // --- Kết thúc khởi tạo State ---

  const [booksResponse, setBooksResponse] = useState<BookListResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [error, setError] = useState<string | null>(null); // Lỗi chung cho fetch books
  const [filterError, setFilterError] = useState<string | null>(null); // Lỗi riêng cho fetch filters


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

      // --- Tạo params với tên key mới ---
      const params: GetBooksParams = {
        page: currentPage,
        limit: limit,
        order_by: orderBy, // <-- Tên mới
        order: orderDir,   // <-- Tên mới
        category: activeCategory, // <-- Tên mới
        author: activeAuthor,     // <-- Tên mới
        rating: activeRating,     // <-- Tên mới (giữ nguyên)
      };
      // Loại bỏ các key có giá trị null hoặc undefined trước khi gửi đi (tùy chọn)
      Object.keys(params).forEach(key =>
         (params[key as keyof GetBooksParams] === null || params[key as keyof GetBooksParams] === undefined) && delete params[key as keyof GetBooksParams]
      );
      // --- ---

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
  }, [activeCategory, activeAuthor, activeRating, currentPage, limit, orderBy, orderDir]);


  // --- Cập nhật searchParams khi state thay đổi ---
  // --- useEffect để CẬP NHẬT URL KHI STATE THAY ĐỔI ---
  useEffect(() => {
    const newSearchParams = new URLSearchParams();

    // Chỉ thêm param nếu nó khác giá trị mặc định hoặc có giá trị (cho filter)
    if (activeCategory !== null) newSearchParams.set('category', String(activeCategory));
    if (activeAuthor !== null) newSearchParams.set('author', String(activeAuthor));
    if (activeRating !== null) newSearchParams.set('rating', String(activeRating));
    if (currentPage !== DEFAULT_PAGE) newSearchParams.set('page', String(currentPage));
    if (limit !== DEFAULT_LIMIT) newSearchParams.set('limit', String(limit));
    if (orderBy !== DEFAULT_SORT_OPTION.orderBy || orderDir !== DEFAULT_SORT_OPTION.orderDir) {
      if (orderBy) newSearchParams.set('order_by', orderBy);
      if (orderDir) newSearchParams.set('order', orderDir);
    }

    // Sắp xếp key cho URL đẹp hơn (tùy chọn)
    newSearchParams.sort();

    // Cập nhật URL mà không reload trang
    // replace: true giúp không tạo entry mới trong history mỗi lần đổi filter nhỏ
    setSearchParams(newSearchParams, { replace: true });

  }, [activeCategory, activeAuthor, activeRating, currentPage, limit, orderBy, orderDir, setSearchParams]);

  // handleFilterChange giữ nguyên logic nhưng đảm bảo value truyền vào là number hoặc null
  const handleFilterChange = (type: 'category' | 'author' | 'rating', value: string | number | null) => {
    setCurrentPage(DEFAULT_PAGE);
    // Chuyển value thành number nếu có thể (đặc biệt quan trọng nếu ID từ component là string)
    const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;
    const finalValue = isNaN(numericValue as number) ? null : numericValue; // Đảm bảo là number hoặc null

    if (type === 'category') setActiveCategory(finalValue);
    else if (type === 'author') setActiveAuthor(finalValue);
    else if (type === 'rating') setActiveRating(finalValue);
  };

  // Cập nhật handleSortChange
  const handleSortChange = (value: string) => { // value nhận vào là "orderBy.orderDir"
    const selectedOption = SORT_OPTIONS.find(opt => opt.value === value);
     if (selectedOption) {
         setOrderBy(selectedOption.orderBy as GetBooksParams['order_by']);
         setOrderDir(selectedOption.orderDir as GetBooksParams['order']);
         setCurrentPage(DEFAULT_PAGE);
     }
 };

  const handleLimitChange = (value: string) => {
    const newLimit = parseInt(value, 10);
    if (!isNaN(newLimit) && ITEMS_PER_PAGE_OPTIONS.includes(newLimit)) {
      setLimit(newLimit);
      setCurrentPage(DEFAULT_PAGE);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (booksResponse?.totalPages ?? 1)) {
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
          if (cat) filters.push(`Category: ${cat.categoryName}`);
      }
      if (activeAuthor) {
           const auth = authors.find(a => a.id === activeAuthor);
           if (auth) filters.push(`Author: ${auth.authorName}`);
      }
      if (activeRating) {
           filters.push(`Minimum rating: ${activeRating}+ star${activeRating > 1 ? 's' : ''}`);
      }
      return filters.length > 0 ? `(Filtered by ${filters.join(', ')})` : '';
  }, [activeCategory, activeAuthor, activeRating, categories, authors]);

  const currentSortValue = `${orderBy}.${orderDir}`; // Tạo lại value để so sánh
  const currentSortLabel = SORT_OPTIONS.find(opt => opt.value === currentSortValue)?.label || 'Sort by...';
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
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="outline" className="flex items-center gap-1">
                   {currentSortLabel} <ChevronDown className="h-4 w-4" />
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                 <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 {/* value giờ là "orderBy.orderDir" */}
                 <DropdownMenuRadioGroup value={currentSortValue} onValueChange={handleSortChange}>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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