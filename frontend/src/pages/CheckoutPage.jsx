import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { formatPriceVND } from '../utils/currency';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cart, cartCount, loading: cartLoading } = useCart();
    const { isAuthenticated, loading: authLoading } = useAuth();

    const items = cart?.items || [];
    const subtotal = cart?.subtotal || 0;
    const shipping = 0;
    const taxes = 0;
    const total = subtotal + shipping + taxes;

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [authLoading, isAuthenticated, navigate]);

    useEffect(() => {
        if (!cartLoading && isAuthenticated && cartCount === 0) {
            navigate('/cart');
        }
    }, [cartLoading, cartCount, isAuthenticated, navigate]);

    return (
        <div className="bg-[#221022] font-[Space_Grotesk] text-white min-h-screen flex flex-col">
            <header className="sticky top-0 z-50 border-b border-[#482348] bg-[#221022]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-[#d411d4]">
                            <span className="material-symbols-outlined text-3xl">all_inclusive</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight uppercase">BasicColor</h1>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                        <span className="material-symbols-outlined text-lg">lock</span>
                        <span>Secure Checkout</span>
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-6 py-8 lg:py-12">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-20">
                        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-10">
                            <nav aria-label="Progress">
                                <ol className="flex items-center gap-4 text-sm font-medium" role="list">
                                    <li className="text-[#d411d4] flex items-center gap-2">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#d411d4] text-white text-xs">1</span>
                                        <span>Shipping</span>
                                    </li>
                                    <li className="text-gray-400">
                                        <span className="material-symbols-outlined text-lg">chevron_right</span>
                                    </li>
                                    <li className="text-gray-500 flex items-center gap-2">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-600 text-gray-400 text-xs">2</span>
                                        <span>Payment</span>
                                    </li>
                                    <li className="text-gray-400">
                                        <span className="material-symbols-outlined text-lg">chevron_right</span>
                                    </li>
                                    <li className="text-gray-500 flex items-center gap-2">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-600 text-gray-400 text-xs">3</span>
                                        <span>Review</span>
                                    </li>
                                </ol>
                            </nav>

                            <section className="space-y-6">
                                <div className="flex justify-between items-end border-b border-[#482348] pb-4">
                                    <h2 className="text-2xl font-bold uppercase tracking-tight">Contact Info</h2>
                                    <div className="text-sm text-[#d411d4] cursor-pointer hover:underline">Use saved details</div>
                                </div>
                                <div className="grid gap-6">
                                    <label className="block">
                                        <span className="text-sm font-medium text-gray-300 mb-1 block">Email Address</span>
                                        <input
                                            className="w-full bg-[#2d152d] border-[#482348] rounded-lg text-white placeholder-gray-500 focus:border-[#d411d4] focus:ring-1 focus:ring-[#d411d4] py-3 px-4 transition-colors"
                                            placeholder="you@example.com"
                                            type="email"
                                        />
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input
                                                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-600 bg-[#2d152d] checked:border-[#d411d4] checked:bg-[#d411d4] transition-all"
                                                type="checkbox"
                                            />
                                            <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-sm font-bold">check</span>
                                        </div>
                                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Email me with news and offers</span>
                                    </label>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-2xl font-bold uppercase tracking-tight border-b border-[#482348] pb-4">Shipping Address</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <label className="block">
                                        <span className="text-sm font-medium text-gray-300 mb-1 block">First Name</span>
                                        <input
                                            className="w-full bg-[#2d152d] border-[#482348] rounded-lg text-white placeholder-gray-500 focus:border-[#d411d4] focus:ring-1 focus:ring-[#d411d4] py-3 px-4 transition-colors"
                                            placeholder="Jane"
                                            type="text"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-medium text-gray-300 mb-1 block">Last Name</span>
                                        <input
                                            className="w-full bg-[#2d152d] border-[#482348] rounded-lg text-white placeholder-gray-500 focus:border-[#d411d4] focus:ring-1 focus:ring-[#d411d4] py-3 px-4 transition-colors"
                                            placeholder="Doe"
                                            type="text"
                                        />
                                    </label>
                                    <label className="block md:col-span-2">
                                        <span className="text-sm font-medium text-gray-300 mb-1 block">Address</span>
                                        <input
                                            className="w-full bg-[#2d152d] border-[#482348] rounded-lg text-white placeholder-gray-500 focus:border-[#d411d4] focus:ring-1 focus:ring-[#d411d4] py-3 px-4 transition-colors"
                                            placeholder="123 Fashion Ave, Apt 4B"
                                            type="text"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-medium text-gray-300 mb-1 block">City</span>
                                        <input
                                            className="w-full bg-[#2d152d] border-[#482348] rounded-lg text-white placeholder-gray-500 focus:border-[#d411d4] focus:ring-1 focus:ring-[#d411d4] py-3 px-4 transition-colors"
                                            placeholder="New York"
                                            type="text"
                                        />
                                    </label>
                                    <div className="grid grid-cols-2 gap-6">
                                        <label className="block">
                                            <span className="text-sm font-medium text-gray-300 mb-1 block">Country</span>
                                            <select className="w-full bg-[#2d152d] border-[#482348] rounded-lg text-white focus:border-[#d411d4] focus:ring-1 focus:ring-[#d411d4] py-3 px-4 transition-colors">
                                                <option>United States</option>
                                                <option>Canada</option>
                                                <option>United Kingdom</option>
                                            </select>
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-medium text-gray-300 mb-1 block">ZIP Code</span>
                                            <input
                                                className="w-full bg-[#2d152d] border-[#482348] rounded-lg text-white placeholder-gray-500 focus:border-[#d411d4] focus:ring-1 focus:ring-[#d411d4] py-3 px-4 transition-colors"
                                                placeholder="10001"
                                                type="text"
                                            />
                                        </label>
                                    </div>
                                    <label className="block md:col-span-2">
                                        <span className="text-sm font-medium text-gray-300 mb-1 block">Phone</span>
                                        <div className="relative">
                                            <input
                                                className="w-full bg-[#2d152d] border-[#482348] rounded-lg text-white placeholder-gray-500 focus:border-[#d411d4] focus:ring-1 focus:ring-[#d411d4] py-3 px-4 transition-colors pl-10"
                                                placeholder="(555) 123-4567"
                                                type="tel"
                                            />
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">call</span>
                                        </div>
                                    </label>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-2xl font-bold uppercase tracking-tight border-b border-[#482348] pb-4">Shipping Method</h2>
                                <div className="space-y-3">
                                    <label className="relative flex cursor-pointer rounded-lg border border-[#d411d4] bg-[#d411d4]/10 p-4 shadow-sm focus:outline-none">
                                        <input defaultChecked className="sr-only" name="delivery-method" type="radio" value="Standard" />
                                        <span className="flex flex-1">
                                            <span className="flex flex-col">
                                                <span className="block text-sm font-bold">Standard Shipping</span>
                                                <span className="mt-1 flex items-center text-sm text-gray-300">4-6 business days</span>
                                            </span>
                                        </span>
                                        <span className="material-symbols-outlined text-[#d411d4] mt-0.5">check_circle</span>
                                        <span className="ml-4 mt-0.5 text-sm font-bold">{formatPriceVND(125000)}</span>
                                    </label>
                                    <label className="relative flex cursor-pointer rounded-lg border border-[#482348] bg-[#2d152d] p-4 shadow-sm focus:outline-none hover:border-gray-500 transition-colors">
                                        <input className="sr-only" name="delivery-method" type="radio" value="Express" />
                                        <span className="flex flex-1">
                                            <span className="flex flex-col">
                                                <span className="block text-sm font-bold">Express Shipping</span>
                                                <span className="mt-1 flex items-center text-sm text-gray-300">1-2 business days</span>
                                            </span>
                                        </span>
                                        <span className="ml-4 mt-0.5 text-sm font-bold">{formatPriceVND(625000)}</span>
                                    </label>
                                </div>
                            </section>

                            <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-4 mt-8 pt-6 border-t border-[#482348]">
                                <Link to="/cart" preventScrollReset className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium py-3">
                                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                                    Return to Cart
                                </Link>
                                <Link
                                    to="/order-confirmation"
                                    className={`w-full sm:w-auto bg-[#d411d4] hover:bg-[#d411d4]/90 text-white font-bold py-4 px-12 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-[#d411d4]/20 text-lg tracking-wide uppercase ${cartCount === 0 ? 'pointer-events-none opacity-60' : ''}`}
                                >
                                    Continue to Payment
                                </Link>
                            </div>
                        </div>

                        <div className="lg:col-span-5 xl:col-span-4 mt-12 lg:mt-0">
                            <div className="sticky top-24 bg-[#2d152d] border border-[#482348] rounded-xl overflow-hidden shadow-2xl">
                                <div className="p-6 border-b border-[#482348] bg-white/5">
                                    <h3 className="text-lg font-bold uppercase tracking-wider">Order Summary</h3>
                                </div>
                                <div className="p-6 space-y-6 max-h-[400px] overflow-y-auto">
                                    {cartLoading ? (
                                        <div className="space-y-3">
                                            {[1, 2].map((i) => (
                                                <div key={i} className="flex gap-4 animate-pulse">
                                                    <div className="w-20 h-24 bg-gray-800 rounded-lg" />
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-4 bg-gray-700 rounded w-1/2" />
                                                        <div className="h-3 bg-gray-700 rounded w-1/3" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : items.length === 0 ? (
                                        <p className="text-sm text-[#c992c9]">Your cart is empty.</p>
                                    ) : (
                                        items.map((item) => {
                                            const attrs = item.variant_attributes || {};
                                            const colorName = attrs.color_name || attrs.color || 'Color';
                                            const sizeLabel = attrs.size || attrs.size_name || 'Size';

                                            return (
                                                <div key={item.cart_item_id} className="flex gap-4">
                                                    <div className="relative w-20 h-24 flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden border border-[#482348]">
                                                        <div
                                                            className="w-full h-full bg-cover bg-center"
                                                            style={{ backgroundImage: `url('${item.product.thumbnail}')` }}
                                                        ></div>
                                                        <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs font-bold min-w-[24px] h-6 px-1 flex items-center justify-center rounded-full shadow-md">
                                                            {item.quantity}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-1 flex-col justify-between py-1">
                                                        <div>
                                                            <h4 className="font-bold text-sm line-clamp-2">{item.product.name}</h4>
                                                            <p className="text-gray-400 text-xs mt-1">Size: {sizeLabel} / Color: {colorName}</p>
                                                        </div>
                                                        <p className="font-medium text-sm">{formatPriceVND(item.line_total)}</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                                <div className="px-6 py-4 border-t border-[#482348] bg-[#221022]/30">
                                    <div className="flex gap-2">
                                        <input
                                            className="flex-1 bg-[#221022] border border-[#482348] rounded-lg text-sm text-white placeholder-gray-500 px-3 py-2 focus:ring-1 focus:ring-[#d411d4] focus:border-[#d411d4] transition-colors"
                                            placeholder="Discount code"
                                            type="text"
                                        />
                                        <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Apply</button>
                                    </div>
                                </div>
                                <div className="p-6 border-t border-[#482348] bg-[#221022]/30 space-y-3">
                                    <div className="flex justify-between text-sm text-gray-300">
                                        <span>Subtotal</span>
                                        <span className="font-medium">{formatPriceVND(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-300">
                                        <div className="flex items-center gap-1">
                                            <span>Shipping</span>
                                            <span className="material-symbols-outlined text-gray-500 text-[16px] cursor-help">help</span>
                                        </div>
                                        <span className="font-medium">{formatPriceVND(shipping)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-300">
                                        <span>Taxes (estimated)</span>
                                        <span className="font-medium">{formatPriceVND(taxes)}</span>
                                    </div>
                                    <div className="border-t border-[#482348] my-4 pt-4 flex justify-between items-end">
                                        <span className="text-base font-bold">Total</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xs text-gray-400">VND</span>
                                            <span className="text-2xl font-bold text-[#d411d4] tracking-tight">{formatPriceVND(total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex flex-wrap justify-center gap-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                                <span className="material-symbols-outlined text-4xl text-gray-400">credit_card</span>
                                <span className="material-symbols-outlined text-4xl text-gray-400">account_balance</span>
                                <span className="material-symbols-outlined text-4xl text-gray-400">lock_clock</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="border-t border-[#482348] py-8 mt-auto bg-[#2d152d]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-500">Ac 2024 BasicColor Inc. All rights reserved.</p>
                    <div className="flex gap-6 text-xs text-gray-400">
                        <a href="#" className="hover:text-[#d411d4] transition-colors">Refund Policy</a>
                        <a href="#" className="hover:text-[#d411d4] transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-[#d411d4] transition-colors">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CheckoutPage;
