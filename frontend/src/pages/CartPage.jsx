import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPriceVND } from '../utils/currency';



const parseStockNumber = (value) => {
    if (value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
};

const getAvailability = (item) => {
    if (!item) {
        return { availableStock: null, isAvailable: false, maxSelectable: 1 };
    }

    const availableStock = parseStockNumber(item.available_stock);
    const purchasableQty = parseStockNumber(item.purchasable_quantity);
    const effectiveStock = availableStock ?? purchasableQty;
    const normalizedStock = typeof effectiveStock === 'number' ? Math.max(effectiveStock, 0) : null;

    const hasAvailabilityFlag = typeof item.is_available === 'boolean';
    const isAvailable = hasAvailabilityFlag ? item.is_available : (normalizedStock === null || normalizedStock > 0);
    const maxSelectable = normalizedStock === null ? Number.MAX_SAFE_INTEGER : Math.max(normalizedStock, 1);

    return { availableStock: normalizedStock, isAvailable, maxSelectable };
};

const CartPage = () => {
    const { isAuthenticated } = useAuth();
    const { cart, cartCount, loading, updateItem, removeItem, refreshCart } = useCart();
    const navigate = useNavigate();

    const [actionError, setActionError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [selectedItems, setSelectedItems] = useState(new Set());

    useEffect(() => {
        if (isAuthenticated) {
            refreshCart();
        }
    }, [isAuthenticated, refreshCart]);

    useEffect(() => {
        const next = new Set();
        (cart?.items || []).forEach((item) => {
            const { isAvailable } = getAvailability(item);
            if (isAvailable) {
                next.add(item.cart_item_id);
            }
        });
        setSelectedItems(next);
    }, [cart]);

    if (!isAuthenticated) {
        return (
            <div className="bg-[#221022] text-white font-[Space_Grotesk] min-h-screen flex flex-col items-center justify-center gap-4">
                <h1 className="text-4xl font-black uppercase">Your Cart</h1>
                <p className="text-[#c992c9]">Please login to view your cart.</p>
                <div className="flex gap-4">
                    <Link to="/login" className="px-4 py-2 rounded-lg bg-[#d411d4] text-white font-bold hover:bg-[#b00eb0] transition-colors">
                        Login
                    </Link>
                    <Link to="/register" className="px-4 py-2 rounded-lg border border-[#d411d4] text-[#d411d4] font-bold hover:bg-[#d411d4] hover:text-white transition-colors">
                        Register
                    </Link>
                </div>
            </div>
        );
    }

    const items = cart?.items || [];
    const subtotal = cart?.subtotal || 0;

    const selectedTotal = items.reduce((sum, item) => {
        const { isAvailable } = getAvailability(item);
        if (!selectedItems.has(item.cart_item_id) || !isAvailable) return sum;
        return sum + (item.line_total || 0);
    }, 0);

    const handleQuantityChange = async (itemId, delta) => {
        const item = items.find((i) => i.cart_item_id === itemId);
        if (!item) return;
        const { isAvailable, maxSelectable } = getAvailability(item);
        if (!isAvailable) {
            setActionError('Item is out of stock. Please remove it.');
            return;
        }

        const newQuantity = Math.max(1, Math.min(item.quantity + delta, maxSelectable));
        setUpdatingId(itemId);
        setActionError('');
        try {
            await updateItem(itemId, newQuantity);
        } catch (err) {
            setActionError(err.message || 'Unable to update quantity.');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleRemove = async (itemId) => {
        setUpdatingId(itemId);
        setActionError('');
        try {
            await removeItem(itemId);
        } catch (err) {
            setActionError(err.message || 'Unable to remove item.');
        } finally {
            setUpdatingId(null);
        }
    };

    const toggleSelect = (itemId, isAvailable) => {
        setSelectedItems((prev) => {
            const next = new Set(prev);
            if (!isAvailable) {
                next.delete(itemId);
                return next;
            }
            if (next.has(itemId)) {
                next.delete(itemId);
            } else {
                next.add(itemId);
            }
            return next;
        });
    };

    const handleCheckout = () => {
        if (selectedTotal <= 0) {
            setActionError('Select at least one available item to checkout.');
            return;
        }

        for (const itemId of selectedItems) {
            const item = items.find((i) => i.cart_item_id === itemId);
            if (!item) continue;

            const { availableStock } = getAvailability(item);
            if (availableStock !== null && item.quantity > availableStock) {
                setActionError(`Not enough stock for ${item.product.name}. Available: ${availableStock}`);
                return;
            }
        }

        navigate('/checkout', { state: { selectedIds: Array.from(selectedItems) } });
    };

    return (
        <div className="bg-[#221022] text-white font-[Space_Grotesk] min-h-screen flex flex-col">
            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 py-8 lg:px-10 max-w-7xl">
                {/* Page Heading */}
                <div className="mb-8 md:mb-12">
                    <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-[-0.033em] mb-2 uppercase">Your Cart</h1>
                    <div className="flex items-center gap-2">
                        <span className="h-px w-12 bg-[#d411d4] inline-block"></span>
                        <p className="text-[#c992c9] text-lg font-normal">{items.length} items in your bag</p>
                    </div>
                    {actionError && <p className="text-sm text-red-400 mt-3">{actionError}</p>}
                </div>

                {/* Content Grid */}
                <div className="flex flex-col lg:flex-row gap-8 xl:gap-16">
                    {/* Left Column: Cart Items */}
                    <div className="flex-1">
                        <div className="overflow-hidden rounded-xl border border-[#482348] bg-[#2a152a]/50 backdrop-blur-sm">
                            {loading ? (
                                <div className="p-8 space-y-4">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="animate-pulse h-20 bg-white/5 rounded-lg"></div>
                                    ))}
                                </div>
                            ) : items.length === 0 ? (
                                <div className="p-8 text-center text-[#c992c9]">
                                    <p>Your cart is empty.</p>
                                    <Link to="/products" className="text-[#d411d4] font-bold hover:text-white transition-colors inline-block mt-2">
                                        Browse products
                                    </Link>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#482348]/20 border-b border-[#482348]">
                                            <th className="px-4 py-4 text-[#c992c9] text-xs uppercase tracking-wider font-bold w-10 text-center">Buy</th>
                                            <th className="px-6 py-4 text-[#c992c9] text-xs uppercase tracking-wider font-bold">Product</th>
                                            <th className="px-6 py-4 text-[#c992c9] text-xs uppercase tracking-wider font-bold w-32 md:w-48 text-center">Quantity</th>
                                            <th className="px-6 py-4 text-[#c992c9] text-xs uppercase tracking-wider font-bold w-32 text-right">Total</th>
                                            <th className="px-4 py-4 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#482348]">
                                        {items.map((item) => {
                                            const attrs = item.variant_attributes || {};
                                            const colorName = attrs.color_name || attrs.color || 'Color';
                                            const colorValue = attrs.color || '#482348';
                                            const sizeLabel = attrs.size || attrs.size_name || 'Free size';
                                            const { availableStock, isAvailable, maxSelectable } = getAvailability(item);

                                            return (
                                                <tr key={item.cart_item_id} className="group hover:bg-[#482348]/10 transition-colors">
                                                    <td className="px-4 py-6 text-center align-top">
                                                        <input
                                                            type="checkbox"
                                                            disabled={!isAvailable}
                                                            checked={selectedItems.has(item.cart_item_id)}
                                                            onChange={() => toggleSelect(item.cart_item_id, isAvailable)}
                                                            className="w-4 h-4 accent-[#d411d4]"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <div className="flex gap-4 md:gap-6 items-center">
                                                            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800 border border-[#482348] group-hover:border-[#d411d4] transition-colors">
                                                                <img alt={item.product.name} className="w-full h-full object-cover" src={item.product.thumbnail} />
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <h3 className="font-bold text-lg leading-tight">{item.product.name}</h3>
                                                                <div className="flex items-center gap-2 text-sm text-[#c992c9]">
                                                                    <span className="w-3 h-3 rounded-full inline-block ring-1 ring-white/20" style={{ backgroundColor: colorValue }}></span>
                                                                    <span>{colorName}</span>
                                                                </div>
                                                                <span className="text-sm text-[#c992c9] mt-1">Size: {sizeLabel}</span>
                                                                {!isAvailable && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold">
                                                                        <span className="material-symbols-outlined text-[12px]">error</span>
                                                                        Hết hàng
                                                                    </span>
                                                                )}
                                                                {isAvailable && availableStock !== null && (
                                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${item.quantity > availableStock
                                                                        ? 'bg-red-500/20 text-red-400'
                                                                        : availableStock <= 5
                                                                            ? 'bg-yellow-500/20 text-yellow-400'
                                                                            : 'bg-green-500/20 text-green-400'
                                                                        }`}>
                                                                        <span className="material-symbols-outlined text-[12px]">inventory_2</span>
                                                                        Còn {availableStock} sản phẩm
                                                                    </span>
                                                                )}
                                                                {isAvailable && availableStock === null && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                                                                        <span className="material-symbols-outlined text-[12px]">all_inclusive</span>
                                                                        Không giới hạn
                                                                    </span>
                                                                )}
                                                                {isAvailable && availableStock !== null && item.quantity > availableStock && (
                                                                    <span className="inline-flex items-center gap-1 text-xs text-red-400 mt-1">
                                                                        <span className="material-symbols-outlined text-[12px]">warning</span>
                                                                        Số lượng vượt quá tồn kho!
                                                                    </span>
                                                                )}
                                                                <span className="md:hidden font-bold mt-2">{formatPriceVND(item.unit_price)}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <div className="flex items-center border border-[#482348] rounded-lg bg-[#221022]/50">
                                                                <button
                                                                    onClick={() => handleQuantityChange(item.cart_item_id, -1)}
                                                                    disabled={updatingId === item.cart_item_id || !isAvailable || item.quantity <= 1}
                                                                    className="w-8 h-8 flex items-center justify-center text-[#c992c9] hover:text-white hover:bg-[#482348]/50 rounded-l-lg transition-colors disabled:opacity-50"
                                                                >
                                                                    <span className="material-symbols-outlined text-[16px]">remove</span>
                                                                </button>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    max={maxSelectable}
                                                                    value={item.quantity}
                                                                    onChange={(e) => {
                                                                        const val = parseInt(e.target.value);
                                                                        if (!isNaN(val)) {
                                                                            handleQuantityChange(item.cart_item_id, val - item.quantity);
                                                                        }
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        let val = parseInt(e.target.value);
                                                                        if (isNaN(val) || val < 1) val = 1;
                                                                        if (isAvailable && val > maxSelectable) {
                                                                            console.log('Exceeded max', maxSelectable);
                                                                            // handleQuantityChange will clamp, but we want to be explicit?
                                                                            // Trigger update to clamp
                                                                            handleQuantityChange(item.cart_item_id, val - item.quantity);
                                                                        }
                                                                    }}
                                                                    disabled={updatingId === item.cart_item_id || !isAvailable}
                                                                    className="w-12 h-8 text-center bg-transparent text-sm font-medium focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                />
                                                                <button
                                                                    onClick={() => handleQuantityChange(item.cart_item_id, 1)}
                                                                    disabled={updatingId === item.cart_item_id || !isAvailable || item.quantity >= maxSelectable}
                                                                    className="w-8 h-8 flex items-center justify-center text-[#c992c9] hover:text-white hover:bg-[#482348]/50 rounded-r-lg transition-colors disabled:opacity-50"
                                                                >
                                                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                                                </button>
                                                            </div>
                                                            {availableStock !== null && (
                                                                <span className={`text-[11px] font-medium ${item.quantity > availableStock ? 'text-red-400' : 'text-[#c992c9]'
                                                                    }`}>
                                                                    {item.quantity} / {availableStock}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6 text-right">
                                                        <span className="font-bold text-lg tracking-tight">{formatPriceVND(item.line_total)}</span>
                                                    </td>
                                                    <td className="px-4 py-6 text-right">
                                                        <button
                                                            onClick={() => handleRemove(item.cart_item_id)}
                                                            disabled={updatingId === item.cart_item_id}
                                                            className="text-[#c992c9]/50 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-400/10 disabled:opacity-50"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="mt-8">
                            <Link to="/products" className="inline-flex items-center gap-2 text-[#d411d4] font-bold hover:text-white transition-colors">
                                <span className="material-symbols-outlined">arrow_back</span>
                                Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:w-[400px] flex-shrink-0">
                        <div className="sticky top-28 flex flex-col gap-6 rounded-xl border border-[#482348] bg-[#2a152a]/50 p-6 md:p-8 backdrop-blur-sm shadow-2xl shadow-[#d411d4]/5">
                            <h2 className="text-2xl font-bold">Order Summary</h2>
                            {/* Stats */}
                            <div className="flex flex-col gap-4 border-b border-[#482348] pb-6">
                                <div className="flex justify-between items-center">
                                    <p className="text-[#c992c9]">Subtotal</p>
                                    <p className="font-medium">{formatPriceVND(selectedTotal)}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-[#c992c9]">Shipping Estimate</p>
                                    <p className="text-[#d411d4] font-medium">Free</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-[#c992c9]">Tax</p>
                                    <p className="font-medium">{formatPriceVND(0)}</p>
                                </div>
                            </div>
                            {/* Promo Code */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-[#c992c9] uppercase tracking-wider">Promo Code</label>
                                <div className="flex w-full items-stretch rounded-lg group">
                                    <input
                                        className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-white focus:outline-0 focus:ring-1 focus:ring-[#d411d4] border border-[#482348] bg-[#221022]/80 focus:border-[#d411d4] h-12 placeholder:text-[#c992c9]/50 px-4 text-sm font-normal leading-normal transition-all"
                                        placeholder="Enter code"
                                    />
                                    <button className="text-white bg-[#482348] hover:bg-[#d411d4] transition-colors border border-l-0 border-[#482348] flex items-center justify-center px-4 rounded-r-lg font-medium text-sm">
                                        Apply
                                    </button>
                                </div>
                            </div>
                            {/* Total */}
                            <div className="flex justify-between items-end border-t border-[#482348] pt-6 mt-2">
                                <p className="text-lg font-bold">Total</p>
                                <div className="text-right">
                                    <p className="text-3xl font-black tracking-tight leading-none">{formatPriceVND(selectedTotal)}</p>
                                    <p className="text-xs text-[#c992c9] mt-1">Including VAT</p>
                                </div>
                            </div>
                            {/* Checkout Button */}
                            <button
                                type="button"
                                onClick={handleCheckout}
                                className={`w-full h-14 bg-[#d411d4] hover:bg-[#b00eb0] text-white rounded-lg font-bold text-lg uppercase tracking-wide shadow-lg shadow-[#d411d4]/25 hover:shadow-[#d411d4]/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group ${(items.length === 0 || selectedTotal <= 0) ? 'pointer-events-none opacity-60' : ''}`}
                            >
                                Checkout Now
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                            {selectedTotal <= 0 && (
                                <p className="text-xs text-[#c992c9]">Select at least one available item to proceed.</p>
                            )}
                            {/* Security Badges */}
                            <div className="flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 mt-2">
                                <span className="text-xs text-[#c992c9]">Secure Checkout</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recommendations */}

            </main>

            {/* Simple Footer */}
            <footer className="border-t border-[#482348] mt-16 py-8 bg-[#221022] text-center">
                <p className="text-[#c992c9] text-sm">Ac 2024 BasicColor. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default CartPage;
