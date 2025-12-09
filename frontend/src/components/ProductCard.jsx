import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
  return (
    <Link to={`/products/${product.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={product.image}
          alt={product.name}
          className={styles.image}
        />
        {/* Placeholder for hover image or quick add */}
        <div className={styles.overlay}>
          <span className={styles.quickView}>View Details</span>
        </div>
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.price}>${product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
