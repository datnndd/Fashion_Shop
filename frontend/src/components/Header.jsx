import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.topBar}>
                Miễn phí vận chuyển đơn từ 499.000đ • Đổi trả trong 30 ngày
            </div>
            <div className={styles.headerMain}>
                <div className={styles.headerInner}>
                    <Link to="/" className={styles.logo}>
                        BASIC<span>COLOR</span>
                    </Link>
                    <nav className={styles.nav}>
                        <Link to="/products">Sản phẩm</Link>
                        <Link to="/collections">Bộ sưu tập màu</Link>
                        <Link to="/studio">Studio Thương Hiệu</Link>
                        <Link to="/about">Về Basic Color</Link>
                    </nav>
                    <div className={styles.headerActions}>
                        <button className={styles.actionBtn}>
                            <span role="img" aria-label="search">🔍</span>
                        </button>
                        <button className={styles.actionBtn}>
                            <span role="img" aria-label="user">👤</span>
                        </button>
                        <button className={styles.actionBtn}>
                            <span role="img" aria-label="wishlist">♡</span>
                        </button>
                        <Link to="/cart" className={styles.badge}>
                            <span role="img" aria-label="cart">🛒</span>
                            <span className={styles.badgeCount}>2</span>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
