import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Products from './pages/Products.jsx';
import Cart from './pages/Cart.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import styles from './App.module.css';

function App() {
  const location = useLocation();

  return (
    <div className={styles.app}>
      <ScrollToTop />
      <Header />
      <main className={styles.main}>
        <div className={styles.page} key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
