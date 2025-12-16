import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import CollectionsPage from './pages/CollectionsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ContactPage from './pages/ContactPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import AccountPage from './pages/AccountPage';

// Admin pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCollections from './pages/admin/AdminCollections';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminReviews from './pages/admin/AdminReviews';

import { ThemeProvider, useTheme } from './context/ThemeContext';

const AppContent = () => {
  const { theme } = useTheme();

  return (
    <div
      className="min-h-screen flex flex-col font-[Space_Grotesk] text-white selection:text-white overflow-x-hidden transition-colors duration-700"
      style={{
        background: '#1F1B18', // Fallback
        backgroundImage: theme.gradientOverlay,
        backgroundAttachment: 'fixed',
        '--selection-color': theme.accentColor // Verify if this variable is used or needed
      }}
    >
      <style>{`
                ::selection {
                    background-color: ${theme.accentColor};
                    color: white;
                }
            `}</style>
      <Routes>
        {/* Pages with Header/Footer */}
        <Route
          path="/"
          element={
            <>
              <Header />
              <HomePage />
              <Footer />
            </>
          }
        />
        <Route
          path="/about"
          element={
            <>
              <Header />
              <AboutPage />
            </>
          }
        />
        <Route
          path="/collections"
          element={
            <>
              <Header />
              <CollectionsPage />
            </>
          }
        />
        <Route
          path="/collections/:category"
          element={
            <>
              <Header />
              <CollectionsPage />
            </>
          }
        />
        <Route
          path="/product/:id"
          element={
            <>
              <Header />
              <ProductDetailPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/cart"
          element={
            <>
              <Header />
              <CartPage />
            </>
          }
        />
        <Route
          path="/contact"
          element={
            <>
              <Header />
              <ContactPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/account"
          element={
            <>
              <Header />
              <AccountPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/account/*"
          element={
            <>
              <Header />
              <AccountPage />
              <Footer />
            </>
          }
        />

        {/* Pages without standard Header/Footer (use their own) */}
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route
          path="/order-confirmation"
          element={
            <>
              <Header />
              <OrderConfirmationPage />
            </>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="collections" element={<AdminCollections />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Router>
  );
}

export default App;
