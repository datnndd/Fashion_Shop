import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Button from '../components/UI/Button';
import { products } from '../data/products';
import styles from './Home.module.css';

const Home = () => {
  // Get latest 4 products for featured section
  const featuredProducts = products.slice(0, 4);

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.label}>Est. 2024</span>
          <h1 className={styles.title}>Timeless Basics.<br />Elevated.</h1>
          <p className={styles.subtitle}>
            Discover our new collection of premium monochromatic essentials designed for everyday elegance.
          </p>
          <div className={styles.ctaGroup}>
            <Link to="/products">
              <Button size="lg">Shop Collection</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className={styles.categories}>
        <div className="container">
          <div className={styles.categoryGrid}>
            <Link to="/products?category=women" className={styles.categoryCard}>
              <div className={styles.categoryImage} style={{ backgroundColor: '#f0f0f0' }}></div>
              <div className={styles.categoryInfo}>
                <span className={styles.categoryLabel}>Shop Women</span>
              </div>
            </Link>
            <Link to="/products?category=men" className={styles.categoryCard}>
              <div className={styles.categoryImage} style={{ backgroundColor: '#e5e5e5' }}></div>
              <div className={styles.categoryInfo}>
                <span className={styles.categoryLabel}>Shop Men</span>
              </div>
            </Link>
            <Link to="/products?category=accessories" className={styles.categoryCard}>
              <div className={styles.categoryImage} style={{ backgroundColor: '#d4d4d4' }}></div>
              <div className={styles.categoryInfo}>
                <span className={styles.categoryLabel}>Accessories</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className={styles.featured}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>New Arrivals</h2>
            <Link to="/products" className={styles.viewAll}>View All</Link>
          </div>
          <div className={styles.productGrid}>
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* About Teaser */}
      <section className={styles.aboutTeaser}>
        <div className="container">
          <div className={styles.teaserContent}>
            <h2 className={styles.teaserTitle}>Less is More</h2>
            <p className={styles.teaserText}>
              We believe in the power of simplicity. Our garments are crafted with precision, using only the finest sustainable materials. No logos, no distractions. Just pure form and function.
            </p>
            <Link to="/about">
              <Button variant="secondary">Our Story</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
