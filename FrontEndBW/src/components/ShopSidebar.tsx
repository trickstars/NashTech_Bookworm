// src/pages/ShopSidebar.tsx
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";

import { cn } from "@/lib/utils"; // Vẫn cần cn để xử lý class điều kiện sau này

// --- Sample Filter Data (Giữ nguyên) ---
const categories = [
{ id: "cat1", name: "Category #1" },
{ id: "cat2", name: "Category #2" },
{ id: "cat3", name: "Category Long Name Example" },
];
const authors = [
{ id: "auth1", name: "Author #1" },
{ id: "auth2", name: "Author #2" },
];
const ratings = [
{ id: "5", stars: 5 },
{ id: "4", stars: 4 },
{ id: "3", stars: 3 },
{ id: "2", stars: 2 },
{ id: "1", stars: 1 },
];
// --- End Sample Data ---


// Component chính sử dụng export default
const ShopSidebar = () => {
// --- Placeholder cho State ---
// Sau này bạn sẽ cần state để lưu trữ bộ lọc đang active, ví dụ:
// const [activeCategory, setActiveCategory] = useState<string | null>(null);
// const [activeAuthor, setActiveAuthor] = useState<string | null>(null);
// const [activeRating, setActiveRating] = useState<string | null>(null);
// --- ---

// Hàm xử lý khi click vào item (sẽ gọi setActive... và logic lọc)
const handleFilterClick = (filterType: string, value: string) => {
    console.log(`Filter clicked: ${filterType} - ${value}`);
    // TODO: Implement state update and filtering logic here
    // Ví dụ: if (filterType === 'category') setActiveCategory(value);
};

return (
    <aside className="lg:sticky lg:top-20 lg:h-[calc(100vh-10rem)]">
    <h3 className="text-lg font-semibold mb-4">Filter By</h3>
    <Accordion type="multiple" defaultValue={['category', 'author', 'rating']} className="w-full"> {/* Default value giúp mặc định mở sẵn accordion */}
        {/* Category Filter */}
        <AccordionItem value="category">
        <AccordionTrigger>Category</AccordionTrigger>
        <AccordionContent>
            {/* --- Thay đổi ở đây --- */}
            <div className="space-y-1"> {/* Giảm khoảng cách nếu muốn */}
            {categories.map((category) => {
                // Giả sử có state 'activeCategory'
                const isActive = false; // << Tạm thời false, thay bằng logic so sánh state: activeCategory === category.id;
                return (
                    <button
                    key={category.id}
                    onClick={() => handleFilterClick('category', category.id)}
                    className={cn(
                        "w-full text-left text-sm px-2 py-1 rounded-md transition-colors", // Style chung
                        isActive
                        ? "font-medium text-primary underline underline-offset-4" // Style khi active
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50" // Style khi inactive
                    )}
                    >
                    {category.name}
                    </button>
                );
                })}
            </div>
            {/* --- Kết thúc thay đổi --- */}
        </AccordionContent>
        </AccordionItem>

        {/* Author Filter */}
        <AccordionItem value="author">
        <AccordionTrigger>Author</AccordionTrigger>
        <AccordionContent>
            {/* --- Thay đổi ở đây --- */}
            <div className="space-y-1">
            {authors.map((author) => {
                const isActive = false; // << Tạm thời false, thay bằng logic: activeAuthor === author.id;
                return (
                    <button
                    key={author.id}
                    onClick={() => handleFilterClick('author', author.id)}
                    className={cn(
                        "w-full text-left text-sm px-2 py-1 rounded-md transition-colors",
                        isActive
                        ? "font-medium text-primary underline underline-offset-4"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                    >
                    {author.name}
                    </button>
                );
                })}
            </div>
            {/* --- Kết thúc thay đổi --- */}
        </AccordionContent>
        </AccordionItem>

        {/* Rating Review Filter */}
        <AccordionItem value="rating">
        <AccordionTrigger>Rating Review</AccordionTrigger>
        <AccordionContent>
            {/* --- Thay đổi ở đây --- */}
            <div className="space-y-1">
            {ratings.map((rating) => {
                const isActive = false; // << Tạm thời false, thay bằng logic: activeRating === rating.id;
                return (
                    <button
                    key={rating.id}
                    onClick={() => handleFilterClick('rating', rating.id)}
                    className={cn(
                        "w-full text-left text-sm px-2 py-1 rounded-md transition-colors",
                        isActive
                        ? "font-medium text-primary underline underline-offset-4"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                    >
                    {rating.stars} Star{rating.stars > 1 ? 's' : ''}
                    </button>
                );
                })}
            </div>
            {/* --- Kết thúc thay đổi --- */}
        </AccordionContent>
        </AccordionItem>
    </Accordion>
    </aside>
);
};

export default ShopSidebar;