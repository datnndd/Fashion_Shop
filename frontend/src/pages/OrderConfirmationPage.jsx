import { Link } from 'react-router-dom';

const OrderConfirmationPage = () => {
    return (
        <div className="bg-[#221022] font-[Space_Grotesk] text-white min-h-screen flex flex-col">
            <main className="flex-grow">
                <div className="flex flex-col items-center py-8 md:py-12 px-4 md:px-8">
                    <div className="w-full max-w-[1024px] space-y-12">
                        {/* Hero / Confirmation Status */}
                        <div className="relative overflow-hidden rounded-2xl bg-[#2d152d] border border-[#482348] p-8 md:p-12 text-center">
                            <div
                                className="absolute inset-0 opacity-20 pointer-events-none bg-cover bg-center"
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBbJTmxmtplkLn76Z2Sxlq2nnahwOlOHQE-p9X0OuaDORv59IUqC9qOrnnL4QYbuy2CFYyCiMORcGhOlZ1puhXfR0tFyVElE0gwmI2DEr69E9GCoqTKEXO2FNsb4_DI64_aTv8tAmQ0YNiZ3bX9oBRRT0q2QvqqvPoImdIb4HEElWOx9wLUqpOlh4-g1B0E5i_MtYnTN8wMe8CE5fjc8LfUqE5NIK7ZyIZzO7_uv5T99POOW4Nn2xTmKrS7PXoCuzoLSzAGicy_KNA')" }}
                            ></div>
                            <div className="relative z-10 flex flex-col items-center gap-6">
                                <div className="rounded-full bg-[#d411d4]/20 p-4 ring-1 ring-[#d411d4]/50">
                                    <span className="material-symbols-outlined text-5xl text-[#d411d4]">check_circle</span>
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">Order Confirmed</h1>
                                    <p className="text-gray-300 max-w-lg mx-auto text-lg">
                                        Thank you for adding color to your life, Alex. Your order <span className="text-[#d411d4] font-bold">#BC-9240</span> has been received.
                                    </p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-4 mt-4">
                                    <Link
                                        to="/collections"
                                        className="bg-[#d411d4] hover:bg-[#d411d4]/90 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-[#d411d4]/25 transition-all flex items-center gap-2"
                                    >
                                        <span>Continue Shopping</span>
                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </Link>
                                    <button className="bg-transparent hover:bg-white/5 text-white border border-[#482348] font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">download</span>
                                        <span>Download Receipt</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="w-full overflow-x-auto pb-4">
                            <div className="min-w-[600px] grid grid-cols-[auto_1fr_auto_1fr_auto_1fr_auto] gap-x-4 items-center px-4">
                                {/* Step 1 */}
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-[#d411d4] flex items-center justify-center text-white shadow-lg shadow-[#d411d4]/40">
                                        <span className="material-symbols-outlined text-xl">check</span>
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#d411d4]">Ordered</span>
                                </div>
                                <div className="h-[2px] w-full bg-[#d411d4]"></div>
                                {/* Step 2 */}
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-[#2d152d] border-2 border-[#d411d4] flex items-center justify-center text-[#d411d4] shadow-[0_0_15px_rgba(212,17,212,0.3)] animate-pulse">
                                        <span className="material-symbols-outlined text-xl">inventory_2</span>
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider">Processing</span>
                                </div>
                                <div className="h-[2px] w-full bg-[#482348]"></div>
                                {/* Step 3 */}
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-[#2d152d] border border-[#482348] flex items-center justify-center text-gray-500">
                                        <span className="material-symbols-outlined text-xl">local_shipping</span>
                                    </div>
                                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Shipped</span>
                                </div>
                                <div className="h-[2px] w-full bg-[#482348]"></div>
                                {/* Step 4 */}
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-[#2d152d] border border-[#482348] flex items-center justify-center text-gray-500">
                                        <span className="material-symbols-outlined text-xl">home</span>
                                    </div>
                                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Delivered</span>
                                </div>
                            </div>
                        </div>

                        {/* Layout Grid: Left (Info) & Right (Summary) */}
                        <div className="grid lg:grid-cols-12 gap-8 items-start">
                            {/* Left Column: Shipping & Payment */}
                            <div className="lg:col-span-4 space-y-6">
                                {/* Shipping Info */}
                                <div className="rounded-xl bg-[#2d152d] border border-[#482348] p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="material-symbols-outlined text-[#d411d4]">local_shipping</span>
                                        <h3 className="font-bold text-lg">Shipping Details</h3>
                                    </div>
                                    <div className="space-y-4 text-sm text-gray-300">
                                        <div>
                                            <p className="font-semibold text-white mb-1">Delivery Address</p>
                                            <p>Alex Doe</p>
                                            <p>123 Fashion Avenue, Apt 4B</p>
                                            <p>New York, NY 10001</p>
                                        </div>
                                        <div className="pt-4 border-t border-[#482348]">
                                            <p className="font-semibold text-white mb-1">Estimated Delivery</p>
                                            <p className="text-[#d411d4] font-medium">Oct 24 - Oct 26</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Payment Info */}
                                <div className="rounded-xl bg-[#2d152d] border border-[#482348] p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="material-symbols-outlined text-[#d411d4]">credit_card</span>
                                        <h3 className="font-bold text-lg">Payment Method</h3>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-300">
                                        <div className="h-8 w-12 bg-white rounded flex items-center justify-center">
                                            <div className="w-6 h-4 bg-red-500/80 rounded-sm"></div>
                                            <div className="w-6 h-4 bg-yellow-500/80 rounded-sm -ml-3"></div>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">Mastercard ending in 8832</p>
                                            <p>Exp 09/28</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Need Help */}
                                <div className="rounded-xl bg-[#d411d4]/10 border border-[#d411d4]/20 p-6 text-center">
                                    <h4 className="text-white font-bold mb-2">Need help with your order?</h4>
                                    <Link
                                        to="/contact"
                                        className="text-[#d411d4] hover:text-white text-sm font-medium underline decoration-[#d411d4] transition-colors"
                                    >
                                        Contact Support
                                    </Link>
                                </div>
                            </div>

                            {/* Right Column: Order Summary */}
                            <div className="lg:col-span-8">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined">shopping_bag</span>
                                    Order Summary
                                </h2>
                                <div className="rounded-xl bg-[#2d152d] border border-[#482348] overflow-hidden">
                                    {/* Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-gray-300">
                                            <thead className="bg-[#331933] text-white font-medium uppercase tracking-wider text-xs">
                                                <tr>
                                                    <th className="px-6 py-4">Product</th>
                                                    <th className="px-6 py-4">Color</th>
                                                    <th className="px-6 py-4 text-center">Size</th>
                                                    <th className="px-6 py-4 text-center">Qty</th>
                                                    <th className="px-6 py-4 text-right">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#482348]">
                                                <tr className="group hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div
                                                                className="h-16 w-16 flex-shrink-0 rounded-lg bg-cover bg-center border border-[#482348]"
                                                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDGV6GRZwemExZGX2ZxY20As_-7oSDkyWWwSmiqMW_CPgvRoA3WDkJHL61GFvKEGUeU5qLzEWF__7Gcih8EnJbu61tdcnKgVXvHGk5LSYo6QyU_EaNj2uDqfaYM6MuyStLXBpLTBPmA2mosCn54vfR8492arZDJz_xnLGCqJ0eunXtbzykwPINAV73xgpnmoyvZU69rUPbrxYaTzgjwe825lbWwZX4y6ELMggh0rB0bz6SUuIvrob6nJDaARB--gzXioPMOh7Uh_S8')" }}
                                                            ></div>
                                                            <div>
                                                                <p className="font-bold text-white">Oversized Tee</p>
                                                                <p className="text-xs text-gray-400 mt-1">Ref: BC-001</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="h-4 w-4 rounded-full bg-[#39ff14] ring-1 ring-white/20"></span>
                                                            <span className="text-white">Neon Green</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-medium">L</td>
                                                    <td className="px-6 py-4 text-center">1</td>
                                                    <td className="px-6 py-4 text-right font-medium text-white">$45.00</td>
                                                </tr>
                                                <tr className="group hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div
                                                                className="h-16 w-16 flex-shrink-0 rounded-lg bg-cover bg-center border border-[#482348]"
                                                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBuMFUnC4T5cWka9lpFGbagtZ_I2Gr2LUfCukMY74v0CTZ8CC3X13YfvAb-jKW6KwP-CroKtqosZO60HmpWFdJjmmb0VEZUdp-_34c352Yq7w8lAepmaCjzNi3PpC8n5yzJwWyakXR65mGOVFv5kWCEBvZ02-Bb6CKA7FwcsK1iJvMDyjIuAjvsXT6yZV2UF1yGdLMLWdlxxLmIRRQ5P0Y-4-JUZMQgq6gp0Uy07-LUbNyC2iq4GjB5RAslciSC3oTrzCNqxmGEpQE')" }}
                                                            ></div>
                                                            <div>
                                                                <p className="font-bold text-white">Cargo Pants</p>
                                                                <p className="text-xs text-gray-400 mt-1">Ref: BC-024</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="h-4 w-4 rounded-full bg-[#4B0082] ring-1 ring-white/20"></span>
                                                            <span className="text-white">Deep Purple</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-medium">32</td>
                                                    <td className="px-6 py-4 text-center">1</td>
                                                    <td className="px-6 py-4 text-right font-medium text-white">$85.00</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Cost Breakdown */}
                                    <div className="bg-[#2a132a] border-t border-[#482348] p-6 space-y-3">
                                        <div className="flex justify-between text-gray-300">
                                            <span>Subtotal</span>
                                            <span className="font-medium">$130.00</span>
                                        </div>
                                        <div className="flex justify-between text-gray-300">
                                            <span>Shipping (Standard)</span>
                                            <span className="font-medium">$12.00</span>
                                        </div>
                                        <div className="flex justify-between text-gray-300">
                                            <span>Taxes</span>
                                            <span className="font-medium">$10.40</span>
                                        </div>
                                        <div className="h-px bg-[#482348] my-2"></div>
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span className="text-[#d411d4]">$152.40</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-[#482348] bg-[#221022] py-12 px-6">
                <div className="max-w-[1024px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#d411d4]">palette</span>
                        <span className="font-bold tracking-tight">BasicColor</span>
                    </div>
                    <div className="flex gap-8 text-sm text-gray-400">
                        <a href="#" className="hover:text-[#d411d4] transition-colors">Return Policy</a>
                        <a href="#" className="hover:text-[#d411d4] transition-colors">FAQ</a>
                        <a href="#" className="hover:text-[#d411d4] transition-colors">Privacy</a>
                        <a href="#" className="hover:text-[#d411d4] transition-colors">Terms</a>
                    </div>
                    <div className="text-sm text-gray-500">© 2024 BasicColor Inc.</div>
                </div>
            </footer>
        </div>
    );
};

export default OrderConfirmationPage;
