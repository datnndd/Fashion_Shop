import { Link, useParams } from 'react-router-dom';
import { formatPriceVND } from '../utils/currency';
import { useState, useEffect } from 'react';

import { productsAPI, reviewsAPI } from '../services/api';

const ProductDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [reviewSummary, setReviewSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedColor, setSelectedColor] = useState(0);
    const [selectedSize, setSelectedSize] = useState('M');
    const [quantity, setQuantity] = useState(1);

    // Derived state
    const colors = [];
    const sizes = ['S', 'M', 'L', 'XL']; // Default sizes if not found

    if (variants.length > 0) {
        // Extract unique colors
        const colorMap = new Map();
        variants.forEach(v => {
            if (v.attributes && v.attributes.color && v.attributes.color_name) {
                if (!colorMap.has(v.attributes.color_name)) {
                    colorMap.set(v.attributes.color_name, {
                        name: v.attributes.color_name,
                        value: v.attributes.color
                    });
                }
            }
        });
        if (colorMap.size > 0) {
            colors.push(...Array.from(colorMap.values()));
        }
    }

    // Fallback colors if none found (e.g. for products with no variants yet)
    if (colors.length === 0) {
        colors.push({ name: 'Standard', value: '#222222' });
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productData, variantsData, reviewsData, summaryData] = await Promise.all([
                    productsAPI.get(id),
                    productsAPI.getVariants(id),
                    reviewsAPI.list(id),
                    reviewsAPI.getSummary(id)
                ]);

                setProduct(productData);
                setVariants(variantsData);
                setReviews(reviewsData);
                setReviewSummary(summaryData);

                // Set initial selection
                if (variantsData.length > 0 && variantsData[0].attributes) {
                    // Try to match initial color state if possible
                }
            } catch (error) {
                console.error('Failed to fetch product data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    if (loading) {
        return <div className="min-h-screen bg-[#221022] text-white flex items-center justify-center">Loading...</div>;
    }

    if (!product) {
        return <div className="min-h-screen bg-[#221022] text-white flex items-center justify-center">Product not found</div>;
    }

    return (
        <div className="bg-[#221022] text-white font-[Space_Grotesk] min-h-screen">
            {/* Breadcrumbs */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-6">
                <nav className="flex text-sm font-medium text-[#c992c9]">
                    <Link to="/" className="hover:text-[#d411d4] transition-colors">Home</Link>
                    <span className="mx-2">/</span>
                    <Link to="/" className="hover:text-[#d411d4] transition-colors">{product.category_id === 1 ? 'Men' : 'Product'}</Link>
                    <span className="mx-2">/</span>
                    <span className="text-white">{product.name}</span>
                </nav>
            </div>

            {/* Main Content Grid */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Image Gallery */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                        {/* Main Feature Image */}
                        <div className="group relative overflow-hidden rounded-xl bg-[#2d162d] w-full aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5]">
                            <img
                                alt={product.name}
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                src={product.thumbnail}
                            />
                            <div className="absolute top-4 left-4 bg-[#d411d4] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                Best Seller
                            </div>
                        </div>
                        {/* Secondary Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-xl overflow-hidden bg-[#2d162d] aspect-[3/4]">
                                <img
                                    alt="Detail view"
                                    className="h-full w-full object-cover hover:opacity-90 transition-opacity"
                                    src={product.thumbnail}
                                />
                            </div>
                            <div className="rounded-xl overflow-hidden bg-[#2d162d] aspect-[3/4]">
                                <img
                                    alt="Detail view 2"
                                    className="h-full w-full object-cover hover:opacity-90 transition-opacity"
                                    src={product.thumbnail}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Product Details (Sticky) */}
                    <div className="lg:col-span-5 relative">
                        <div className="lg:sticky lg:top-24 flex flex-col gap-8">
                            {/* Header Info */}
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.9] uppercase">
                                        {product.name}
                                    </h1>
                                    <button className="p-3 rounded-full border border-[#482348] hover:border-[#d411d4] text-gray-400 hover:text-[#d411d4] transition-all">
                                        <span className="material-symbols-outlined filled">favorite</span>
                                    </button>
                                </div>
                                <div className="flex items-end gap-4">
                                    <p className="text-3xl font-bold">{formatPriceVND(product.base_price)}</p>
                                    {/* Rating */}
                                    <div className="flex items-center gap-1 mb-1.5 cursor-pointer group">
                                        <div className="flex text-[#d411d4]">
                                            {[1, 2, 3, 4].map((i) => (
                                                <span key={i} className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                            ))}
                                            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
                                        </div>
                                        <span className="text-sm text-[#c992c9] underline decoration-transparent group-hover:decoration-[#c992c9] transition-all">
                                            {reviewSummary ? reviewSummary.average_rating.toFixed(1) : '0.0'} ({reviewSummary ? reviewSummary.total_reviews : 0} reviews)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-[#482348]" />

                            {/* Color Selection */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold uppercase tracking-wider text-[#c992c9]">Color</span>
                                    <span className="text-sm font-bold text-[#d411d4]">{colors[selectedColor]?.name}</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {colors.map((color, index) => (
                                        <button
                                            key={color.name}
                                            aria-label={`Select ${color.name}`}
                                            onClick={() => setSelectedColor(index)}
                                            className={`relative w-12 h-12 rounded-full ring-offset-2 ring-offset-[#221022] transition-all ${selectedColor === index
                                                ? 'ring-2 ring-[#d411d4] scale-110 shadow-lg shadow-[#d411d4]/20'
                                                : 'ring-1 ring-transparent hover:ring-gray-400 hover:scale-105'
                                                }`}
                                            style={{ backgroundColor: color.value, border: color.value === '#f0f0f0' ? '1px solid #ccc' : 'none' }}
                                        >
                                            {selectedColor === index && (
                                                <span className="absolute inset-0 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-white text-lg">check</span>
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Size Selection */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold uppercase tracking-wider text-[#c992c9]">Size</span>
                                    <a href="#" className="text-sm underline text-gray-500 hover:text-[#d411d4] transition-colors">Size Guide</a>
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                    {sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => size !== 'XL' && setSelectedSize(size)}
                                            className={`h-12 rounded-lg font-bold text-sm transition-all ${selectedSize === size
                                                ? 'border border-[#d411d4] bg-[#d411d4]/10 text-[#d411d4]'
                                                : size === 'XL'
                                                    ? 'border border-[#482348] opacity-50 cursor-not-allowed relative overflow-hidden'
                                                    : 'border border-[#482348] hover:border-[#d411d4] hover:text-[#d411d4]'
                                                }`}
                                        >
                                            {size}
                                            {size === 'XL' && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-full h-[1px] bg-gray-400 rotate-45 transform"></div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-4">
                                <div className="w-32 relative">
                                    <div className="flex items-center justify-between w-full h-14 px-4 rounded-lg border border-[#482348]">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="hover:text-[#d411d4] transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">remove</span>
                                        </button>
                                        <span className="font-bold">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="hover:text-[#d411d4] transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        </button>
                                    </div>
                                </div>
                                <Link
                                    to="/cart"
                                    className="flex-1 h-14 bg-[#d411d4] hover:bg-[#b00eb0] text-white rounded-lg font-bold text-lg tracking-wide transition-all shadow-lg shadow-[#d411d4]/25 flex items-center justify-center gap-2"
                                >
                                    Add to Bag
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </Link>
                            </div>

                            {/* Description Text */}
                            <p className="text-gray-300 leading-relaxed pt-2">
                                {product.description}
                            </p>

                            {/* Accordions */}
                            <div className="flex flex-col gap-2 pt-4">
                                <details className="group bg-[#2d162d] rounded-lg border border-[#482348]">
                                    <summary className="flex items-center justify-between p-4 cursor-pointer font-bold select-none">
                                        <span>Fabric & Care</span>
                                        <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                                    </summary>
                                    <div className="px-4 pb-4 text-sm text-[#c992c9]">
                                        100% Organic Cotton. Heavyweight 400gsm fleece. Machine wash cold with like colors. Do not bleach. Tumble dry low.
                                    </div>
                                </details>
                                <details className="group bg-[#2d162d] rounded-lg border border-[#482348]">
                                    <summary className="flex items-center justify-between p-4 cursor-pointer font-bold select-none">
                                        <span>Shipping & Returns</span>
                                        <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                                    </summary>
                                    <p className="px-4 pb-4 text-sm text-gray-400 mt-4 leading-relaxed">
                                        Free shipping on orders over {formatPriceVND(3750000)}. Returns accepted within 30 days of purchase in original condition.
                                    </p>
                                </details>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-24">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold">Customer Reviews</h3>
                        <button className="px-6 py-2 border border-[#C07B5F] text-[#C07B5F] rounded-lg hover:bg-[#C07B5F] hover:text-white transition-all font-medium">
                            Write a Review
                        </button>
                    </div>

                    {/* Review Stats Summary */}
                    <div className="bg-[#2d162d] border border-[#482348] rounded-xl p-6 mb-8 flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex flex-col items-center md:items-start">
                            <div className="text-5xl font-bold mb-2">{reviewSummary ? reviewSummary.average_rating.toFixed(1) : '0.0'}</div>
                            <div className="flex text-[#C07B5F] mb-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <span key={i} className="material-symbols-outlined text-xl" style={{ fontVariationSettings: `'FILL' ${i <= (reviewSummary?.average_rating || 0) ? 1 : 0}` }}>star</span>
                                ))}
                            </div>
                            <p className="text-sm text-[#c992c9]">Based on {reviewSummary?.total_reviews || 0} reviews</p>
                        </div>
                        <div className="flex-1 w-full">
                            {[5, 4, 3, 2, 1].map((rating) => {
                                const count = reviewSummary?.distribution?.[rating] || 0;
                                return (
                                    <div key={rating} className="flex items-center gap-3 mb-2">
                                        <span className="text-sm w-8">{rating}★</span>
                                        <div className="flex-1 h-2 bg-[#221022] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#C07B5F] rounded-full transition-all"
                                                style={{ width: `${reviewSummary?.distribution?.[rating] ? (reviewSummary.distribution[rating] / reviewSummary.total_reviews) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-[#c992c9] w-8">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Individual Reviews */}
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-[#2d162d] border border-[#482348] rounded-xl p-6 hover:border-[#C07B5F]/30 transition-colors">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-bold text-lg">{review.user_name}</h4>
                                            {review.is_verified && (
                                                <span className="flex items-center gap-1 text-xs bg-[#C07B5F]/10 text-[#C07B5F] px-2 py-1 rounded-full border border-[#C07B5F]/20">
                                                    <span className="material-symbols-outlined text-sm">verified</span>
                                                    Verified Purchase
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-[#c992c9]">
                                            <div className="flex text-[#C07B5F]">
                                                {[...Array(5)].map((_, i) => (
                                                    <span
                                                        key={i}
                                                        className="material-symbols-outlined text-base"
                                                        style={{ fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0" }}
                                                    >
                                                        star
                                                    </span>
                                                ))}
                                            </div>
                                            <span>•</span>
                                            <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>Size: {review.size_purchased}</span>
                                        </div>
                                    </div>
                                </div>

                                <h5 className="font-bold mb-2">{review.title}</h5>
                                <p className="text-gray-300 leading-relaxed mb-4">{review.comment}</p>

                                <div className="flex items-center gap-4 pt-4 border-t border-[#482348]">
                                    <button className="flex items-center gap-2 text-sm text-[#c992c9] hover:text-[#C07B5F] transition-colors">
                                        <span className="material-symbols-outlined text-base">thumb_up</span>
                                        Helpful ({review.helpful_count || 0})
                                    </button>
                                    <button className="text-sm text-[#c992c9] hover:text-white transition-colors">
                                        Report
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Load More Button */}
                    <div className="flex justify-center mt-8">
                        <button className="px-8 py-3 border border-[#482348] rounded-lg hover:border-[#C07B5F] hover:text-[#C07B5F] transition-all font-medium">
                            Load More Reviews
                        </button>
                    </div>
                </div >
            </main >
        </div >
    );
};

export default ProductDetailPage;
