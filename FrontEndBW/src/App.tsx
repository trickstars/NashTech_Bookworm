import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout'; // Adjust path if needed
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { AboutPage } from './pages/AboutPage';

// Optional: Import a NotFoundPage component
// import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout Route: Applies Header and Footer to all nested routes */}
        <Route path="/" element={<Layout />}>
          {/* Child routes rendered within Layout's Outlet */}
          <Route index element={<HomePage />} /> {/* Home page at "/" */}
          <Route path="shop" element={<ShopPage />} />
          <Route path="product/:id" element={<ProductDetailPage />} /> {/* Dynamic product route */}
          <Route path="cart" element={<CartPage />} />
          <Route path="about" element={<AboutPage />} />

          {/* Optional: Catch-all route for 404 Not Found pages */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Route>

        {/* You could define other top-level routes here if they don't use the main Layout */}
        {/* e.g., <Route path="/admin" element={<AdminLoginPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;