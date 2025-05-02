import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import BookCard from "@/components/common/BookCard"; // Đảm bảo đường dẫn đúng
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from "@/components/ui/carousel";
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

// Định nghĩa kiểu cho sách (nên định nghĩa ở một nơi dùng chung sau này)
import { Book } from "@/types/book"; // Đảm bảo đường dẫn đúng
import { getOnSaleBooks } from "@/api/bookApi"; // Đảm bảo đường dẫn đúng

const OnSaleCarousel = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // --- State mới cho dữ liệu sách, loading, error ---
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // --- ---

  // --- useEffect để gọi API khi component mount ---
  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getOnSaleBooks();
        setBooks(data);
      } catch (err) { // Bắt lỗi nếu hàm API throw error
        setError('Failed to fetch on-sale books.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []); // Mảng dependency rỗng để chỉ chạy 1 lần khi mount
  // --- ---

  const updateScrollability = useCallback((carouselApi: CarouselApi | undefined) => {
    if (!carouselApi) return;
    setCanScrollPrev(carouselApi.canScrollPrev());
    setCanScrollNext(carouselApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!api) return;
    updateScrollability(api);
    api.on("select", () => updateScrollability(api));
    api.on("reInit", () => updateScrollability(api));
    return () => {
      api?.off("select", () => updateScrollability(api));
      api?.off("reInit", () => updateScrollability(api));
    };
  }, [api, updateScrollability]);

  const scrollPrev = useCallback(() => { api?.scrollPrev(); }, [api]);
  const scrollNext = useCallback(() => { api?.scrollNext(); }, [api]);

  return (
    <section aria-labelledby="on-sale-heading">
      <div className="flex justify-between items-center mb-4">
        <h2 id="on-sale-heading" className="text-2xl font-semibold tracking-tight">
          On Sale
        </h2>
        <Button variant="default" className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
            View All <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      {/* --- THÊM DIV BAO BỌC CÓ BORDER VÀ PADDING --- */}
      <div className="border rounded-lg p-6 relative"> {/* Thêm border, bo góc, padding */}

        {/* Hiển thị trạng thái Loading */}
        {isLoading && (
          <div className="text-center py-10 text-muted-foreground">Loading books...</div>
        )}

        {/* Hiển thị trạng thái Error */}
        {!isLoading && error && (
          <div className="text-center py-10 text-destructive">{error}</div>
        )}

        {/* Hiển thị Carousel khi có dữ liệu và không lỗi */}
        {!isLoading && !error && books.length > 0 && (
          <div className="flex items-center gap-x-3 sm:gap-x-4">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 p-0 rounded-full flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <div className="overflow-hidden flex-grow">
              <Carousel
                setApi={setApi}
                opts={{ align: "start", loop: false }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {books.map((book) => (
                    <CarouselItem key={book.id} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4">
                      <div className="p-1">
                        <BookCard
                          id={book.id}
                          bookCoverPhoto={book.bookCoverPhoto}
                          bookTitle={book.bookTitle}
                          authorName={book.authorName}
                          finalPrice={book.finalPrice}
                          bookPrice={book.bookPrice}
                          className="w-full"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            <Button
               variant="outline"
               size="icon"
               className="h-10 w-10 p-0 rounded-full flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
               onClick={scrollNext}
               disabled={!canScrollNext}
               aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        )}

         {/* Hiển thị khi không có sách nào */}
         {!isLoading && !error && books.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">No books on sale found.</div>
         )}
      </div>
      {/* --- KẾT THÚC DIV BAO BỌC --- */}
    </section>
  );
};

export default OnSaleCarousel;