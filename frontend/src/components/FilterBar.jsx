import React from 'react';
import styles from './FilterBar.module.css';

const FilterBar = ({ activeCategory, onCategoryChange }) => {
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'men', label: 'Men' },
    { id: 'women', label: 'Women' },
    { id: 'accessories', label: 'Accessories' },
  ];

  return (
    <div className={styles.filterBar}>
      <div className={styles.categories}>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`${styles.filterBtn} ${activeCategory === cat.id ? styles.active : ''}`}
            onClick={() => onCategoryChange(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
