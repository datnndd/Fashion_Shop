import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className="container">
        <div className={styles.wrapper}>
          <div className={styles.logo}>
            <Link to="/">BASIC COLOR</Link>
          </div>

          <nav className={`${styles.nav} ${menuOpen ? styles.open : ''}`}>
            <ul className={styles.navList}>
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) => isActive ? styles.active : ''}
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/products"
                  className={({ isActive }) => isActive ? styles.active : ''}
                  onClick={() => setMenuOpen(false)}
                >
                  Shop
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about"
                  className={({ isActive }) => isActive ? styles.active : ''}
                  onClick={() => setMenuOpen(false)}
                >
                  About
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className={styles.actions}>
            <Link to="/cart" className={styles.cartBtn}>
              Cart (0)
            </Link>
            <button
              className={styles.menuToggle}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
