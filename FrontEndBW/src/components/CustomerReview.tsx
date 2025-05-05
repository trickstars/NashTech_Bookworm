// src/components/product/CustomerReview.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
import { Star, ChevronDown, Loader2 } from 'lucide-react';
// Giả sử API function và types được import đúng đường dẫn
import { getReviewsByProductId, postReview } from '@/api/reviewApi';
import type { Review, ReviewListResponse, ReviewParams, ReviewCreatePayload } from '@/types/review';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

// --- Constants ---
const REVIEW_SORT_OPTIONS = [
    { value: "date.desc", label: "Sort by date: newest to oldest" },
    { value: "date.asc", label: "Sort by date: oldest to newest" },
];
const REVIEW_LIMIT_OPTIONS = [5, 15, 20, 25];
const DEFAULT_REVIEW_LIMIT = REVIEW_LIMIT_OPTIONS[1]; // 10
const DEFAULT_REVIEW_SORT = REVIEW_SORT_OPTIONS[0].value; // date.desc
const DEFAULT_CURRENT_PAGE = 1;
// --- ---

// --- *** THÊM DỮ LIỆU GIẢ (PLACEHOLDER DATA) *** ---
// Định nghĩa lại kiểu dữ liệu tạm thời ở đây nếu bạn đã comment out import
// interface ReviewPlaceholder {
//     id: number | string;
//     title: string;
//     rating: number;
//     date: string;
//     text: string;
//   }
//   interface RatingCount { stars: number; count: number; }
  
//   const placeholderReviewsResponse = {
//     items: [
//       { id: 'r1', title: 'Absolutely Fantastic!', rating: 5, date: '2025-05-01T10:00:00Z', text: 'This book was amazing, I couldn\'t put it down. Highly recommended for everyone!' },
//       { id: 'r2', title: 'Great Read', rating: 4, date: '2025-04-28T14:30:00Z', text: 'Enjoyed this book a lot. The characters were well-developed and the plot kept me engaged.' },
//       { id: 'r3', title: 'Decent, but slow start', rating: 3, date: '2025-04-25T09:15:00Z', text: 'It took a while for the story to pick up, but the ending was satisfying. Overall a decent read.' },
//       { id: 'r4', title: 'Good story', rating: 5, date: '2025-04-22T11:00:00Z', text: 'Really captivating narrative. Loved the world-building.' },
//       { id: 'r5', title: 'Not my cup of tea', rating: 2, date: '2025-04-20T18:45:00Z', text: 'I couldn\'t really get into this one, unfortunately. The writing style wasn\'t for me.' },
//     ] as ReviewPlaceholder[], // Dùng type placeholder
//     totalItems: 25, // Tổng số review giả
//     totalPages: 3,  // Tổng số trang giả (25 items / 10 limit)
//     currentPage: 1, // Trang hiện tại giả
//     averageRating: 4.1, // Rating trung bình giả
//     ratingCounts: [ // Số lượng giả cho mỗi rating
//       { stars: 5, count: 15 },
//       { stars: 4, count: 5 },
//       { stars: 3, count: 3 },
//       { stars: 2, count: 1 },
//       { stars: 1, count: 1 },
//     ] as RatingCount[],
//   };
  // --- *** KẾT THÚC DỮ LIỆU GIẢ *** ---

// --- Props Interface ---
interface CustomerReviewProps {
  productId: string | number;
}
// --- ---

