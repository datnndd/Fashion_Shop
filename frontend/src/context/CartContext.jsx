import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [cart, setCart] = useState({ items: [], subtotal: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const refreshCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCart({ items: [], subtotal: 0 });
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await cartAPI.getMyCart();
            setCart(data);
        } catch (err) {
            setError(err.message || 'Unable to load cart.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (!authLoading) {
            refreshCart();
        }
    }, [authLoading, refreshCart]);

    const addToCart = useCallback(
        async (productVariantId, quantity = 1, availableStock = null) => {
            if (!isAuthenticated) {
                throw new Error('Please log in to add products to your cart.');
            }
            const existingQty = Array.isArray(cart?.items)
                ? cart.items.find((item) => item.product_variant_id === productVariantId)?.quantity || 0
                : 0;
            const normalizedStock = Number.isFinite(availableStock) ? Math.max(availableStock, 0) : null;
            if (normalizedStock !== null && existingQty + quantity > normalizedStock) {
                const remaining = Math.max(normalizedStock - existingQty, 0);
                throw new Error(`Only ${remaining} more unit(s) can be added for this product due to stock limits.`);
            }
            const data = await cartAPI.addItem({ product_variant_id: productVariantId, quantity });
            setCart(data);
            return data;
        },
        [isAuthenticated, cart]
    );

    const updateItem = useCallback(async (cartItemId, quantity) => {
        const data = await cartAPI.updateItem(cartItemId, quantity);
        setCart(data);
        return data;
    }, []);

    const removeItem = useCallback(async (cartItemId) => {
        const data = await cartAPI.removeItem(cartItemId);
        setCart(data);
        return data;
    }, []);

    const cartCount = useMemo(
        () => (cart?.items ? cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0),
        [cart]
    );

    return (
        <CartContext.Provider
            value={{
                cart,
                cartCount,
                loading,
                error,
                refreshCart,
                addToCart,
                updateItem,
                removeItem,
                setCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
