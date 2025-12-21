import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';

import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ContactPage from './pages/ContactPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import AccountPage from './pages/AccountPage';

// Admin pages
import AdminLayout from './components/admin/AdminLayout';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';

import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReviews from './pages/admin/AdminReviews';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

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

        <Route
          path="/login"
          element={
            <>
              <Header />
              <LoginPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/register"
          element={
            <>
              <Header />
              <RegisterPage />
              <Footer />
            </>
          }
        />

        {/* Admin Routes - Protected */}
        <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />

          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
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
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
