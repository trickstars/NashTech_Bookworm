import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookCard from "@/components/common/BookCard";
import { ArrowRight } from 'lucide-react'; // Icon cho nút View All

// --- Sample Data (Thay thế bằng dữ liệu thật sau này) ---
const onSaleBooks = [
  { id: 1, imageUrl: '/placeholder-book.png', title: 'Where the Crawdads Sing', author: 'Delia Owens', price: 10.80, originalPrice: 18.00 },
  { id: 2, imageUrl: '/placeholder-book.png', title: 'The Silent Patient', author: 'Alex Michaelides', price: 15.50, originalPrice: 26.00 },
  { id: 3, imageUrl: '/placeholder-book.png', title: 'Atomic Habits', author: 'James Clear', price: 16.20, originalPrice: 27.00 },
  { id: 4, imageUrl: '/placeholder-book.png', title: 'Educated: A Memoir', author: 'Tara Westover', price: 17.40, originalPrice: 29.00 },
  { id: 5, imageUrl: '/placeholder-book.png', title: 'Project Hail Mary', author: 'Andy Weir', price: 19.99 },
];

const featuredRecommendedBooks = [
  { id: 6, imageUrl: '/placeholder-book.png', title: 'The Midnight Library', author: 'Matt Haig', price: 15.60 },
  { id: 7, imageUrl: '/placeholder-book.png', title: 'Klara and the Sun', author: 'Kazuo Ishiguro', price: 18.80 },
  { id: 8, imageUrl: '/placeholder-book.png', title: 'The Vanishing Half', author: 'Brit Bennett', price: 16.20 },
  { id: 9, imageUrl: '/placeholder-book.png', title: 'Anxious People', author: 'Fredrik Backman', price: 17.00 },
  { id: 10, imageUrl: '/placeholder-book.png', title: 'Fourth Wing', author: 'Rebecca Yarros', price: 22.50 },
  { id: 11, imageUrl: '/placeholder-book.png', title: 'Iron Flame', author: 'Rebecca Yarros', price: 23.00 },
  { id: 12, imageUrl: '/placeholder-book.png', title: 'The Psychology of Money', author: 'Morgan Housel', price: 14.99 },
  { id: 13, imageUrl: '/placeholder-book.png', title: 'A Court of Thorns and Roses', author: 'Sarah J. Maas', price: 12.99 },
];

const featuredPopularBooks = [ // Sample data khác cho tab Popular
   { id: 14, imageUrl: '/placeholder-book.png', title: 'It Ends with Us', author: 'Colleen Hoover', price: 9.99 },
   { id: 15, imageUrl: '/placeholder-book.png', title: 'Verity', author: 'Colleen Hoover', price: 11.50 },
   { id: 16, imageUrl: '/placeholder-book.png', title: 'Reminders of Him', author: 'Colleen Hoover', price: 10.20 },
   { id: 17, imageUrl: '/placeholder-book.png', title: 'The Seven Husbands of Evelyn Hugo', author: 'Taylor Jenkins Reid', price: 14.00 },
];
// --- End Sample Data ---


const HomePage = () => {
    return (
      <div className="space-y-12"> {/* Khoảng cách giữa các section */}

        {/* === On Sale Section === */}
        <section aria-labelledby="on-sale-heading">
          <div className="flex justify-between items-center mb-4">
            <h2 id="on-sale-heading" className="text-2xl font-semibold tracking-tight">
              On Sale
            </h2>
            <Button variant="default" className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          {/* List ngang - dùng flex và overflow-x-auto */}
          {/* Có thể thay bằng <Carousel> của shadcn nếu muốn có nút bấm <- -> */}
          <div className="border p-6">
            <div className="flex space-x-4 overflow-x-auto pb-4 -mb-4 mx-auto">
              {onSaleBooks.map((book) => (
                <BookCard
                  key={book.id}
                  imageUrl={book.imageUrl}
                  title={book.title}
                  author={book.author}
                  price={book.price}
                  originalPrice={book.originalPrice}
                  // Không cần className="w-[250px]" vì đã set trong BookCard
                />
              ))}
              {/* Thêm thẻ div trống để tạo khoảng trống cuối list nếu cần */}
              <div className="w-px shrink-0"></div>
            </div>
          </div>
        </section>

        {/* === Featured Books Section === */}
        <section aria-labelledby="featured-books-heading">
          <h2 id="featured-books-heading" className="text-2xl font-semibold tracking-tight mb-4 text-center">
            Featured Books
          </h2>

          <Tabs defaultValue="recommended" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:w-[400px] mx-auto mb-6"> {/* Tabs list căn giữa trên mobile */}
              <TabsTrigger value="recommended">Recommended</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
            </TabsList>

             {/* --- Container bao bọc tab content --- */}
            <div className="mt-6 border p-6"> {/* Thêm div mới với border, padding và margin top */}
              {/* --- Recommend TabsContent --- */}
              <TabsContent value="recommended" className="mt-0 focus-visible:ring-offset-0 focus-visible:ring-0"> {/* Thêm mt-0 và focus style nếu cần */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {featuredRecommendedBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      imageUrl={book.imageUrl}
                      title={book.title}
                      author={book.author}
                      price={book.price}
                      className="w-full"
                    />
                  ))}
                </div>
              </TabsContent>

              {/* --- Popular TabContent --- */}
              <TabsContent value="popular" className="mt-0 focus-visible:ring-offset-0 focus-visible:ring-0"> {/* Thêm mt-0 và focus style nếu cần */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {featuredPopularBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      imageUrl={book.imageUrl}
                      title={book.title}
                      author={book.author}
                      price={book.price}
                      className="w-full"
                    />
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </section>

      </div>
    );
  };

export default HomePage; // Use this if it's the default export