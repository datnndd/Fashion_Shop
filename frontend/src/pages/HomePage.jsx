import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatPriceVND } from '../utils/currency';
import { categoriesAPI, productsAPI } from '../services/api';

const HomePage = () => {
    const [categories, setCategories] = useState([]);
    const [trendingProducts, setTrendingProducts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesData, productsData] = await Promise.all([
                    categoriesAPI.list(true),
                    productsAPI.list({ limit: 5, sort_by: 'newest' })
                ]);
                setCategories(categoriesData);
                setTrendingProducts(productsData);
            } catch (error) {
                console.error('Failed to fetch homepage data:', error);
            }
        };
        fetchData();
    }, []);
    return (
        <main className="flex-grow flex flex-col">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 px-4 flex flex-col items-center justify-center text-center overflow-hidden">
                {/* Decorative Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d411d4]/20 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-6 items-center">
                    <h2 className="text-[#d411d4] font-bold tracking-wider text-sm uppercase animate-pulse">New Arrivals</h2>
                    <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tighter text-white">
                        WEAR THE<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d411d4] via-purple-400 to-blue-500">SPECTRUM</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-lg mx-auto font-sans leading-relaxed">
                        Defy the grey. Experience fashion driven by pure, unadulterated color.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <Link to="/" className="bg-[#d411d4] hover:bg-[#d411d4]/90 text-white px-8 py-4 rounded-lg font-bold text-lg tracking-wide transition-all transform hover:scale-105 flex items-center gap-2">
                            Explore Now
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                        <button className="bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-bold text-lg tracking-wide transition-all">
                            View Lookbook
                        </button>
                    </div>
                </div>
            </section>

            {/* Color Navigation Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h3 className="text-3xl font-bold mb-2 text-white">Shop by Category</h3>
                        <p className="text-gray-400 font-sans">Select your vibe.</p>
                    </div>
                    {/* View All Details Removed */}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category, index) => (
                        <div
                            key={category.category_id}
                            className="group relative aspect-[4/5] sm:aspect-square lg:aspect-[4/3] overflow-hidden rounded-xl cursor-default bg-white/5 border border-white/10"
                        >
                            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                <span className="text-white/80 text-sm font-bold mb-1 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    0{index + 1}
                                </span>
                                <h4 className={`text-3xl font-bold text-white leading-none`}>
                                    {category.name}
                                </h4>
                                <p className={`text-white/60 text-sm mt-2 max-h-0 overflow-hidden group-hover:max-h-20 transition-all duration-500 ease-out`}>
                                    {category.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Carousel Section */}
            <section className="w-full py-16 bg-black/20 backdrop-blur-sm border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold text-white">Trending in the Spectrum</h3>
                        <div className="flex gap-2">
                            <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                                <span className="material-symbols-outlined text-white">arrow_back</span>
                            </button>
                            <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                                <span className="material-symbols-outlined text-white">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                    <div className="flex overflow-x-auto scrollbar-hide gap-6 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                        {trendingProducts.map((item) => (
                            <Link to={`/product/${item.product_id}`} key={item.product_id} className="flex-none w-64 group cursor-pointer">
                                <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden mb-4">
                                    <div className="absolute inset-0 bg-gray-800 animate-pulse"></div>
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{ backgroundImage: `url('${item.thumbnail}')` }}
                                    ></div>
                                    {item.is_new && (
                                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded">
                                            NEW
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-white font-bold text-lg leading-tight group-hover:text-[#d411d4] transition-colors">
                                    {item.name}
                                </h4>
                                <p className="text-gray-400 font-sans text-sm mt-1">{formatPriceVND(item.base_price)}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter / Footer Teaser */}
            <section className="max-w-4xl mx-auto px-4 py-24 text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Never miss a shade.</h2>
                <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                    Join the chromatic revolution. Get early access to new color drops and exclusive gradients.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                        className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#d411d4] focus:ring-1 focus:ring-[#d411d4] transition-all"
                        placeholder="Enter your email"
                        type="email"
                    />
                    <button className="bg-[#d411d4] hover:bg-[#d411d4]/90 text-white font-bold px-6 py-3 rounded-lg transition-colors">
                        Subscribe
                    </button>
                </div>
            </section>

            {/* FAB: Shop All */}
            <div className="fixed bottom-6 right-6 z-40">
                <Link
                    to="/"
                    className="flex items-center gap-3 bg-[#d411d4] hover:bg-[#b00eb0] text-white px-6 py-4 rounded-full shadow-[0_0_30px_rgba(212,17,212,0.4)] transition-all hover:scale-105 active:scale-95"
                >
                    <span className="material-symbols-outlined">shopping_bag</span>
                    <span className="font-bold tracking-wide">Shop All</span>
                </Link>
            </div>
        </main>
    );
};

export default HomePage;
