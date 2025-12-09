import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/UI/Button';
import styles from './Cart.module.css';

const Cart = () => {
  // Mock cart data - in a real app this would come from Context/Redux
  const cartItems = [
    {
      id: 1,
      name: 'Mono Cotton Tee',
      price: 480000,
      quantity: 1,
      size: 'M',
      color: 'White',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 2,
      name: 'Ink Black Trousers',
      price: 920000,
      quantity: 1,
      size: '30',
      color: 'Black',
      image: 'https://images.unsplash.com/photo-1521572153540-5102f3aa7cbb?auto=format&fit=crop&w=200&q=80',
    },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className={styles.cartPage}>
      <div className="container">
        <h1 className={styles.title}>Shopping Cart</h1>

        {cartItems.length > 0 ? (
          <div className={styles.layout}>
            {/* Cart Items List */}
            <div className={styles.items}>
              <div className={styles.headerRow}>
                <span className={styles.headerProd}>Product</span>
                <span className={styles.headerQty}>Quantity</span>
                <span className={styles.headerTotal}>Total</span>
              </div>

              {cartItems.map(item => (
                <div key={item.id} className={styles.itemRow}>
                  <div className={styles.productInfo}>
                    <img src={item.image} alt={item.name} className={styles.image} />
                    <div className={styles.details}>
                      <h3 className={styles.name}>{item.name}</h3>
                      <p className={styles.variant}>{item.color} / {item.size}</p>
                      <p className={styles.price}>${item.price.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className={styles.quantity}>
                    {/* Placeholder content for quantity controls */}
                    <span className={styles.qtyVal}>{item.quantity}</span>
                  </div>

                  <div className={styles.rowTotal}>
                    ${(item.price * item.quantity).toLocaleString()}
                  </div>

                  <button className={styles.removeBtn} aria-label="Remove item">
                    &times;
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className={styles.summary}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Total</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <Button fullWidth size="lg">Checkout</Button>
              <div className={styles.secure}>
                Secure Checkout
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.empty}>
            <p>Your cart is empty.</p>
            <Link to="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
