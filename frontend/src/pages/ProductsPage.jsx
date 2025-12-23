import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../services/api';
import { formatPriceVND } from '../utils/currency';

const buildCategoryTree = (items = []) => {
    const map = {};
    items.forEach((item) => {
        map[item.category_id] = { ...item, children: [] };
    });

    const roots = [];
    items.forEach((item) => {
        if (item.parent_id && map[item.parent_id]) {
            map[item.parent_id].children.push(map[item.category_id]);
        } else {
            roots.push(map[item.category_id]);
        }
    });

    return roots;
};

const ProductsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState(new Set());

    // Filters State initialized from URL
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category_id') || 'all');
    const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'newest');
    const [isSaleFilter, setIsSaleFilter] = useState(searchParams.get('is_sale') === 'true');
    const [isNewFilter, setIsNewFilter] = useState(searchParams.get('is_new') === 'true');
    const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');

    // Price Filter Dropdown State
    const [isPriceOpen, setIsPriceOpen] = useState(false);
    const priceRef = useRef(null);

    // Pagination State
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
    const limit = 12;
    const [hasMore, setHasMore] = useState(true);

    // Debounce Search
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

    const categoryFilterIds = useMemo(() => {
        if (selectedCategory === 'all') return null;
        return [selectedCategory.toString()];
    }, [selectedCategory]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Close price dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (priceRef.current && !priceRef.current.contains(event.target)) {
                setIsPriceOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [priceRef]);


    // Update URL when filters change
    useEffect(() => {
        const params = {};
        if (debouncedSearch) params.q = debouncedSearch;
        if (categoryFilterIds?.length === 1) params.category_id = categoryFilterIds[0];
        if (sortBy !== 'newest') params.sort_by = sortBy;
        if (isSaleFilter) params.is_sale = 'true';
        if (isNewFilter) params.is_new = 'true';
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        if (page > 1) params.page = page.toString();
        setSearchParams(params);
    }, [debouncedSearch, selectedCategory, categoryFilterIds, sortBy, isSaleFilter, isNewFilter, minPrice, maxPrice, page, setSearchParams]);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (categories.length === 0) {
                    const cats = await categoriesAPI.list(true);
                    setCategories(buildCategoryTree(cats));
                }

                const params = {
                    limit,
                    offset: (page - 1) * limit,
                    sortBy,
                    q: debouncedSearch,
                };

                if (categoryFilterIds?.length === 1) params.categoryId = categoryFilterIds[0];
                if (isSaleFilter) params.isSale = true;
                if (isNewFilter) params.isNew = true;
                if (minPrice) params.minPrice = parseInt(minPrice, 10);
                if (maxPrice) params.maxPrice = parseInt(maxPrice, 10);

                const data = await productsAPI.list(params);
                setProducts(data);
                setHasMore(data.length === limit);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [page, sortBy, selectedCategory, categoryFilterIds, debouncedSearch, isSaleFilter, isNewFilter, minPrice, maxPrice]);

    const handleCategoryChange = (catId) => {
        setSelectedCategory(catId);
        setPage(1);
    };

    const toggleExpand = (catId) => {
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(catId)) {
                next.delete(catId);
            } else {
                next.add(catId);
            }
            return next;
        });
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
        setPage(1);
    };

    const handlePriceApply = () => {
        setPage(1);
        setIsPriceOpen(false);
    };

    const renderCategoryList = (items, level = 0) =>
        items.map((cat) => {
            const hasChildren = cat.children?.length > 0;
            const isExpanded = expandedCategories.has(cat.category_id);
            const isActive = selectedCategory === cat.category_id.toString();
            return (
                <div key={cat.category_id} className="space-y-1">
                    <div
                        onClick={() => handleCategoryChange(cat.category_id.toString())}
                        className={`w-full flex items-center gap-2 rounded-xl transition-colors text-left cursor-pointer ${isActive
                                ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                            }`}
                        style={{ paddingLeft: `${16 + level * 12}px`, paddingRight: '12px', paddingTop: '12px', paddingBottom: '12px' }}
                    >
                        <span className="font-medium flex-1">{cat.name}</span>
                        {hasChildren && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand(cat.category_id);
                                }}
                                className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                                aria-label={isExpanded ? 'Collapse' : 'Expand'}
                            >
                                <span
                                    className={`material-symbols-outlined text-slate-400 dark:text-slate-300 text-sm transition-transform ${isExpanded ? 'rotate-180' : ''
                                        }`}
                                >
                                    expand_more
                                </span>
                            </button>
                        )}
                    </div>

                    {hasChildren && isExpanded && (
                        <div className="mt-1 space-y-1 border-l border-slate-200 dark:border-white/10 ml-4 pl-3">
                            {renderCategoryList(cat.children, level + 1)}
                        </div>
                    )}
                </div>
            );
        });

    return (
        <main className="flex-grow container mx-auto px-4 py-8 md:px-6 lg:px-8 max-w-7xl pt-24 text-slate-800 dark:text-slate-100">
            {/* Title Section */}
            <section className="text-center mb-12 mt-4 relative">
                <h1 className="font-black text-5xl md:text-7xl mb-4 tracking-tighter text-white drop-shadow-[0_6px_30px_rgba(0,0,0,0.35)] relative inline-block uppercase">
                    The Archive
                    <div className="absolute inset-0 blur-lg bg-white/20 dark:bg-purple-500/20 -z-10 rounded-full opacity-0 dark:opacity-100"></div>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-light text-lg">
                    Curated for the bold. Filter by your vibe, sort by your priority.
                </p>
            </section>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full lg:w-64 flex-shrink-0 space-y-2">
                    <div className="glass-panel dark:glass-panel bg-white dark:bg-[#16162c] p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 h-full">
                        <div className="space-y-1 mb-6">
                            <button
                                onClick={() => handleCategoryChange('all')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${selectedCategory === 'all'
                                    ? 'bg-gradient-to-r from-indigo-500/80 to-cyan-500/80 text-white shadow-md shadow-indigo-500/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                                    }`}
                            >
                                <span className="font-medium">All Products</span>
                            </button>
                            {/* Placeholder Static Links mimicking HTML design */}
                            <button
                                onClick={() => {
                                    setIsSaleFilter((prev) => !prev);
                                    setPage(1);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${isSaleFilter
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-100'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-sm opacity-70">local_offer</span>
                                <span>Sale</span>
                            </button>
                            <button
                                onClick={() => {
                                    setIsNewFilter((prev) => !prev);
                                    setPage(1);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${isNewFilter
                                        ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-100'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-sm opacity-70 text-orange-400">whatshot</span>
                                <span>New</span>
                            </button>
                        </div>

                        <div className="border-t border-slate-200 dark:border-white/10 my-4"></div>

                        <div className="space-y-1 relative">
                            {renderCategoryList(categories)}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-grow">
                    {/* Filters Bar */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        {/* Search */}
                        <div className="relative flex-grow group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors">
                                <span className="material-symbols-outlined">search</span>
                            </span>
                            <input
                                className="w-full bg-white dark:bg-[#13132b] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder-slate-400 dark:placeholder-slate-600"
                                placeholder="Search products..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4">
                            {/* Price Filter Custom Dropdown */}
                            <div className="relative min-w-[180px]" ref={priceRef}>
                                <button
                                    onClick={() => setIsPriceOpen(!isPriceOpen)}
                                    className="w-full flex items-center justify-between bg-white dark:bg-[#13132b] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                >
                                    <span className="truncate">
                                        {minPrice || maxPrice ? `${minPrice || '0'} - ${maxPrice || 'Max'}` : 'Price Range'}
                                    </span>
                                    <span className="material-symbols-outlined text-slate-400">expand_more</span>
                                </button>

                                {isPriceOpen && (
                                    <div className="absolute top-full mt-2 left-0 w-full min-w-[240px] bg-white dark:bg-[#16162c] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-4 z-20 flex flex-col gap-3">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={minPrice}
                                                onChange={(e) => setMinPrice(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-purple-500 outline-none"
                                            />
                                            <span className="text-slate-400">-</span>
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={maxPrice}
                                                onChange={(e) => setMaxPrice(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-purple-500 outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={handlePriceApply}
                                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 rounded-lg text-sm transition-colors"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Sort Dropdown */}
                            <div className="relative min-w-[180px]">
                                <select
                                    value={sortBy}
                                    onChange={handleSortChange}
                                    className="w-full appearance-none bg-white dark:bg-[#13132b] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white pl-4 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
                                >
                                    <option value="newest">Default</option>
                                    <option value="price_asc">Price: Low-High</option>
                                    <option value="price_desc">Price: High-Low</option>
                                </select>
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                    <span className="material-symbols-outlined">expand_more</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {loading ? (
                            // Loading Skeletons
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-slate-200 dark:bg-white/5 rounded-2xl aspect-[4/5] mb-4"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-white/5 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-white/5 rounded w-1/3"></div>
                                </div>
                            ))
                        ) : (
                            products.map((product) => (
                                <Link
                                    key={product.product_id}
                                    to={`/product/${product.product_id}`}
                                    className="group relative rounded-2xl p-[1.5px] bg-gradient-to-br from-indigo-400/25 to-cyan-400/25 hover:from-cyan-400 hover:to-emerald-500 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-cyan-500/25 dark:shadow-none block"
                                >
                                    <div className="relative h-full bg-white dark:bg-[#16162c] rounded-2xl overflow-hidden p-4 flex flex-col gap-3 min-h-[340px]">
                                        <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                                            {product.thumbnail ? (
                                                <img
                                                    src={product.thumbnail}
                                                    alt={product.name}
                                                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                                                    <span className="material-symbols-outlined text-4xl">image</span>
                                                </div>
                                            )}

                                            {/* Badges */}
                                            {(product.is_new || product.is_sale) && (
                                                <div className="absolute top-3 right-3 flex flex-col gap-1">
                                                    {product.is_new && (
                                                        <span className="bg-purple-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                                                            NEW
                                                        </span>
                                                    )}
                                                    {product.is_sale && (
                                                        <span className="bg-orange-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                                                            SALE
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-slate-800 dark:text-white text-xl leading-tight line-clamp-2 min-h-[48px]">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex flex-col">
                                                {product.is_sale && product.sale_price ? (
                                                    <>
                                                        <span className="text-sm text-slate-400 line-through">
                                                            {formatPriceVND(product.base_price)}
                                                        </span>
                                                        <span className="text-emerald-600 dark:text-emerald-300 font-extrabold text-xl">
                                                            {formatPriceVND(product.sale_price)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-emerald-600 dark:text-emerald-300 font-extrabold text-xl">
                                                        {formatPriceVND(product.base_price)}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="material-symbols-outlined text-slate-400 group-hover:text-purple-500 transition-colors text-lg">
                                                chevron_right
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    {!loading && products.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">search_off</span>
                            <h3 className="text-xl font-bold text-slate-500 dark:text-slate-400">No products found</h3>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory('all');
                                    setSortBy('newest');
                                    setMinPrice('');
                                    setMaxPrice('');
                                    setIsSaleFilter(false);
                                    setIsNewFilter(false);
                                    setPage(1);
                                }}
                                className="mt-4 text-purple-600 font-medium hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && (products.length > 0 || page > 1) && (
                        <div className="flex justify-center mt-12 mb-8">
                            <nav className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-base">chevron_left</span> Prev
                                </button>

                                <span className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-md shadow-blue-500/30">
                                    {page}
                                </span>

                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    // simple check: if we got fewer items than limit, no more pages
                                    disabled={!hasMore && products.length < limit}
                                    className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                    Next <span className="material-symbols-outlined text-base">chevron_right</span>
                                </button>
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default ProductsPage;
