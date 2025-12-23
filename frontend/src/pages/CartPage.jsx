import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPriceVND } from '../utils/currency';

const recommendations = [
    {
        id: 4,
        name: 'Ribbed Long Sleeve',
        price: 1375000,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcrakDjwySS2NcyUEZGEn_qay61wwEJsUs8RSMa5wI94pGdYYqaIuxSwJSU-SLo-vu07Yli6dNfWBktTffW9gmlzUi4TMDqxrfyo3YxwLwkMScJSBylO9YSAsuZyqUYUdGN5K3MoH3qFYlHQ77T2250DyQyvgAW5fMIowfcTwQcpdyNAQR7HCjRkBusbfNM8O4hY94Cj89yJdzMXsjY5z3yZbxs4AHeblThhw0wKuxbqP9LuWOab_lWX2eDIhDZAYVxKglhhtgmMA',
    },
    {
        id: 5,
        name: 'Basic Cap',
        price: 625000,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAq5Zy9tSAPgAt-jhA9xiZPz_BNBcdTHFvP_PQUPmMd4sLdwHqD98IryyuAnNvJ33hTSHa90PU-rLKMfELfJ5LpaVCXCZwaW36lUCNoIAPMXy244vKs9r569TsJxjQrNyXdqXzIJSbJCtIf0Fdjx4X24cxYh8-Z9VDP_013VC6e5-lXSb515mDSh_4vjpCayj8wX2Fw165Imcho9Q9zU2FI1b-Hz8wgXcxDVy_mSNwBXc84aZbrpynKBrBc86tmgjW6w6S3pihwMfw',
    },
    {
        id: 6,
        name: 'Heavy Cotton Tee',
        price: 875000,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABUP7no3eTgrJ3Q2UvgM-wdg-eSFIprnEb_xtnQGFO7Lr18sy_hlRROWYVqr_p6Qr1YPUsBJWIR9lyB1gbdKoqBLB7W0OD5AHms7GSISgs2cLTvLMutTPNeA3g4JkbqF2fgfObXw7X_4-N6tmIo8mSRk45gaJbdRPLKjqWmr6AsEqbF6G_i8lIuoCvLSok2OmbL6bDKX7POKrHxRgpYfc33QgRN99yt1pCtjwNln1TQ9hZazs5Q-TqSwux0Dk6spDMH6MKNviJhWc',
    },
    {
        id: 7,
        name: 'Oversized Hoodie',
        price: 2375000,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUkyJPJGa1A3TxxNJZCbAtQ1jgRhx7Pgm7Wer3bVQkrwVvLpsl21nHLKZqhTwdTNfSvlaFMvP6Q-gPAFdSJgaFubuK_Qr8vJ6liY-T991fGmRcublvIIOTh1vYyNMsyOt4xw_x9Rjf80us2KB9OfZcfhCQaIqq4qV3MQJ4z0jv64zVZSQyRwpqSCXA5oS1hQTs3BoMIngpFavbX_btJWfBKEuN6Vn1img7IdZQ_7fpYOEpHLB7O2rSzkV8RGqnpuFaEN6H3v47R2E',
    },
];

const CartPage = () => {
    const { isAuthenticated } = useAuth();
    const { cart, cartCount, loading, updateItem, removeItem, refreshCart } = useCart();

    const [actionError, setActionError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            refreshCart();
        }
    }, [isAuthenticated, refreshCart]);

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

    const handleQuantityChange = async (itemId, delta) => {
        const item = items.find((i) => i.cart_item_id === itemId);
        if (!item) return;

        const newQuantity = Math.max(1, item.quantity + delta);
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

    return (
        <div className="bg-[#221022] text-white font-[Space_Grotesk] min-h-screen flex flex-col">
            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 py-8 lg:px-10 max-w-7xl">
                {/* Page Heading */}
                <div className="mb-8 md:mb-12">
                    <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-[-0.033em] mb-2 uppercase">Your Cart</h1>
                    <div className="flex items-center gap-2">
                        <span className="h-px w-12 bg-[#d411d4] inline-block"></span>
                        <p className="text-[#c992c9] text-lg font-normal">{cartCount} items in your bag</p>
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

                                            return (
                                                <tr key={item.cart_item_id} className="group hover:bg-[#482348]/10 transition-colors">
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
                                                                <span className="md:hidden font-bold mt-2">{formatPriceVND(item.unit_price)}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <div className="flex items-center justify-center">
                                                            <div className="flex items-center border border-[#482348] rounded-lg bg-[#221022]/50">
                                                                <button
                                                                    onClick={() => handleQuantityChange(item.cart_item_id, -1)}
                                                                    disabled={updatingId === item.cart_item_id}
                                                                    className="w-8 h-8 flex items-center justify-center text-[#c992c9] hover:text-white hover:bg-[#482348]/50 rounded-l-lg transition-colors disabled:opacity-50"
                                                                >
                                                                    <span className="material-symbols-outlined text-[16px]">remove</span>
                                                                </button>
                                                                <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                                                                <button
                                                                    onClick={() => handleQuantityChange(item.cart_item_id, 1)}
                                                                    disabled={updatingId === item.cart_item_id}
                                                                    className="w-8 h-8 flex items-center justify-center text-[#c992c9] hover:text-white hover:bg-[#482348]/50 rounded-r-lg transition-colors disabled:opacity-50"
                                                                >
                                                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                                                </button>
                                                            </div>
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
                                    <p className="font-medium">{formatPriceVND(subtotal)}</p>
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
                                    <p className="text-3xl font-black tracking-tight leading-none">{formatPriceVND(subtotal)}</p>
                                    <p className="text-xs text-[#c992c9] mt-1">Including VAT</p>
                                </div>
                            </div>
                            {/* Checkout Button */}
                            <Link
                                to="/checkout"
                                className={`w-full h-14 bg-[#d411d4] hover:bg-[#b00eb0] text-white rounded-lg font-bold text-lg uppercase tracking-wide shadow-lg shadow-[#d411d4]/25 hover:shadow-[#d411d4]/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group ${items.length === 0 ? 'pointer-events-none opacity-60' : ''}`}
                            >
                                Checkout Now
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </Link>
                            {/* Security Badges */}
                            <div className="flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 mt-2">
                                <span className="text-xs text-[#c992c9]">Secure Checkout</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                <div className="mt-20 md:mt-32">
                    <h3 className="text-2xl font-bold mb-8">You Might Like</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {recommendations.map((item) => (
                            <Link to={`/product/${item.id}`} key={item.id} className="group cursor-pointer">
                                <div className="aspect-[4/5] rounded-lg bg-gray-800 border border-[#482348] overflow-hidden relative mb-3">
                                    <img
                                        alt={item.name}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                        src={item.image}
                                    />
                                    <div className="absolute bottom-3 right-3 bg-[#221022]/80 backdrop-blur rounded-full p-2 text-[#d411d4] opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                                        <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                                    </div>
                                </div>
                                <h4 className="font-bold text-sm">{item.name}</h4>
                                <p className="text-[#c992c9] text-xs mt-1">{formatPriceVND(item.price)}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-[#482348] mt-16 py-8 bg-[#221022] text-center">
                <p className="text-[#c992c9] text-sm">Ac 2024 BasicColor. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default CartPage;
