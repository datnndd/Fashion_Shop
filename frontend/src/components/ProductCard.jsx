import React from 'react';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
    const { name, brand, price, colors, label, imageColor } = product;

    return (
        <div className={styles.productCard}>
            <div className={styles.productImageWrapper}>
                {label && <div className={styles.productLabel}>{label}</div>}
                {/* Placeholder image or solid color based on design */}
                <div style={{ width: '100%', height: '100%', background: imageColor || '#f4f4f4' }}></div>
            </div>
            <div className={styles.productBody}>
                <div className={styles.productBrand}>{brand || 'basic color'}</div>
                <div className={styles.productName}>{name}</div>
                <div className={styles.productPrice}>{price}</div>

                {colors && colors.length > 0 && (
                    <div className={styles.productColors}>
                        {colors.map((color, index) => (
                            <div
                                key={index}
                                className={styles.productColorDot}
                                style={{ background: color }}
                            />
                        ))}
                    </div>
                )}

                <button className={styles.productBtn}>Thêm vào giỏ</button>
            </div>
        </div>
    );
};

export default ProductCard;
