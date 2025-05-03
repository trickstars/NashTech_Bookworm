// src/pages/ShopSidebar.tsx
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";

import { cn } from "@/lib/utils"; // Vẫn cần cn để xử lý class điều kiện sau này
import { Author } from "@/types/author";
import { Category } from "@/types/category";

// Dữ liệu Rating tĩnh (có thể chuyển ra constants nếu muốn)
const ratings = [
    { id: 5, name: "5+ Stars" },
    { id: 4, name: "4+ Stars" },
    { id: 3, name: "3+ Stars" },
    { id: 2, name: "2+ Stars" },
    { id: 1, name: "1+ Star" },
  ];
// --- End Sample Data ---
// Định nghĩa kiểu cho props
interface ShopSidebarProps {
    categories: Category[];
    authors: Author[];
    activeCategory: string | number | null;
    activeAuthor: string | number | null;
    activeRating: number | null;
    onFilterChange: (type: 'category' | 'author' | 'rating', value: string | number | null) => void;
    isLoading?: boolean; // Thêm prop isLoading (tùy chọn)
  }

  const ShopSidebar = ({
    categories,
    authors,
    activeCategory,
    activeAuthor,
    activeRating,
    onFilterChange,
    isLoading = false, // Giá trị mặc định
  }: ShopSidebarProps) => {
  
    // Hàm xử lý toggle filter
    const handleToggleFilter = (type: 'category' | 'author' | 'rating', currentValue: string | number | null, newValue: string | number) => {
      onFilterChange(type, currentValue === newValue ? null : newValue);
    };
  
    // Hiển thị skeleton hoặc loading text nếu đang tải filter options
    if (isLoading) {
       return (
          <aside className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Filter By</h3>
              {/* Ví dụ Skeleton đơn giản */}
              <div className="h-8 w-full bg-muted rounded animate-pulse"></div>
              <div className="h-8 w-full bg-muted rounded animate-pulse"></div>
              <div className="h-8 w-full bg-muted rounded animate-pulse"></div>
          </aside>
       );
    }
  
    return (
      <aside>
        <h3 className="text-lg font-semibold mb-4">Filter By</h3>
        <Accordion type="multiple" defaultValue={['category', 'author']} className="w-full">
  
          {/* Category Filter */}
          <AccordionItem value="category">
            <AccordionTrigger>Category</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1">
                {categories.length > 0 ? categories.map((category) => {
                   const isActive = activeCategory === category.id;
                   return (
                     <button
                       key={category.id}
                       onClick={() => handleToggleFilter('category', activeCategory, category.id)}
                       className={cn(
                         "w-full text-left text-sm px-2 py-1 rounded-md transition-colors",
                         isActive
                           ? "font-medium text-primary underline underline-offset-4"
                           : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                       )}
                     >
                       {category.categoryName}
                     </button>
                   );
                 }) : <p className='text-sm text-muted-foreground px-2'>No categories found.</p>}
              </div>
            </AccordionContent>
          </AccordionItem>
  
          {/* Author Filter */}
          <AccordionItem value="author">
            <AccordionTrigger>Author</AccordionTrigger>
            <AccordionContent>
               <div className="space-y-1">
                {authors.length > 0 ? authors.map((author) => {
                   const isActive = activeAuthor === author.id;
                   return (
                     <button
                       key={author.id}
                       onClick={() => handleToggleFilter('author', activeAuthor, author.id)}
                       className={cn(
                         "w-full text-left text-sm px-2 py-1 rounded-md transition-colors",
                         isActive
                           ? "font-medium text-primary underline underline-offset-4"
                           : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                       )}
                     >
                       {author.authorName}
                     </button>
                   );
                 }) : <p className='text-sm text-muted-foreground px-2'>No authors found.</p>}
              </div>
            </AccordionContent>
          </AccordionItem>
  
          {/* Rating Review Filter */}
          <AccordionItem value="rating">
            <AccordionTrigger>Rating Review</AccordionTrigger>
            <AccordionContent>
               <div className="space-y-1">
                {ratings.map((rating) => {
                   const isActive = activeRating === rating.id;
                   return (
                     <button
                       key={rating.id}
                       onClick={() => handleToggleFilter('rating', activeRating, rating.id)}
                       className={cn(
                         "w-full text-left text-sm px-2 py-1 rounded-md transition-colors",
                         isActive
                           ? "font-medium text-primary underline underline-offset-4"
                           : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                       )}
                     >
                      {rating.name}
                     </button>
                   );
                 })}
              </div>
            </AccordionContent>
          </AccordionItem>
  
        </Accordion>
      </aside>
    );
  };
  
  export default ShopSidebar;