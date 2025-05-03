import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookCard from "@/components/common/BookCard"; // Đảm bảo đường dẫn đúng

// Import hàm API
import { getFeaturedRecommendedBooks, getFeaturedPopularBooks } from '@/api/bookApi';
// Import kiểu Book
import type { Book } from '@/types/book';

const FeaturedBooks = () => {
    const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [isLoadingRec, setIsLoadingRec] = useState(true);
  const [isLoadingPop, setIsLoadingPop] = useState(true);
  const [errorRec, setErrorRec] = useState<string | null>(null);
  const [errorPop, setErrorPop] = useState<string | null>(null);

  // Fetch recommended books
  useEffect(() => {
    const fetchRecBooks = async () => {
      setIsLoadingRec(true);
      setErrorRec(null);
      try {
        const data = await getFeaturedRecommendedBooks();
        setRecommendedBooks(data);
      } catch (err) {
        setErrorRec('Failed to load recommended books.');
        console.error("Error fetching recommended books:", err);
      } finally {
        setIsLoadingRec(false);
      }
    };
    fetchRecBooks();
  }, []);

  // Fetch popular books
  useEffect(() => {
    const fetchPopBooks = async () => {
      setIsLoadingPop(true);
      setErrorPop(null);
      try {
        const data = await getFeaturedPopularBooks();
        setPopularBooks(data);
      } catch (err) {
        setErrorPop('Failed to load popular books.');
        console.error("Error fetching popular books:", err);
      } finally {
        setIsLoadingPop(false);
      }
    };
    fetchPopBooks();
  }, []);

  // Hàm render lưới sách (để tránh lặp code)
  const renderBookGrid = (books: Book[], isLoading: boolean, error: string | null) => {
    if (isLoading) {
      return <div className="text-center py-10 text-muted-foreground">Loading books...</div>;
    }
    if (error) {
      return <div className="text-center py-10 text-destructive">{error}</div>;
    }
    if (books.length === 0) {
       return <div className="text-center py-10 text-muted-foreground">No books found.</div>;
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book) => (
           <BookCard
              key={book.id}
              id={book.id}
              bookCoverPhoto={book.bookCoverPhoto}
              bookTitle={book.bookTitle}
              authorName={book.authorName}
              finalPrice={book.finalPrice}
              bookPrice={book.bookPrice}
              className="w-full"
            />
        ))}
      </div>
    );
  };

  return (
    <section aria-labelledby="featured-books-heading">
      <h2 id="featured-books-heading" className="text-2xl font-semibold tracking-tight mb-4 text-center">
        Featured Books
      </h2>
      <Tabs defaultValue="recommended" className="w-full">
        <TabsList className="grid w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto grid-cols-2 mb-6">
          <TabsTrigger value="recommended" className="bg-muted text-muted-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">Recommended</TabsTrigger>
          <TabsTrigger value="popular" className="bg-muted text-muted-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">Popular</TabsTrigger>
        </TabsList>

        <div className="mt-6 border rounded-lg p-6 md:p-8">
          <TabsContent value="recommended" className="mt-0 focus-visible:ring-offset-0 focus-visible:ring-0">
            {renderBookGrid(recommendedBooks, isLoadingRec, errorRec)}
          </TabsContent>
          <TabsContent value="popular" className="mt-0 focus-visible:ring-offset-0 focus-visible:ring-0">
            {renderBookGrid(popularBooks, isLoadingPop, errorPop)}
          </TabsContent>
        </div>
      </Tabs>
    </section>
  );
};

export default FeaturedBooks;