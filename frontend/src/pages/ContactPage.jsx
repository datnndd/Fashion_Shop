const ContactPage = () => {
    return (
        <div className="bg-[#221022] font-[Space_Grotesk] min-h-screen">
            {/* Main Layout Container */}
            <main className="relative min-h-screen w-full flex flex-col items-center py-12 px-6 lg:px-20 xl:px-40">
                <div className="w-full max-w-[1280px] grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                    {/* Left Column: Editorial Content */}
                    <div className="flex flex-col gap-12">
                        {/* Hero Text */}
                        <div className="flex flex-col gap-4">
                            <h1 className="text-white text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-[-0.04em] uppercase">
                                We're <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d411d4] to-[#ff00ff]">Listening.</span>
                            </h1>
                            <p className="text-[#c992c9] text-lg md:text-xl font-normal leading-relaxed max-w-[500px] mt-4 border-l-2 border-[#d411d4] pl-6">
                                Questions about fit? Order status? Need styling advice? We are here to help you define your color.
                            </p>
                        </div>

                        {/* Direct Channels (Grid) */}
                        <div className="flex flex-col gap-6 mt-4">
                            <h3 className="text-white text-xl font-bold uppercase tracking-wider mb-2">Direct Channels</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Customer Care */}
                                <div className="group flex flex-col gap-4 rounded-xl border border-[#673267] bg-[#331933] p-6 hover:border-[#d411d4] transition-colors cursor-default">
                                    <div className="h-10 w-10 rounded-full bg-[#d411d4]/20 flex items-center justify-center text-[#d411d4] group-hover:bg-[#d411d4] group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined">headset_mic</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white text-lg font-bold">Customer Care</h4>
                                        <p className="text-[#c992c9] text-sm mt-1">hello@basiccolor.com</p>
                                        <p className="text-[#c992c9] text-sm">+1 (555) 019-2834</p>
                                    </div>
                                </div>
                                {/* Press */}
                                <div className="group flex flex-col gap-4 rounded-xl border border-[#673267] bg-[#331933] p-6 hover:border-[#d411d4] transition-colors cursor-default">
                                    <div className="h-10 w-10 rounded-full bg-[#d411d4]/20 flex items-center justify-center text-[#d411d4] group-hover:bg-[#d411d4] group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined">newspaper</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white text-lg font-bold">Press & Media</h4>
                                        <p className="text-[#c992c9] text-sm mt-1">press@basiccolor.com</p>
                                        <a href="#" className="text-[#d411d4] text-sm font-medium hover:underline mt-1 block">Download Media Kit</a>
                                    </div>
                                </div>
                                {/* Wholesale (Full Width on mobile grid) */}
                                <div className="group flex flex-col gap-4 rounded-xl border border-[#673267] bg-[#331933] p-6 hover:border-[#d411d4] transition-colors cursor-default sm:col-span-2">
                                    <div className="flex items-start justify-between">
                                        <div className="h-10 w-10 rounded-full bg-[#d411d4]/20 flex items-center justify-center text-[#d411d4] group-hover:bg-[#d411d4] group-hover:text-white transition-colors">
                                            <span className="material-symbols-outlined">storefront</span>
                                        </div>
                                        <span className="text-xs font-bold text-[#c992c9] uppercase tracking-widest border border-[#673267] rounded-full px-3 py-1">Business</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white text-lg font-bold">Wholesale</h4>
                                        <p className="text-[#c992c9] text-sm mt-1 mb-2">Partner with us to bring BasicColor to your city.</p>
                                        <a href="#" className="text-white text-sm font-medium border-b border-[#d411d4] hover:text-[#d411d4] transition-colors pb-0.5">Apply for an account</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="flex flex-col justify-center">
                        <div className="bg-[#331933] border border-[#673267] rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden group/form">
                            {/* Abstract Background decoration */}
                            <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#d411d4]/10 rounded-full blur-3xl pointer-events-none group-hover/form:bg-[#d411d4]/20 transition-all duration-700"></div>
                            <h2 className="text-white text-2xl font-bold mb-8 relative z-10">Send a Message</h2>
                            <form className="flex flex-col gap-6 relative z-10">
                                {/* Name & Email Row */}
                                <div className="flex flex-col md:flex-row gap-6">
                                    <label className="flex flex-col flex-1">
                                        <span className="text-white text-sm font-medium pb-2">Name</span>
                                        <input
                                            className="w-full rounded-lg border border-[#673267] bg-[#221022]/50 text-white focus:border-[#d411d4] focus:ring-1 focus:ring-[#d411d4] h-12 px-4 placeholder:text-[#c992c9]/50 transition-all"
                                            placeholder="Your Name"
                                            type="text"
                                        />
                                    </label>
                                    <label className="flex flex-col flex-1">
                                        <span className="text-white text-sm font-medium pb-2">Email</span>
                                        <input
                                            className="w-full rounded-lg border border-[#673267] bg-[#221022]/50 text-white focus:border-[#d411d4] focus:ring-1 focus:ring-[#d411d4] h-12 px-4 placeholder:text-[#c992c9]/50 transition-all"
                                            placeholder="email@example.com"
                                            type="email"
                                        />
                                    </label>
                                </div>
                                {/* Topic */}
                                <label className="flex flex-col w-full">
                                    <span className="text-white text-sm font-medium pb-2">Topic</span>
                                    <div className="relative">
                                        <select className="w-full rounded-lg border border-[#673267] bg-[#221022]/50 text-white focus:border-[#d411d4] focus:ring-1 focus:ring-[#d411d4] h-12 px-4 transition-all appearance-none cursor-pointer">
                                            <option disabled selected value="">Select a topic</option>
                                            <option value="returns">Returns & Exchanges</option>
                                            <option value="shipping">Shipping Status</option>
                                            <option value="product">Product Information</option>
                                            <option value="other">Other Inquiry</option>
                                        </select>
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d411d4] pointer-events-none material-symbols-outlined text-[24px]">expand_more</span>
                                    </div>
                                </label>
                                {/* Message */}
                                <label className="flex flex-col w-full">
                                    <span className="text-white text-sm font-medium pb-2">Message</span>
                                    <textarea
                                        className="w-full rounded-lg border border-[#673267] bg-[#221022]/50 text-white focus:border-[#d411d4] focus:ring-1 focus:ring-[#d411d4] p-4 h-32 resize-none placeholder:text-[#c992c9]/50 transition-all"
                                        placeholder="How can we help?"
                                    ></textarea>
                                </label>
                                {/* Submit Button */}
                                <button
                                    className="mt-2 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 bg-[#d411d4] hover:bg-[#a00da0] text-white text-base font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(212,17,212,0.3)] hover:shadow-[0_0_30px_rgba(212,17,212,0.5)]"
                                    type="button"
                                >
                                    SEND MESSAGE
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* FAQ Quick Links */}
                <div className="w-full max-w-[1280px] mt-24 border-t border-[#673267] pt-12">
                    <h3 className="text-white text-2xl font-bold mb-8">Frequently Asked</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <a href="#" className="group flex items-center justify-between p-6 rounded-lg border border-[#673267] bg-[#331933] hover:bg-[#673267] transition-all">
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-lg group-hover:text-[#d411d4] transition-colors">Shipping Policy</span>
                                <span className="text-[#c992c9] text-sm mt-1">Delivery times & costs</span>
                            </div>
                            <span className="material-symbols-outlined text-white group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </a>
                        <a href="#" className="group flex items-center justify-between p-6 rounded-lg border border-[#673267] bg-[#331933] hover:bg-[#673267] transition-all">
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-lg group-hover:text-[#d411d4] transition-colors">Returns</span>
                                <span className="text-[#c992c9] text-sm mt-1">30-day return window</span>
                            </div>
                            <span className="material-symbols-outlined text-white group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </a>
                        <a href="#" className="group flex items-center justify-between p-6 rounded-lg border border-[#673267] bg-[#331933] hover:bg-[#673267] transition-all">
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-lg group-hover:text-[#d411d4] transition-colors">Size Guide</span>
                                <span className="text-[#c992c9] text-sm mt-1">Find your perfect fit</span>
                            </div>
                            <span className="material-symbols-outlined text-white group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </a>
                    </div>
                </div>
            </main>

            {/* Floating Action Button */}
            <button className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#d411d4] text-white rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.4)] hover:scale-110 hover:shadow-[0_6px_20px_rgba(212,17,212,0.4)] transition-all">
                <span className="material-symbols-outlined text-[28px]">chat_bubble</span>
            </button>
        </div>
    );
};

export default ContactPage;
