import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>BASIC COLOR</Link>
            <p className={styles.tagline}>
              Elevating essentials through quality and minimalism.
            </p>
          </div>

          <div className={styles.links}>
            <h4>Shop</h4>
            <ul>
              <li><Link to="/products?category=men">Men</Link></li>
              <li><Link to="/products?category=women">Women</Link></li>
              <li><Link to="/products?category=accessories">Accessories</Link></li>
              <li><Link to="/products?new=true">New Arrivals</Link></li>
            </ul>
          </div>

          <div className={styles.links}>
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>

          <div className={styles.newsletter}>
            <h4>Stay in the loop</h4>
            <p>Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className={styles.input}
              />
              <button type="submit" className={styles.submitBtn}>
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} Basic Color. All rights reserved.</p>
          <div className={styles.social}>
            <a href="#" aria-label="Instagram">Instagram</a>
            <a href="#" aria-label="Twitter">Twitter</a>
            <a href="#" aria-label="Facebook">Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
