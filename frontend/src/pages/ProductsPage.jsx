import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../services/api';
import { formatPriceVND } from '../utils/currency';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest'); // newest, price_asc, price_desc, name_asc

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    productsAPI.list({ limit: 100 }), // Fetching all for client-side filtering as API might be limited
                    categoriesAPI.list(true)
                ]);
                setProducts(productsData);
                setCategories(categoriesData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter and Sort Logic
    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                (p.description && p.description.toLowerCase().includes(query))
            );
        }

        // Category
        if (selectedCategory !== 'all') {
            result = result.filter(p => p.category_id === parseInt(selectedCategory));
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'price_asc':
                    return a.base_price - b.base_price;
                case 'price_desc':
                    return b.base_price - a.base_price;
                case 'name_asc':
                    return a.name.localeCompare(b.name);
                case 'newest':
                default:
                    // Assuming higher ID means newer if no date field, or created_at if available. 
                    // Using ID fallback for now as common proxy.
                    return b.product_id - a.product_id;
            }
        });

        return result;
    }, [products, searchQuery, selectedCategory, sortBy]);

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="text-[#d411d4] animate-pulse">Loading collection...</div>
            </div>
        );
    }

    return (
        <main className="flex-grow pt-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-20">
            {/* Header Section */}
            <div className="flex flex-col gap-4 mb-12">
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase">
                    The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d411d4] to-blue-600">Archive</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-xl">
                    Curated for the bold. Filter by your vibe, sort by your priority.
                </p>
            </div>

            {/* Controls Bar */}
            <div className="sticky top-20 z-30 bg-[#1F1B18]/95 backdrop-blur-xl border-y border-white/10 py-4 mb-10 -mx-4 px-4 sm:px-0 sm:mx-0 sm:rounded-2xl transition-all">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">

                    {/* Search */}
                    <div className="relative w-full md:max-w-xs group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#d411d4] transition-colors">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-white outline-none focus:border-[#d411d4] focus:ring-1 focus:ring-[#d411d4] transition-all"
                        />
                    </div>

                    {/* Filters & Sort */}
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">

                        {/* Categories */}
                        <div className="flex overflow-x-auto pb-1 md:pb-0 gap-2 scrollbar-hide">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${selectedCategory === 'all'
                                        ? 'bg-[#d411d4] text-white shadow-[0_0_15px_rgba(212,17,212,0.4)]'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                All
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.category_id}
                                    onClick={() => setSelectedCategory(cat.category_id)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${selectedCategory === cat.category_id
                                            ? 'bg-[#d411d4] text-white shadow-[0_0_15px_rgba(212,17,212,0.4)]'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        <div className="h-6 w-px bg-white/10 hidden md:block"></div>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-[#1F1B18] text-white text-sm font-bold border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[#d411d4] cursor-pointer hover:bg-white/5 transition-colors"
                        >
                            <option value="newest">✨ Newest</option>
                            <option value="price_asc">💰 Price: Low to High</option>
                            <option value="price_desc">💎 Price: High to Low</option>
                            <option value="name_asc">🔤 Name: A-Z</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
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
                                    <span className="text-xs font-mono">NO IMAGE</span>
                                </div>
                            )}

                            {/* Overlay Gradient */}
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                            {/* Badges */}
                            <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                                {product.is_new && (
                                    <span className="bg-[#d411d4] text-white text-[10px] font-black tracking-widest px-2 py-1 rounded-sm shadow-lg">
                                        NEW
                                    </span>
                                )}
                                {product.is_sale && (
                                    <span className="bg-orange-500 text-white text-[10px] font-black tracking-widest px-2 py-1 rounded-sm shadow-lg">
                                        SALE
                                    </span>
                                )}
                            </div>

                            {/* Quick Add Button (Hover) */}
                            <div className="absolute bottom-4 right-4 translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <button className="bg-white text-black p-3 rounded-full hover:bg-[#d411d4] hover:text-white transition-colors shadow-lg">
                                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                                </button>
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
                                {/* Category Label if needed, or other meta */}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">search_off</span>
                    <h3 className="text-2xl font-bold text-gray-300">Nothing here yet.</h3>
                    <p className="text-gray-500 max-w-sm mt-2">
                        We couldn't find any products matching your filters. Try clearing them to see everything.
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('all');
                            setSortBy('newest');
                        }}
                        className="mt-6 text-[#d411d4] font-bold hover:underline"
                    >
                        Clear all filters
                    </button>
                </div>
            )}
        </main>
    );
};

export default ProductsPage;
