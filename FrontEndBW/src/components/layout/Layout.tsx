import { Outlet } from 'react-router-dom'; // Import Outlet
import Header from './Header';       // Ensure path is correct
import Footer from './Footer';       // Ensure path is correct
import { Toaster } from '@/components/ui/sonner'; // Ensure path is correct

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground"> {/* Added default bg/text colors */}
      <Header />
      {/* The main content area where routed components will be rendered */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet /> {/* Renders the matched child route component */}
      </main>
      <Footer />
      <Toaster 
        richColors 
        position="top-right"
        closeButton={true}
        duration={5000} 
      /> {/* Thêm Toaster ở đây */}
    </div>
  );
};

export default Layout; // Use this if it's the default export