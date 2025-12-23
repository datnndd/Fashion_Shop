import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatPriceVND } from '../utils/currency';
import { categoriesAPI, productsAPI } from '../services/api';

const HomePage = () => {
    const [categories, setCategories] = useState([]);
    const [newProducts, setNewProducts] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel fetch
                const [categoriesData, newData, bestData] = await Promise.all([
                    categoriesAPI.list(true),
                    productsAPI.list({ is_new: true, limit: 4 }),
                    productsAPI.list({ sort_by: 'best_selling', limit: 4 })
                ]);

                setCategories(categoriesData);
                setNewProducts(newData);
                setBestSellers(bestData);
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

            {/* Shop by Gender Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex flex-col gap-24">
                {categories
                    .filter(cat => !cat.parent_id) // Get only parents (Genders)
                    .map((parentCategory, index) => {
                        const childCategories = categories.filter(c => c.parent_id === parentCategory.category_id);

                        return (
                            <div key={parentCategory.category_id} className="w-full">
                                <div className={`flex flex-col md:flex-row gap-8 items-center mb-8 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                                    <div className="flex-1">
                                        <h3 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4">
                                            {parentCategory.name}
                                        </h3>
                                        <p className="text-white/60 text-lg max-w-md">
                                            {parentCategory.description || `Explore our latest collection for ${parentCategory.name}.`}
                                        </p>
                                    </div>
                                    {parentCategory.image && (
                                        <div className="w-full md:w-1/3 aspect-video rounded-2xl overflow-hidden relative">
                                            <div
                                                className="absolute inset-0 bg-cover bg-center"
                                                style={{ backgroundImage: `url('${parentCategory.image}')` }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                        </div>
                                    )}
                                </div>

                                {/* Child Categories Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {childCategories.map((child) => (
                                        <Link
                                            to={`/products?category_id=${child.category_id}`}
                                            key={child.category_id}
                                            className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-white/5 border border-white/10 hover:border-[#d411d4]/50 transition-all"
                                        >
                                            {child.image ? (
                                                <div
                                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                                    style={{ backgroundImage: `url('${child.image}')` }}
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                                                    <span className="material-symbols-outlined text-4xl text-white/20">checkroom</span>
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4">
                                                <h5 className="text-white font-bold text-lg leading-tight group-hover:text-[#d411d4] transition-colors">
                                                    {child.name}
                                                </h5>
                                                {child.description && (
                                                    <p className="text-white/50 text-xs mt-1 line-clamp-2">
                                                        {child.description}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
            </section>

            {/* New Arrivals Section */}
            {newProducts.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                                Fresh Drops
                            </h2>
                            <p className="text-gray-400 mt-2">Just landed. Straight from the source.</p>
                        </div>
                        <Link to="/products?is_new=true" className="text-[#d411d4] font-bold hover:underline">
                            View All
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {newProducts.map((product) => (
                            <Link
                                key={product.product_id}
                                to={`/product/${product.product_id}`}
                                className="group flex flex-col gap-3"
                            >
                                <div className="relative w-full aspect-[3/4] bg-[#2A2422] rounded-2xl overflow-hidden border border-white/5 shadow-2xl transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(212,17,212,0.15)] group-hover:-translate-y-1">
                                    {product.thumbnail ? (
                                        <img
                                            src={product.thumbnail}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 text-white/20 gap-2">
                                            <span className="material-symbols-outlined text-4xl">image</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                                    <div className="absolute top-3 right-3">
                                        <span className="bg-[#d411d4] text-white text-[10px] font-black tracking-widest px-2 py-1 rounded-sm shadow-lg">
                                            NEW
                                        </span>
                                    </div>
                                </div>
                                <div className="px-1">
                                    <h3 className="text-lg font-bold text-white group-hover:text-[#d411d4] transition-colors leading-tight">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-gray-400 font-sans text-sm">
                                            {formatPriceVND(product.base_price)}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Best Sellers Section */}
            {bestSellers.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                                Best Sellers
                            </h2>
                            <p className="text-gray-400 mt-2">The crowd favorites. Don't miss out.</p>
                        </div>
                        <Link to="/products?sort_by=best_selling" className="text-[#d411d4] font-bold hover:underline">
                            View All
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {bestSellers.map((product) => (
                            <Link
                                key={product.product_id}
                                to={`/product/${product.product_id}`}
                                className="group flex flex-col gap-3"
                            >
                                <div className="relative w-full aspect-[3/4] bg-[#2A2422] rounded-2xl overflow-hidden border border-white/5 shadow-2xl transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(212,17,212,0.15)] group-hover:-translate-y-1">
                                    {product.thumbnail ? (
                                        <img
                                            src={product.thumbnail}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 text-white/20 gap-2">
                                            <span className="material-symbols-outlined text-4xl">image</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                                    <div className="absolute top-3 right-3">
                                        <span className="bg-orange-500 text-white text-[10px] font-black tracking-widest px-2 py-1 rounded-sm shadow-lg">
                                            HOT
                                        </span>
                                    </div>
                                </div>
                                <div className="px-1">
                                    <h3 className="text-lg font-bold text-white group-hover:text-[#d411d4] transition-colors leading-tight">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-gray-400 font-sans text-sm">
                                            {formatPriceVND(product.base_price)}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}



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

        </main>
    );
};

export default HomePage;
