import { Link } from 'react-router-dom';
import { formatPriceVND } from '../utils/currency';

const CheckoutPage = () => {
    return (
        <div className="bg-[#221022] font-[Space_Grotesk] text-white min-h-screen flex flex-col">
            {/* Header */}
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

            {/* Main Content Layout */}
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-6 py-8 lg:py-12">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-20">
                        {/* Left Column: Checkout Form */}
                        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-10">
                            {/* Breadcrumbs / Stepper */}
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

                            {/* Step 1: Contact Information */}
                            <section className="space-y-6">
                                <div className="flex justify-between items-end border-b border-[#482348] pb-4">
                                    <h2 className="text-2xl font-bold uppercase tracking-tight">Contact Info</h2>
                                    <div className="text-sm text-[#d411d4] cursor-pointer hover:underline">Log in for faster checkout</div>
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

                            {/* Step 2: Shipping Address */}
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

                            {/* Step 3: Shipping Method */}
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

                            {/* Navigation Actions */}
                            <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-4 mt-8 pt-6 border-t border-[#482348]">
                                <Link to="/cart" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium py-3">
                                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                                    Return to Cart
                                </Link>
                                <Link
                                    to="/order-confirmation"
                                    className="w-full sm:w-auto bg-[#d411d4] hover:bg-[#d411d4]/90 text-white font-bold py-4 px-12 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-[#d411d4]/20 text-lg tracking-wide uppercase"
                                >
                                    Continue to Payment
                                </Link>
                            </div>
                        </div>

                        {/* Right Column: Order Summary (Sticky) */}
                        <div className="lg:col-span-5 xl:col-span-4 mt-12 lg:mt-0">
                            <div className="sticky top-24 bg-[#2d152d] border border-[#482348] rounded-xl overflow-hidden shadow-2xl">
                                {/* Header */}
                                <div className="p-6 border-b border-[#482348] bg-white/5">
                                    <h3 className="text-lg font-bold uppercase tracking-wider">Order Summary</h3>
                                </div>
                                {/* Product List */}
                                <div className="p-6 space-y-6 max-h-[400px] overflow-y-auto">
                                    {/* Item 1 */}
                                    <div className="flex gap-4">
                                        <div className="relative w-20 h-24 flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden border border-[#482348]">
                                            <div
                                                className="w-full h-full bg-cover bg-center"
                                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAnIS6E3tLSIw8847w_D0nnngEkdjxH_XSngAoAKXfUPjPQ_RVZ_g2a-SSsVl7soCdCHUuTXqAnT4tLzvLAUHfI1gH525M2_RTyI8uYmpLO8YMKGmn4Ul0JM6RTqwKc9FPSK1_KJGWIMJk-e4ip-pfYH0hscKrl1_MHCQS1JeB16uFC-trnUnVJHf68XOssJt5HA66iFezSQXXRv_8ZnbfrUAO0rjo8LL4B9bGnrjs83YtypT3l00W6DdPVdyaaLxwpN9zyEFEc-Ls')" }}
                                            ></div>
                                            <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">1</span>
                                        </div>
                                        <div className="flex flex-1 flex-col justify-between py-1">
                                            <div>
                                                <h4 className="font-bold text-sm">Oversized Noir Hoodie</h4>
                                                <p className="text-gray-400 text-xs mt-1">Size: M / Color: Black</p>
                                            </div>
                                            <p className="font-medium text-sm">{formatPriceVND(3125000)}</p>
                                        </div>
                                    </div>
                                    {/* Item 2 */}
                                    <div className="flex gap-4">
                                        <div className="relative w-20 h-24 flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden border border-[#482348]">
                                            <div
                                                className="w-full h-full bg-cover bg-center"
                                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD0sBCkKjdapvYUGvUOvX3f2wrEM748ER5UJr-GMXs35xRSufnwgUhApxqVQhzCdbJBL6QiaX9L566W1pKSLZeqfmP-k-Kx-IOTZse1qSf-lEAszwSAstsQ1SEUTkTVCHrgl5-K9RmlApYpfVOvPvQeQJcDsKpSt-YVN0Ol748FXsZnEzEYsFedWVaxedUQzR6XGwDG3Evwou4ewZJ0jHXehAJtf9cVJ9fL60oRu-jtlXV5ZoHWyddK122Qm7-DCzNPNFxwbMohhFQ')" }}
                                            ></div>
                                            <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">2</span>
                                        </div>
                                        <div className="flex flex-1 flex-col justify-between py-1">
                                            <div>
                                                <h4 className="font-bold text-sm">Neon Basic Tee</h4>
                                                <p className="text-gray-400 text-xs mt-1">Size: L / Color: Hot Pink</p>
                                            </div>
                                            <p className="font-medium text-sm">{formatPriceVND(1125000)}</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Discount Code */}
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
                                {/* Totals */}
                                <div className="p-6 border-t border-[#482348] bg-[#221022]/30 space-y-3">
                                    <div className="flex justify-between text-sm text-gray-300">
                                        <span>Subtotal</span>
                                        <span className="font-medium">{formatPriceVND(4250000)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-300">
                                        <div className="flex items-center gap-1">
                                            <span>Shipping</span>
                                            <span className="material-symbols-outlined text-gray-500 text-[16px] cursor-help">help</span>
                                        </div>
                                        <span className="font-medium">{formatPriceVND(125000)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-300">
                                        <span>Taxes (estimated)</span>
                                        <span className="font-medium">{formatPriceVND(350000)}</span>
                                    </div>
                                    <div className="border-t border-[#482348] my-4 pt-4 flex justify-between items-end">
                                        <span className="text-base font-bold">Total</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xs text-gray-400">VND</span>
                                            <span className="text-2xl font-bold text-[#d411d4] tracking-tight">{formatPriceVND(4725000)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Trust Signals */}
                            <div className="mt-6 flex flex-wrap justify-center gap-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                                <span className="material-symbols-outlined text-4xl text-gray-400">credit_card</span>
                                <span className="material-symbols-outlined text-4xl text-gray-400">account_balance</span>
                                <span className="material-symbols-outlined text-4xl text-gray-400">lock_clock</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-[#482348] py-8 mt-auto bg-[#2d152d]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-500">© 2024 BasicColor Inc. All rights reserved.</p>
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
