// src/pages/HomePage.tsx
// Import các component mới tách ra
import OnSaleCarousel from '@/components/OnSaleCarousel';
import FeaturedBooks from '@/components/FeaturedBooks';

// // --- Sample Data (Giữ lại ở đây hoặc chuyển ra file riêng/fetch API) ---
// const onSaleBooks = [
//   { id: 1, imageUrl: '/placeholder-book.png', title: 'Where the Crawdads Sing', author: 'Delia Owens', price: 10.80, originalPrice: 18.00 },
//   { id: 2, imageUrl: '/placeholder-book.png', title: 'The Silent Patient', author: 'Alex Michaelides', price: 15.50, originalPrice: 26.00 },
//   { id: 3, imageUrl: '/placeholder-book.png', title: 'Atomic Habits', author: 'James Clear', price: 16.20, originalPrice: 27.00 },
//   { id: 4, imageUrl: '/placeholder-book.png', title: 'Educated: A Memoir', author: 'Tara Westover', price: 17.40, originalPrice: 29.00 },
//   { id: 5, imageUrl: '/placeholder-book.png', title: 'Project Hail Mary', author: 'Andy Weir', price: 19.99 },
//   { id: 6, imageUrl: '/placeholder-book.png', title: 'The Midnight Library', author: 'Matt Haig', price: 15.60, originalPrice: 28.00 },
//   { id: 7, imageUrl: '/placeholder-book.png', title: 'Klara and the Sun', author: 'Kazuo Ishiguro', price: 18.80 },
//   { id: 8, imageUrl: '/placeholder-book.png', title: 'The Vanishing Half', author: 'Brit Bennett', price: 16.20, originalPrice: 27.00 },
// ];
// const featuredRecommendedBooks = [
//   { id: 6, imageUrl: '/placeholder-book.png', title: 'The Midnight Library', author: 'Matt Haig', price: 15.60 },
//   { id: 7, imageUrl: '/placeholder-book.png', title: 'Klara and the Sun', author: 'Kazuo Ishiguro', price: 18.80 },
//   { id: 8, imageUrl: '/placeholder-book.png', title: 'The Vanishing Half', author: 'Brit Bennett', price: 16.20 },
//   { id: 9, imageUrl: '/placeholder-book.png', title: 'Anxious People', author: 'Fredrik Backman', price: 17.00 },
//   { id: 10, imageUrl: '/placeholder-book.png', title: 'Fourth Wing', author: 'Rebecca Yarros', price: 22.50 },
//   { id: 11, imageUrl: '/placeholder-book.png', title: 'Iron Flame', author: 'Rebecca Yarros', price: 23.00 },
//   { id: 12, imageUrl: '/placeholder-book.png', title: 'The Psychology of Money', author: 'Morgan Housel', price: 14.99 },
//   { id: 13, imageUrl: '/placeholder-book.png', title: 'A Court of Thorns and Roses', author: 'Sarah J. Maas', price: 12.99 },
// ];
// const featuredPopularBooks = [
//    { id: 14, imageUrl: '/placeholder-book.png', title: 'It Ends with Us', author: 'Colleen Hoover', price: 9.99 },
//    { id: 15, imageUrl: '/placeholder-book.png', title: 'Verity', author: 'Colleen Hoover', price: 11.50 },
//    { id: 16, imageUrl: '/placeholder-book.png', title: 'Reminders of Him', author: 'Colleen Hoover', price: 10.20 },
//    { id: 17, imageUrl: '/placeholder-book.png', title: 'The Seven Husbands of Evelyn Hugo', author: 'Taylor Jenkins Reid', price: 14.00 },
// ];
// --- End Sample Data ---


const HomePage = () => {
  return (
    // Chỉ cần gọi các component section và truyền data vào
    <div className="space-y-12">
      <OnSaleCarousel />
      <FeaturedBooks />
    </div>
  );
};

export default HomePage;