// --- Hàm Helper Pagination ---
const generatePageNumbers = (currentPage: number, totalPages: number): (number | '...')[] => {
    if (totalPages <= 5) { // Show all pages if 5 or less
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [];
    const siblings = 1; // Number of pages links around current page

    // Always show first page
    pages.push(1);

    // Ellipsis before current page?
    if (currentPage > siblings + 2) {
        pages.push('...');
    }

    // Pages around current page
    const startPage = Math.max(2, currentPage - siblings);
    const endPage = Math.min(totalPages - 1, currentPage + siblings);
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    // Ellipsis after current page?
    if (currentPage < totalPages - (siblings + 1)) {
        pages.push('...');
    }

    // Always show last page (if different from 1)
    if (totalPages > 1) {
        pages.push(totalPages);
    }
    // Remove duplicates just in case simple logic adds duplicates near ends
    return [...new Set(pages)];
};
// --- ---

// --- Component ---
const CustomerReview = ({ productId }: CustomerReviewProps) => {
  // --- State ---
  const [reviewsResponse, setReviewsResponse] = useState<ReviewListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const [currentPage, setCurrentPage] = useState(DEFAULT_CURRENT_PAGE);
const [limit, setLimit] = useState(DEFAULT_REVIEW_LIMIT);
const [sortOption, setSortOption] = useState(DEFAULT_REVIEW_SORT);
const [activeRating, setActiveRating] = useState<number | null>(null); // Thêm state cho filter rating

  // State for Write Review Form
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewDetails, setReviewDetails] = useState('');
  const [reviewRating, setReviewRating] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [submitReviewError, setSubmitReviewError] = useState<string | null>(null);
  // --- ---

  // --- Data Fetching Effect ---
  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    setIsLoading(true);
    setError(null);
    const [sortBy, order] = sortOption.split('.');
    const params: ReviewParams = {
      rating: activeRating ?? undefined, // <-- Lấy giá trị activeRating mới nhất từ state
      // --- ---
      page: currentPage,
      limit: limit,
      orderBy: sortBy as ReviewParams['orderBy'],
      order: order as ReviewParams['order'],
    };
    try {
      const data = await getReviewsByProductId(productId, params);
      setReviewsResponse(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews.');
      setReviewsResponse(null); // Reset data on error
      console.error("Error fetching reviews:", err);
    } finally {
      setIsLoading(false);
    }
  }, [productId, currentPage, limit, sortOption, activeRating]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);
  // --- ---

  // --- Event Handlers ---
    // Handler mới cho filter rating
  const handleRatingFilterClick = (rating: number | null) => {
    setActiveRating(current => (current === rating ? null : rating)); // Toggle filter
    setCurrentPage(DEFAULT_CURRENT_PAGE); // Reset về trang 1
};

  const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= (reviewsResponse?.totalPages ?? 1)) {
          setCurrentPage(newPage);
          // Optional: Scroll to top of reviews section
          // document.getElementById('customer-reviews-heading')?.scrollIntoView({ behavior: 'smooth' });
      }
    // const totalPgs = placeholderReviewsResponse?.totalPages ?? 1; // Dùng totalPages từ data giả
    //    if (newPage >= 1 && newPage <= totalPgs) {
    //        setCurrentPage(newPage);
    //    }
  };

  const handleSortChange = (value: string) => {
     if (value && value !== sortOption) {
         setSortOption(value);
         setCurrentPage(DEFAULT_CURRENT_PAGE); // Reset to page 1 on sort change
     }
  };

  const handleLimitChange = (value: string) => {
    const newLimit = parseInt(value, 10);
    if (!isNaN(newLimit) && REVIEW_LIMIT_OPTIONS.includes(newLimit) && newLimit !== limit) {
      setLimit(newLimit);
      setCurrentPage(DEFAULT_CURRENT_PAGE); // Reset to page 1 on limit change
    }
  };

  const handleReviewSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitReviewError(null);

      if (!reviewTitle.trim()) { // Kiểm tra title không rỗng hoặc chỉ chứa khoảng trắng
        setSubmitReviewError("Please add a title for your review.");
        return;
    }

      if (!reviewRating) {
          setSubmitReviewError("Please select a rating star.");
          return;
      }
      setIsSubmittingReview(true);
      console.log("Submitting review:", { title: reviewTitle, details: reviewDetails, rating: reviewRating });

      const reviewData: ReviewCreatePayload = {
        ratingStar: parseInt(reviewRating, 10), // Chuyển thành số
        reviewTitle: reviewTitle.trim(), // Chỉ gửi nếu có giá trị
        ...(reviewDetails.trim() && { reviewDetails: reviewDetails.trim() }) // Chỉ gửi nếu có giá trị
    };

      try {
          // TODO: Replace with actual API call to post the review
          await postReview(productId, reviewData);
          // await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
          toast.success("Review submitted successfully! It may take some time to appear.");

          // Reset form and potentially refetch reviews
          setReviewTitle('');
          setReviewDetails('');
          setReviewRating('');
          // Fetch lại trang 1 để xem review mới (hoặc không nếu cần moderation)
          if(currentPage !== 1) setCurrentPage(1);
          else fetchReviews(); // Nếu đang ở trang 1 thì fetch lại luôn

      } catch (err: any) {
           const message = err.message || "Failed to submit review.";
           setSubmitReviewError(message);
           toast.error(message);
      } finally {
           setIsSubmittingReview(false);
      }
  };
  // --- ---

  // --- Helper Function ---
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    // Render solid stars - requires Star icon to support fill
    return (
      <div className="flex items-center text-yellow-400">
        {[...Array(fullStars)].map((_, i) => <Star key={`fs-${i}`} className="h-4 w-4 fill-current" />)}
        {[...Array(emptyStars)].map((_, i) => <Star key={`es-${i}`} className="h-4 w-4 text-muted-foreground" />)}
      </div>
    );
  };
  // --- ---

  // --- Calculated values for rendering ---
