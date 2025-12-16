import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { collectionsAPI, productsAPI } from '../services/api';

const CollectionsPage = () => {
    const { theme, setTheme } = useTheme();
    const [collections, setCollections] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fallback collections data (used when API is unavailable)
    const fallbackCollections = [
        {
            collection_id: 1,
            slug: 'neon-pulse',
            name: 'Neon Pulse',
            description: 'Dive into the electric energy of our boldest pinks.',
            accent_color: '#d411d4',
            secondary_color: '#c992c9',
            border_color: '#673267',
            panel_bg_color: '#482348',
            gradient_overlay: 'radial-gradient(at 0% 0%, hsla(300, 35%, 20%, 1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(280, 30%, 18%, 1) 0, transparent 50%), radial-gradient(at 100% 100%, hsla(290, 25%, 12%, 1) 0, transparent 50%), radial-gradient(at 0% 100%, hsla(310, 40%, 10%, 1) 0, transparent 50%)',
            image_overlay: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB64Fs0LjzLIgV5FBF6mVnLg2m-bnajp64V2f82j3hMJDmLqpN5K3a3X2-g3cOzNFz4CBG4io3zhInj5d82Rstov7XqqnFSnRTF5cS5kDYadX7zzegA_VZLR4GwF9zRzaRAhObATtwgoXWI_YeGJTt_6h8Gt0czlFnU8N9rU18RaHTtdCdEVNGhec8Gv3vsqB4eraLv9HWFLgvyfN-TPBIGd1wAUfSTANhLNlN2aukJv2pZ0H-SM8w30FemIaQq2hq8wYHmfwNgKug'
        },
        {
            collection_id: 2,
            slug: 'ocean-depths',
            name: 'Ocean Depths',
            description: 'Calm, cool, and collected. The serenity of the deep blue.',
            accent_color: '#0ea5e9',
            secondary_color: '#7dd3fc',
            border_color: '#0369a1',
            panel_bg_color: '#0c4a6e',
            gradient_overlay: 'radial-gradient(at 0% 0%, hsla(210, 35%, 20%, 1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(200, 30%, 18%, 1) 0, transparent 50%), radial-gradient(at 100% 100%, hsla(220, 25%, 12%, 1) 0, transparent 50%), radial-gradient(at 0% 100%, hsla(190, 40%, 10%, 1) 0, transparent 50%)',
            image_overlay: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop'
        },
        {
            collection_id: 3,
            slug: 'solar-flare',
            name: 'Solar Flare',
            description: 'Warmth and radiance. Ignite your style with fiery hues.',
            accent_color: '#f97316',
            secondary_color: '#fdba74',
            border_color: '#c2410c',
            panel_bg_color: '#7c2d12',
            gradient_overlay: 'radial-gradient(at 0% 0%, hsla(30, 35%, 20%, 1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(15, 30%, 18%, 1) 0, transparent 50%), radial-gradient(at 100% 100%, hsla(25, 25%, 12%, 1) 0, transparent 50%), radial-gradient(at 0% 100%, hsla(10, 40%, 10%, 1) 0, transparent 50%)',
            image_overlay: 'https://images.unsplash.com/photo-1544965851-da28441cd5ad?q=80&w=2089&auto=format&fit=crop'
        },
        {
            collection_id: 4,
            slug: 'forest-whisper',
            name: 'Forest Whisper',
            description: 'Grounded and organic. Connect with nature\'s finest greens.',
            accent_color: '#22c55e',
            secondary_color: '#86efac',
            border_color: '#15803d',
            panel_bg_color: '#14532d',
            gradient_overlay: 'radial-gradient(at 0% 0%, hsla(140, 35%, 20%, 1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(120, 30%, 18%, 1) 0, transparent 50%), radial-gradient(at 100% 100%, hsla(150, 25%, 12%, 1) 0, transparent 50%), radial-gradient(at 0% 100%, hsla(130, 40%, 10%, 1) 0, transparent 50%)',
            image_overlay: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1527&auto=format&fit=crop'
        }
    ];

    // Fallback products data (used when API is unavailable)
    const fallbackProducts = [
        {
            product_id: 1,
            name: 'Neon Oversized Knit',
            base_price: 120,
            is_new: true,
            thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACQ5EPOfI4E08g7BONgVWum0GxW27TsRFDHaEMOjy05wisQShNoj8SppeNZXiyF0ky_NxJG5N5stwqwisK7VIfc0Nglmf2DDW4NKrw3I2tviR0_YNn3UL1t7sHRYvguNiy7D-FFzMHHLriFzWzyPkqMqtmqkxRtNIqVXdGC8ixYkhNUxWQwu4romhKp0xmHELv1TJcbOCDgdSevZ-smmzgB9dxSGtmNz90QshRGhgICEfAfREUoLQTivRAbkAjLNKk5BS3VSz0E-A',
            colors: ['#d411d4', '#9333ea', '#f472b6'],
        },
        {
            product_id: 2,
            name: 'Urban Tee - Magenta',
            base_price: 45,
            thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcl_O2s7tEkvre7Sk7DnL5bWi0OI5jrNoYqaj2Py2X40U4tEp9N2t4H8f_0A6H2-OHZEvlX98RgVffy3DNEjGMnmgzulsw5DKssXXNPbNvtGENMyE4iPgHzdkJP4P9yNUOSmmcVLUH3DgL1c-tD9AOIWTMiQtuOZ9Sca74L92wpFAQNtw8C_unlCUuzB390QIBcuRjR58WjbR9q8ofboBinXPdUsW_cgNwqT8VAiR6S0UXzdqy3M_FwMvb0HgjzKCvvi5ImvyAeCk',
            colors: ['#d411d4', '#000000'],
        },
        {
            product_id: 3,
            name: 'Structured Blazer',
            base_price: 185,
            thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAia8J0xT8QeGNQHqVJLHz1JYjZ01gfWwJRRJmRpocS3i0zEg4ik8Fwe_XxGwhOCap1nc0u_Yshg_upKLSXMDiE3JEP7U5sbdDH887s69kqvu-WhNaSvDfTLM145Kz_GtHMf_4i_PagFagCq8lgHyAjnP0C9SsPLGWg4bxtOHyagD1T5G0vta53CV6_0Kt5FgamFud8EL2jHmNc4IuklJWqgbiDqchGlu2rBzwJmUM5KQcRYR-zSeUh3bLomqMCzu027rBalTZ0raM',
            colors: ['#d411d4'],
        },
        {
            product_id: 4,
            name: 'Tech Fleece Zip',
            base_price: 95,
            thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxyKgVtVY0kT___pDAnWxcUQa6iNJv_Kg2Xjf7V-DnFkYp3gNpVqe_6if0V9W1neB4piDgsWd3uLUdnnUlipdGoiPEUiYeIiGxwKD-Ud7OeODcnLqJoFUids5xaTuL_d47u9EJdxV7sCRXBMipWz4vFPSGmLmASschqVUJ5KZePcUkBi50jNd1vFEpI_uLe5GRzKJ3rUvndO3Z1BBstI8ehFvwqOZnK7aL9QjuGU19pQm4GaT0B9XpNuMh2N3kECcCMEy80ljTFtM',
            colors: ['#d411d4', '#6b7280'],
        },
        {
            product_id: 5,
            name: 'Core Hoodie',
            base_price: 55,
            original_price: 75,
            is_sale: true,
            thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7XZij8-Dh0yB6Dle4ettsozJSEuakLzxip8Sg2fm_nFW78gzA3_FB4jB1HPmRJOGwfvq_rvvV4_J7lmPypVP3PPJCBEnSDA0AAR5tPQSWcb38D9opdCXQf3fuwg6XbCPkndDLQVUhT-FaFHD4uXuIPjmcFJSosQy1CVEcCwEiMjfszb8rIbNjI8z04qE8n7joYkkksA4CCusO82A9ertkGTiuAweqVmXNWhS0hBTZWjxdYZ5-UbJlGm6aXnROQdN8F5f3H83P08c',
            colors: ['#d411d4', '#1e3a8a'],
        },
        {
            product_id: 6,
            name: 'Summer Linen Shirt',
            base_price: 80,
            thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5IMou7SnWz0eActU9SSPJFBa5_-s-uD_U3qZc-c8ieuHqb-WGIyetCo37sR8GvBOOvtVNYuCFlHUw9m7iGNc3d2sbSTM4Op5-sWyOD_gszmNlmFYFCqEql5K6wh0qXTdtUH_WCdcV0Ftr-KJfvgwecIOenLuzlX7qA8OLBOmp-8CXBsWMxD_SiEVkHOqsX0gS-eLQ3FiH2yUd-Fmdh8ksUJWcktI1owhktDl-jh4HLLvrdEzsM1Dv8R7lo_4FUaZGV-wUuslQqL4',
            colors: ['#d411d4', '#ffffff'],
        },
    ];

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [collectionsData, productsData] = await Promise.all([
                    collectionsAPI.list(),
                    productsAPI.list()
                ]);
                setCollections(collectionsData.length > 0 ? collectionsData : fallbackCollections);
                setProducts(productsData.length > 0 ? productsData : fallbackProducts);
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError(err.message);
                // Use fallback data on error
                setCollections(fallbackCollections);
                setProducts(fallbackProducts);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper to get collection display values (handles both API and fallback data formats)
    const getCollectionValue = (col, field) => {
        // API uses snake_case, fallback might use camelCase
        const snakeField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
        return col[field] || col[snakeField];
    };

    const handleCollectionClick = (selectedCollection) => {
        setTheme({
            name: selectedCollection.name,
            accentColor: getCollectionValue(selectedCollection, 'accent_color') || getCollectionValue(selectedCollection, 'accentColor'),
            secondaryColor: getCollectionValue(selectedCollection, 'secondary_color') || getCollectionValue(selectedCollection, 'secondaryColor'),
            borderColor: getCollectionValue(selectedCollection, 'border_color') || getCollectionValue(selectedCollection, 'borderColor'),
            panelBgColor: getCollectionValue(selectedCollection, 'panel_bg_color') || getCollectionValue(selectedCollection, 'panelBgColor'),
            gradientOverlay: getCollectionValue(selectedCollection, 'gradient_overlay') || getCollectionValue(selectedCollection, 'gradientOverlay'),
        });
    };

    // Find the current collection object based on theme name to display image overlay
    const currentCollectionInfo = collections.find(c => c.name === theme.name) || collections[0] || fallbackCollections[0];


    return (
        <div className="min-h-screen text-white font-[Space_Grotesk]">
            <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-8">
                {/* Breadcrumbs */}
                <div className="flex flex-wrap gap-2 mb-8 items-center text-sm">
                    <Link to="/" style={{ color: theme.secondaryColor }} className="hover:opacity-80 transition-colors font-medium">Home</Link>
                    <span style={{ color: theme.secondaryColor }} className="font-medium">/</span>
                    <Link to="/collections" style={{ color: theme.secondaryColor }} className="hover:opacity-80 transition-colors font-medium">Shop</Link>
                    <span style={{ color: theme.secondaryColor }} className="font-medium">/</span>
                    <span className="text-white font-medium border-b" style={{ borderColor: theme.accentColor }}>{theme.name}</span>
                </div>

                {/* Page Heading */}
                <div
                    className="mb-12 relative overflow-hidden rounded-2xl border"
                    style={{
                        background: `linear-gradient(to right, ${theme.panelBgColor}, transparent)`,
                        borderColor: theme.borderColor
                    }}
                >
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
                        <img
                            alt="Abstract gradient"
                            className="w-full h-full object-cover mix-blend-screen"
                            src={currentCollectionInfo.imageOverlay}
                        />
                    </div>
                    <div className="relative z-10 p-8 md:p-12 flex flex-col gap-4 max-w-2xl">
                        <h1 className="text-white text-5xl md:text-7xl font-black leading-[0.9] tracking-[-0.033em] uppercase drop-shadow-lg">
                            The <span style={{ color: theme.accentColor }}>{theme.name}</span>
                        </h1>
                        <p className="text-white/80 text-lg font-light max-w-lg">
                            {currentCollectionInfo.description}
                        </p>
                    </div>
                </div>

                {/* Layout Grid */}
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Sidebar / Filters */}
                    <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
                        {/* Collections Selection */}
                        <div className="border-b pb-8" style={{ borderColor: theme.borderColor }}>
                            <h3 className="text-lg font-bold text-white tracking-wide mb-4">Themes</h3>
                            <div className="flex flex-wrap gap-3">
                                {collections.map((col) => (
                                    <button
                                        key={col.id}
                                        onClick={() => handleCollectionClick(col)}
                                        className={`w-8 h-8 rounded-full transition-all duration-300 ring-2 ring-offset-2 ring-offset-[#1F1B18] ${theme.name === col.name ? 'scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                                        style={{
                                            backgroundColor: col.accentColor,
                                            boxShadow: theme.name === col.name ? `0 0 10px ${col.accentColor}` : 'none',
                                            borderColor: theme.name === col.name ? 'white' : 'transparent',
                                            ringColor: theme.name === col.name ? 'white' : 'transparent'
                                        }}
                                        title={col.name}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: theme.borderColor }}>
                            <h3 className="text-lg font-bold text-white tracking-wide">Filters</h3>
                            <button className="text-xs hover:text-white uppercase tracking-wider" style={{ color: theme.secondaryColor }}>Reset</button>
                        </div>
                        <div className="flex flex-col gap-4">
                            {/* Size Filter */}
                            <details className="group border-b pb-4" style={{ borderColor: theme.borderColor + '80' }} open>
                                <summary className="flex cursor-pointer items-center justify-between py-2 list-none">
                                    <span className="text-white font-medium">Size</span>
                                    <span className="material-symbols-outlined transition-transform group-open:rotate-180" style={{ color: theme.accentColor }}>expand_more</span>
                                </summary>
                                <div className="pt-4 space-y-3">
                                    {['Small', 'Medium', 'Large', 'Extra Large'].map((size) => (
                                        <label key={size} className="flex items-center gap-3 cursor-pointer group/check">
                                            <input
                                                type="checkbox"
                                                defaultChecked={size === 'Medium'}
                                                className="w-5 h-5 rounded border-2 bg-transparent focus:ring-0 focus:ring-offset-0 transition-colors cursor-pointer"
                                                style={{
                                                    borderColor: theme.borderColor,
                                                    color: theme.accentColor
                                                }}
                                            />
                                            <span className="text-white/70 group-hover/check:text-white text-sm">{size}</span>
                                        </label>
                                    ))}
                                </div>
                            </details>

                            {/* Category Filter */}
                            <details className="group border-b pb-4" style={{ borderColor: theme.borderColor + '80' }}>
                                <summary className="flex cursor-pointer items-center justify-between py-2 list-none">
                                    <span className="text-white font-medium">Category</span>
                                    <span className="material-symbols-outlined transition-transform group-open:rotate-180" style={{ color: theme.accentColor }}>expand_more</span>
                                </summary>
                                <div className="pt-4 space-y-3">
                                    {['Hoodies', 'Tees', 'Outerwear'].map((category) => (
                                        <label key={category} className="flex items-center gap-3 cursor-pointer group/check">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded border-2 bg-transparent focus:ring-0 focus:ring-offset-0 transition-colors cursor-pointer"
                                                style={{
                                                    borderColor: theme.borderColor,
                                                    color: theme.accentColor
                                                }}
                                            />
                                            <span className="text-white/70 group-hover/check:text-white text-sm">{category}</span>
                                        </label>
                                    ))}
                                </div>
                            </details>

                            {/* Material Filter */}
                            <details className="group border-b pb-4" style={{ borderColor: theme.borderColor + '80' }}>
                                <summary className="flex cursor-pointer items-center justify-between py-2 list-none">
                                    <span className="text-white font-medium">Material</span>
                                    <span className="material-symbols-outlined transition-transform group-open:rotate-180" style={{ color: theme.accentColor }}>expand_more</span>
                                </summary>
                                <div className="pt-4 space-y-3">
                                    {['Cotton', 'Synthetics'].map((material) => (
                                        <label key={material} className="flex items-center gap-3 cursor-pointer group/check">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded border-2 bg-transparent focus:ring-0 focus:ring-offset-0 transition-colors cursor-pointer"
                                                style={{
                                                    borderColor: theme.borderColor,
                                                    color: theme.accentColor
                                                }}
                                            />
                                            <span className="text-white/70 group-hover/check:text-white text-sm">{material}</span>
                                        </label>
                                    ))}
                                </div>
                            </details>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-grow">
                        {/* Sort & Count */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-sm" style={{ color: theme.secondaryColor }}>Showing {products.length} results</p>
                            <div className="flex items-center gap-2">
                                <span className="text-white text-sm">Sort by:</span>
                                <select className="bg-transparent border-none text-white text-sm font-bold focus:ring-0 cursor-pointer p-0 pr-6">
                                    <option className="bg-[#221022]">Newest</option>
                                    <option className="bg-[#221022]">Price: Low to High</option>
                                    <option className="bg-[#221022]">Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {products.map((product) => {
                                // Handle both API (snake_case) and fallback (camelCase) field names
                                const productId = product.product_id || product.id;
                                const price = product.base_price || product.price;
                                const originalPrice = product.original_price || product.originalPrice;
                                const isNew = product.is_new || product.isNew;
                                const isSale = product.is_sale || product.isSale;
                                const image = product.thumbnail || product.image;
                                const colors = product.colors || [];

                                return (
                                    <Link to={`/product/${productId}`} key={productId} className="group flex flex-col gap-3">
                                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-[#2d1b2d]">
                                            {isNew && (
                                                <span className="absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider z-20"
                                                    style={{ backgroundColor: theme.accentColor }}
                                                >
                                                    New
                                                </span>
                                            )}
                                            {isSale && (
                                                <span className="absolute top-3 left-3 bg-white text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider z-20">
                                                    Sale
                                                </span>
                                            )}
                                            <button className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:text-white backdrop-blur-sm transition-colors"
                                                style={{ '--hover-bg': theme.accentColor }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.accentColor}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.2)'}
                                            >
                                                <span className="material-symbols-outlined text-[18px]">favorite</span>
                                            </button>
                                            <img
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                                                src={image}
                                                alt={product.name}
                                            />
                                            {/* Quick Add Overlay */}
                                            <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                <button
                                                    className="w-full h-10 bg-white text-black font-bold rounded flex items-center justify-center gap-2 hover:text-white transition-colors"
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.accentColor}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">add</span> Quick Add
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-white font-bold text-lg leading-tight transition-colors cursor-pointer"
                                                    onMouseEnter={(e) => e.currentTarget.style.color = theme.accentColor}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
                                                >
                                                    {product.name}
                                                </h3>
                                                <div className="flex flex-col items-end">
                                                    <span className="font-bold" style={{ color: theme.accentColor }}>${price}</span>
                                                    {originalPrice && (
                                                        <span className="text-xs line-through" style={{ color: theme.secondaryColor }}>${originalPrice}</span>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Swatches */}
                                            {colors.length > 0 && (
                                                <div className="flex gap-2 mt-1">
                                                    {colors.map((color, index) => (
                                                        <button
                                                            key={index}
                                                            className={`w-4 h-4 rounded-full ring-offset-2 ring-offset-[#221022] transition-all ${index === 0 ? 'ring-2 ring-white' : 'hover:ring-2 hover:ring-white/50'
                                                                }`}
                                                            style={{ backgroundColor: color }}
                                                        ></button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Load More */}
                        <div className="mt-16 flex justify-center">
                            <button
                                className="px-8 py-3 rounded-lg border text-white transition-colors font-bold tracking-wide uppercase text-sm"
                                style={{
                                    borderColor: theme.borderColor,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = theme.panelBgColor;
                                    e.currentTarget.style.borderColor = theme.panelBgColor;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.borderColor = theme.borderColor;
                                }}
                            >
                                Load More Products
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-20 border-t pt-12 pb-8"
                style={{
                    borderColor: theme.panelBgColor,
                    backgroundColor: 'rgba(0,0,0,0.2)'
                }}
            >
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", color: theme.accentColor }}>pentagon</span>
                                <span className="text-xl font-bold text-white">BasicColor</span>
                            </div>
                            <p className="text-sm leading-relaxed" style={{ color: theme.secondaryColor }}>
                                Defining the spectrum of modern fashion. Boldly minimal. Unapologetically colorful.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Shop</h4>
                            <ul className="space-y-2 text-sm" style={{ color: theme.secondaryColor }}>
                                <li><a href="#" className="hover:text-white transition-colors">New Arrivals</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Best Sellers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Collections</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Sale</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Support</h4>
                            <ul className="space-y-2 text-sm" style={{ color: theme.secondaryColor }}>
                                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Size Guide</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Stay in the loop</h4>
                            <form className="flex gap-2">
                                <input
                                    className="border-none rounded text-white text-sm w-full focus:ring-1"
                                    style={{
                                        backgroundColor: theme.panelBgColor,
                                        '--tw-ring-color': theme.accentColor,
                                        placeholderColor: theme.secondaryColor // Note: pseudoclass styling inline is tricky in React, but placeholder color is hard to set inline.
                                    }}
                                    placeholder="Your email"
                                    type="email"
                                />
                                <button
                                    type="button"
                                    className="text-white rounded p-2 transition-colors"
                                    style={{ backgroundColor: theme.accentColor }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'white';
                                        e.currentTarget.style.color = theme.accentColor;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = theme.accentColor;
                                        e.currentTarget.style.color = 'white';
                                    }}
                                >
                                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                </button>
                            </form>
                        </div>
                    </div>
                    <div className="text-center pt-8 border-t text-xs"
                        style={{ borderColor: theme.panelBgColor, color: theme.borderColor }}
                    >
                        © 2024 BasicColor. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CollectionsPage;