//    const reviews = reviewsResponse?.items ?? [];
//    const totalItems = reviewsResponse?.totalItems ?? 0;
//    const totalPages = reviewsResponse?.totalPages ?? 1;
//    const averageRating = reviewsResponse?.averageRating ?? 0;
//    const ratingCountsMap = useMemo(() => {
//        const map = new Map<number, number>();
//        reviewsResponse?.ratingCounts?.forEach(rc => map.set(rc.stars, rc.count));
//        return map;
//     }, [reviewsResponse?.ratingCounts]);

  // --- Lấy dữ liệu từ DỮ LIỆU GIẢ ---
  // const reviews = placeholderReviewsResponse.items.slice(0, limit); // Lấy số lượng theo limit
  // const totalItems = placeholderReviewsResponse.totalItems;
  // const totalPages = Math.ceil(totalItems / limit); // Tính lại totalPages dựa trên limit hiện tại
  // // const currentPage = placeholderReviewsResponse.currentPage; // << Dùng state currentPage
  // const averageRating = placeholderReviewsResponse.averageRating;
  // const ratingCountsMap = useMemo(() => {
  //     const map = new Map<number, number>();
  //     placeholderReviewsResponse.ratingCounts?.forEach(rc => map.set(rc.stars, rc.count));
  //     return map;
  // }, []); // Chỉ tính 1 lần vì data giả không đổi

  // -- Dữ liệu thật ---
   const reviews = reviewsResponse?.items ?? [];
   const totalItems = reviewsResponse?.totalItems ?? 0; // Lấy lại totalItems
   const totalPages = reviewsResponse?.totalPages ?? 1;
   const ratingCount = reviewsResponse?.ratingCount ?? 0; // Tổng số review
   const averageRating = reviewsResponse?.averageRating ?? 0;
   const ratingCounts = reviewsResponse?.ratingCounts ?? {}; // Giờ là object

   const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  //  const endItem = Math.min(currentPage * limit, totalItems);
   const endItem = startItem + reviews.length - 1; // Tính end item dựa trên số lượng item trả về của trang hiện tại
   const currentSortLabel = REVIEW_SORT_OPTIONS.find(opt => opt.value === sortOption)?.label || 'Sort by...';
   const currentLimitLabel = `Show ${limit}`;
   const pageNumbers = useMemo(() => generatePageNumbers(currentPage, totalPages), [currentPage, totalPages]);
  // --- ---

  // --- Hàm định dạng ngày tháng ---
  const formatDate = (dateString: string): string => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch (e) {
        return dateString; // Trả về chuỗi gốc nếu không parse được
    }
};
 // --- ---


  return (
    <section aria-labelledby="customer-reviews-heading">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_2fr)_minmax(0,_1fr)] gap-12">

        {/* === Cột Trái: Review Summary & List === */}
        <div className="space-y-6 p-4 border border-border rounded-lg bg-muted">
          <h2 id="customer-reviews-heading" className="text-lg font-semibold tracking-tight">
            Customer Reviews
            {/* Hiển thị filter rating đang active */}
            {activeRating && <span className='text-sm font-normal text-muted-foreground ml-2'>(Filtered by {activeRating} star{activeRating > 1 ? 's' : ''})</span>}
          </h2>

          {/* Rating Summary */}
          <div className="text-md">
             <div > {/* flex-wrap for smaller screens */}
                <p className="text-3xl font-bold">{averageRating > 0 ? averageRating.toFixed(1) : '-'}<span className='text-3xl font-medium ml-1'>Star</span></p>
                {/* Text + Link filter phân loại sao */}
                 {/* Căn chỉnh items-baseline để số và text thẳng hàng */}
                 <div className='flex items-baseline gap-x-2 flex-wrap text-md text-muted-foreground'>
                     {/* --- Nút bấm tổng số review (Clear filter) --- */}
                     <button
                         onClick={() => handleRatingFilterClick(null)}
                         className={cn(
                             "hover:text-primary hover:underline underline-offset-2",
                             activeRating === null && "text-primary font-semibold" // Active khi không có filter rating
                         )}
                     >
                        ({ratingCount})
                     </button>
                     {/* --- --- */}
                     {[5, 4, 3, 2, 1].map(star => {
                         // Lấy count từ dictionary ratingCounts
                         const count = ratingCounts[String(star)] ?? 0;
                         return (
                             <React.Fragment key={star}>
                                 <span>|</span>
                                 <button
                                     onClick={() => handleRatingFilterClick(star)}
                                     disabled={count === 0 && !activeRating} // Disable nếu count=0 và không có filter nào khác active
                                     className={cn( "hover:text-primary hover:underline underline-offset-2", activeRating === star && "text-primary font-semibold", count === 0 && !activeRating && "opacity-50 cursor-not-allowed hover:no-underline hover:text-muted-foreground" )} >
                                    {star} star ({count})
                                 </button>
                             </React.Fragment>
                         );
                     })}
                      {/* {activeRating !== null && (
                          <React.Fragment><span>|</span><button onClick={() => handleRatingFilterClick(null)} className="hover:text-primary hover:underline underline-offset-2 text-primary">(Clear Filter)</button></React.Fragment>
                      )} */}
                 </div>
             </div>
          </div>

          {/* Review List Header */}
           <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
               <p className="text-sm text-muted-foreground">
                  {!isLoading && (totalItems > 0 ? `Showing ${startItem}–${endItem} of ${totalItems} reviews` : 'No reviews yet.')}
                  {isLoading && <span className='animate-pulse'>Loading reviews...</span>}
                  {/* {totalItems > 0 ? `Showing ${startItem}–${endItem} of ${totalItems} reviews` : 'No reviews yet.'} */}
               </p>
               <div className="flex items-center space-x-2">
                {/* Sort */}
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="flex items-center gap-1 text-md">{currentSortLabel} <ChevronDown className="h-3 w-3" /></Button></DropdownMenuTrigger>
                   <DropdownMenuContent align="end">
                     {/* <DropdownMenuLabel>Sort By</DropdownMenuLabel><DropdownMenuSeparator /> */}
                     <DropdownMenuRadioGroup value={sortOption} onValueChange={handleSortChange}>
                        {REVIEW_SORT_OPTIONS.map(opt => ( <DropdownMenuRadioItem key={opt.value} value={opt.value} className="[&>span]:hidden pr-2 text-md">{opt.label}</DropdownMenuRadioItem> ))}
                     </DropdownMenuRadioGroup>
                   </DropdownMenuContent>
                 </DropdownMenu>

                 {/* Show page limit */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="flex items-center gap-1 text-md">{currentLimitLabel} <ChevronDown className="h-3 w-3" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                       {/* <DropdownMenuLabel>Show per page</DropdownMenuLabel><DropdownMenuSeparator /> */}
                       <DropdownMenuRadioGroup value={String(limit)} onValueChange={handleLimitChange}>
                          {REVIEW_LIMIT_OPTIONS.map(opt => ( <DropdownMenuRadioItem key={opt} value={String(opt)} className="[&>span]:hidden pr-2 text-md">Show {opt}</DropdownMenuRadioItem> ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
               </div>
           </div>

          {/* Review List */}
          {
          isLoading ? ( // Skeleton
             <div className="space-y-6">
                 {Array.from({ length: 3 }).map((_, i) => ( // Hiển thị ít skeleton hơn
                     <div key={`rev-skel-${i}`} className="border-b pb-6 space-y-2 animate-pulse last:border-b-0">
                         <div className="flex justify-between">
                             <div className="h-5 w-3/5 bg-muted rounded"></div>
                             <div className="h-4 w-12 bg-muted rounded"></div>
                         </div>
                         <div className="h-3 w-1/4 bg-muted rounded"></div>
                         <div className="h-4 w-full bg-muted rounded"></div>
                         <div className="h-4 w-5/6 bg-muted rounded"></div>
                     </div>
                 ))}
             </div>
          ) : error ? (
             <p className="text-destructive text-center py-10">{error}</p>
          ) : 
          reviews.length > 0 ? (
             <div className="space-y-6">
                {reviews.map((review, index) => (
                   <article key={index} className="border-b pb-6 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-center gap-2 mb-1">
                         <h4 className="font-semibold text-base">{review.reviewTitle || 'Review'}</h4>
                         <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{review.ratingStar} stars</span>
                      </div>
                      <p className="text-sm leading-relaxed mb-2">{review.reviewDetails}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(review.reviewDate)}</p> {/* Format date */}
                   </article>
                ))}
             </div>
           ) : (
              <p className="text-muted-foreground text-center py-10">Be the first to write a review!</p>
           )}

          {/* Pagination */}
          {
          !isLoading && 
          totalItems > 0 && totalPages > 1 && (
              <div className="pt-6 text-center">
                  <Pagination className="inline-flex">
                      <PaginationContent>
                          <PaginationItem><PaginationPrevious onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} aria-disabled={currentPage <= 1} className={cn(currentPage <= 1 ? "pointer-events-none opacity-50" : undefined, "cursor-pointer")}/></PaginationItem>
                          {pageNumbers.map((page, index) => (
                              <PaginationItem key={index}>
                                  {page === '...' ? <PaginationEllipsis /> : <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(page); }} isActive={currentPage === page} className="cursor-pointer">{page}</PaginationLink>}
                              </PaginationItem>
                          ))}
                          <PaginationItem><PaginationNext onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }} aria-disabled={currentPage >= totalPages} className={cn(currentPage >= totalPages ? "pointer-events-none opacity-50" : undefined, "cursor-pointer")}/></PaginationItem>
                      </PaginationContent>
                  </Pagination>
                  <p className="text-xs text-muted-foreground mt-2"> Page {currentPage} of {totalPages} </p>
              </div>
          )}
        </div>
        {/* === Kết thúc Cột Trái === */}


        {/* === Cột Phải: Write a Review === */}
        <div>
           <Card className='overflow-hidden rounded-md'>
             <CardHeader className="px-6 pt-4 bg-muted/50 border-b">
               <CardTitle className='text-lg'>Write a Review</CardTitle>
             </CardHeader>
             <CardContent>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                   <div>
                     <Label htmlFor="review-title" className="text-sm font-medium block mb-1.5">Add a title <span className="text-destructive">*</span></Label>
                     <Input 
                      id="review-title" 
                      placeholder="What's most important to know?" 
                      value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} 
                      disabled={isSubmittingReview}
                      maxLength={120}
                      required
                      />
                   </div>
                   <div>
                     <Label htmlFor="review-details" className="text-sm font-medium block mb-1.5">Details please! Your review helps other shoppers.</Label>
                     <Textarea id="review-details" placeholder="Your review helps other shoppers." rows={5} value={reviewDetails} onChange={(e) => setReviewDetails(e.target.value)} disabled={isSubmittingReview} />
                   </div>
                   <div>
                       <Label htmlFor="review-rating" className="text-sm font-medium block mb-1.5">Select a rating star <span className="text-destructive">*</span></Label>
                       <Select value={reviewRating} onValueChange={setReviewRating} disabled={isSubmittingReview}>
                           <SelectTrigger id="review-rating" className="w-full">
                               <SelectValue placeholder="Select rating..." />
                           </SelectTrigger>
                           <SelectContent>
                               <SelectItem value="5">5 Star</SelectItem>
                               <SelectItem value="4">4 Stars</SelectItem>
                               <SelectItem value="3">3 Stars</SelectItem>
                               <SelectItem value="2">2 Stars</SelectItem>
                               <SelectItem value="1">1 Star</SelectItem>
                           </SelectContent>
                       </Select>
                   </div>
                   {submitReviewError && <p className='text-sm text-destructive'>{submitReviewError}</p>}
                   <Button type="submit" className="w-full" disabled={isSubmittingReview}>
                       {isSubmittingReview && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                       Submit Review
                   </Button>
                </form>
             </CardContent>
           </Card>
        </div>
         {/* === Kết thúc Cột Phải === */}

      </div>
    </section>
  );
};

export default CustomerReview; // Đổi tên export default