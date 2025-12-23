import { Link, useNavigate, useParams } from 'react-router-dom';
import { formatPriceVND } from '../utils/currency';
import { useState, useEffect, useMemo } from 'react';

import { productsAPI, reviewsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [reviewSummary, setReviewSummary] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [relatedLoading, setRelatedLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    const [selectedColor, setSelectedColor] = useState(0);
    const [selectedSize, setSelectedSize] = useState('M');
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [actionError, setActionError] = useState('');

    const [activeImage, setActiveImage] = useState('');

    const navigate = useNavigate();
    const { addToCart, cart } = useCart();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const colors = useMemo(() => {
        const colorMap = new Map();
        variants.forEach((v) => {
            const attrs = v.attributes || {};
            const name = attrs.color_name || attrs.color;
            const value = attrs.color_value || attrs.color;

            if (name) {
                if (!colorMap.has(name)) {
                    colorMap.set(name, {
                        name: name,
                        value: value
                    });
                }
            }
        });
        const list = Array.from(colorMap.values());
        if (list.length === 0) {
            return [{ name: 'Standard', value: '#222222' }];
        }
        return list;
    }, [variants]);

    const sizes = useMemo(() => {
        const sizeSet = new Set();
        variants.forEach((v) => {
            const attrs = v.attributes || {};
            const sizeValue = attrs.size || attrs.size_name;
            if (sizeValue) {
                sizeSet.add(sizeValue);
            }
        });
        if (sizeSet.size === 0) {
            return ['S', 'M', 'L', 'XL'];
        }
        return Array.from(sizeSet);
    }, [variants]);

    useEffect(() => {
        if (sizes.length > 0 && !sizes.includes(selectedSize)) {
            setSelectedSize(sizes[0]);
        }
    }, [sizes, selectedSize]);

    useEffect(() => {
        if (colors.length > 0 && selectedColor >= colors.length) {
            setSelectedColor(0);
        }
    }, [colors, selectedColor]);

    const selectedVariant = useMemo(() => {
        if (variants.length === 0) return null;
        const targetColor = colors[selectedColor]?.name?.toString().toLowerCase();
        const targetSize = selectedSize?.toString().toLowerCase();

        const match = variants.find((variant) => {
            const attrs = variant.attributes || {};
            const variantColor = (attrs.color_name || attrs.color || '').toString().toLowerCase();
            const variantSize = (attrs.size || attrs.size_name || '').toString().toLowerCase();
            const colorMatch = targetColor ? variantColor === targetColor : true;
            const sizeMatch = targetSize ? variantSize === targetSize : true;
            return colorMatch && sizeMatch;
        });

        return match || null;
    }, [variants, colors, selectedColor, selectedSize]);

    // Update active image when variant or product changes
    useEffect(() => {
        if (selectedVariant?.images && selectedVariant.images.length > 0) {
            setActiveImage(selectedVariant.images[0]);
        } else if (product?.thumbnail) {
            setActiveImage(product.thumbnail);
        }
    }, [selectedVariant, product]);

    const selectedVariantId = selectedVariant?.variant_id || selectedVariant?.id;

    const basePrice = parseFloat(product?.base_price ?? 0);
    const extraPrice = parseFloat(selectedVariant?.price ?? 0);
    const variantPrice = basePrice + extraPrice;

    const discountPercent = product?.discount_percent || 0;
    const finalPrice = discountPercent ? variantPrice * (1 - discountPercent / 100) : variantPrice;

    const rawStock = selectedVariant?.stock;
    const parsedStock = rawStock === null || rawStock === undefined ? null : Number(rawStock);
    const hasStockNumber = Number.isFinite(parsedStock);
    const availableStock = hasStockNumber ? Math.max(parsedStock, 0) : null;

    const existingCartQuantity = useMemo(() => {
        if (!selectedVariantId || !cart?.items) return 0;
        const match = cart.items.find((item) => item.product_variant_id === selectedVariantId);
        return match?.quantity || 0;
    }, [cart, selectedVariantId]);

    const remainingStock = availableStock === null ? null : Math.max(availableStock - existingCartQuantity, 0);
    const maxSelectableQuantity = remainingStock === null ? Number.MAX_SAFE_INTEGER : remainingStock;
    const isSelectionAvailable = !!selectedVariant && (remainingStock === null || remainingStock > 0);

    useEffect(() => {
        if (maxSelectableQuantity === Number.MAX_SAFE_INTEGER) return;
        setQuantity((prev) => {
            if (maxSelectableQuantity <= 0) return 1;
            return prev > maxSelectableQuantity ? maxSelectableQuantity : prev;
        });
    }, [maxSelectableQuantity]);

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

    const categoryId = product?.category_id || product?.category?.category_id;

    useEffect(() => {
        const fetchRelated = async () => {
            if (!id) {
                setRelatedProducts([]);
                return;
            }
            setRelatedLoading(true);
            try {
                const data = await productsAPI.related(id, 8);
                const filtered = (data || []).filter((item) => item.product_id !== Number(id));
                setRelatedProducts(filtered.slice(0, 4));
            } catch (error) {
                console.error('Failed to fetch related products:', error);
                setRelatedProducts([]);
            } finally {
                setRelatedLoading(false);
            }
        };

        fetchRelated();
    }, [id]);

    if (loading) {
        return <div className="min-h-screen bg-[#221022] text-white flex items-center justify-center">Loading...</div>;
    }

    if (!product) {
        return <div className="min-h-screen bg-[#221022] text-white flex items-center justify-center">Product not found</div>;
    }



    const isSizeAvailable = (size) => {
        if (!colors[selectedColor]) return false;
        const targetColor = colors[selectedColor].name;
        return variants.some(v => {
            const vColor = v.attributes?.color_name || v.attributes?.color;
            const vSize = v.attributes?.size || v.attributes?.size_name;
            const stock = v.stock || 0;
            return vColor === targetColor && vSize === size && stock > 0;
        });
    };

    const handleAddToCart = async () => {
        if (!selectedVariant) {
            setActionError('Please select available options.');
            return;
        }
        if (!isSelectionAvailable) {
            setActionError('Selected color/size is not available.');
            return;
        }
        if (!isAuthenticated) {
            setActionError('Please login to add items to your bag.');
            navigate('/login');
            return;
        }
        if (quantity < 1) {
            setActionError('Quantity must be at least 1.');
            return;
        }
        if (typeof remainingStock === 'number') {
            if (remainingStock <= 0) {
                setActionError('You already have the maximum available quantity in your cart.');
                return;
            }
            if (quantity > remainingStock) {
                setActionError(`Only ${remainingStock} more unit(s) can be added (you already have ${existingCartQuantity}).`);
                return;
            }
        }

        const variantId = selectedVariantId;
        if (!variantId) {
            setActionError('Selected variant is unavailable.');
            return;
        }

        setAdding(true);
        setActionError('');
        try {
            await addToCart(variantId, quantity, availableStock);
            navigate('/cart');
        } catch (error) {
            setActionError(error.message || 'Unable to add to cart.');
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="bg-[#221022] text-white font-[Space_Grotesk] min-h-screen">
            {/* Breadcrumbs */}
            {/* ... */}

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
                                src={activeImage || product.thumbnail}
                            />
                            {product.discount_percent > 0 && (
                                <div className="absolute top-4 left-4 bg-[#d411d4] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    -{product.discount_percent}%
                                </div>
                            )}
                        </div>
                        {/* Secondary Grid (Product Gallery) */}
                        {product.images && product.images.length > 0 && (
                            <div className="grid grid-cols-4 gap-4">
                                {product.images.slice(0, 4).map((img, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-xl overflow-hidden bg-[#2d162d] aspect-square cursor-pointer hover:ring-2 hover:ring-[#d411d4] transition-all"
                                        onClick={() => setActiveImage(img)}
                                    >
                                        <img
                                            alt={`Gallery ${idx}`}
                                            className="h-full w-full object-cover hover:opacity-90 transition-opacity"
                                            src={img}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
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
                                    {discountPercent > 0 ? (
                                        <div className="flex items-baseline gap-3">
                                            <p className="text-3xl font-bold text-[#d411d4]">{formatPriceVND(finalPrice)}</p>
                                            <p className="text-lg text-gray-500 line-through">{formatPriceVND(variantPrice)}</p>
                                        </div>
                                    ) : (
                                        <p className="text-3xl font-bold">{formatPriceVND(variantPrice)}</p>
                                    )}
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
                                    {sizes.map((size) => {
                                        const available = isSizeAvailable(size);
                                        return (
                                            <button
                                                key={size}
                                                onClick={() => available && setSelectedSize(size)}
                                                disabled={!available}
                                                className={`h-12 rounded-lg font-bold text-sm transition-all relative overflow-hidden ${selectedSize === size
                                                    ? 'border border-[#d411d4] bg-[#d411d4]/10 text-[#d411d4]'
                                                    : available
                                                        ? 'border border-[#482348] hover:border-[#d411d4] hover:text-[#d411d4]'
                                                        : 'border border-[#482348]/30 text-gray-600 bg-[#2d162d]/50 cursor-not-allowed opacity-50'
                                                    }`}
                                            >
                                                {size}
                                                {!available && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-full border-t border-gray-600/50 -rotate-45"></div>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ... (Actions) ... */}
                            <div className="flex gap-4 pt-4">
                                <div className="w-32 relative">
                                    <div className="flex items-center justify-between w-full h-14 px-4 rounded-lg border border-[#482348]">
                                        <button
                                            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                                            className="hover:text-[#d411d4] transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">remove</span>
                                        </button>
                                        <span className="font-bold">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity((prev) => Math.max(1, Math.min(prev + 1, maxSelectableQuantity)))}
                                            className="hover:text-[#d411d4] transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddToCart}
                                    disabled={adding || !isSelectionAvailable}
                                    className="flex-1 h-14 bg-[#d411d4] hover:bg-[#b00eb0] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-bold text-lg tracking-wide transition-all shadow-lg shadow-[#d411d4]/25 flex items-center justify-center gap-2"
                                >
                                    {adding ? 'Adding...' : 'Add to Bag'}
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>
                            {actionError && <p className="text-red-300 text-sm">{actionError}</p>}
                            {!actionError && !isSelectionAvailable && (
                                <p className="text-amber-300 text-sm">Combination of color/size is unavailable.</p>
                            )}
                            {isSelectionAvailable && (
                                <p className="text-xs text-[#c992c9]">
                                    Available stock: {availableStock === null ? 'Unlimited' : availableStock}
                                </p>
                            )}

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

                {/* Related Products */}
                {(relatedLoading || categoryId) && (
                    <section className="mt-24">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold">Related Products</h3>
                            {categoryId && (
                                <Link
                                    to={`/products?category_id=${categoryId}`}
                                    className="text-sm text-[#d411d4] font-bold hover:text-white transition-colors"
                                >
                                    View category
                                </Link>
                            )}
                        </div>
                        {relatedLoading ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {Array(4).fill(0).map((_, idx) => (
                                    <div key={idx} className="rounded-xl border border-[#482348] bg-[#2d162d] p-4 animate-pulse">
                                        <div className="aspect-[3/4] bg-white/10 rounded-lg mb-4"></div>
                                        <div className="h-4 bg-white/10 rounded mb-2"></div>
                                        <div className="h-4 bg-white/10 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : relatedProducts.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {relatedProducts.map((item) => {
                                    const price = item.sale_price || item.base_price || 0;
                                    const hasDiscount = item.discount_percent && item.discount_percent > 0;
                                    return (
                                        <Link
                                            key={item.product_id}
                                            to={`/product/${item.product_id}`}
                                            className="group relative rounded-xl overflow-hidden border border-[#482348] bg-[#2d162d] hover:border-[#d411d4]/50 transition-all shadow-lg shadow-[#d411d4]/5"
                                        >
                                            <div className="aspect-[3/4] w-full bg-[#1a0d1a] overflow-hidden">
                                                {item.thumbnail ? (
                                                    <img
                                                        src={item.thumbnail}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[#c992c9] text-sm">
                                                        No image
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 flex flex-col gap-2">
                                                <h4 className="font-bold text-white leading-tight group-hover:text-[#d411d4] transition-colors line-clamp-2">
                                                    {item.name}
                                                </h4>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="font-bold text-[#d411d4]">{formatPriceVND(price)}</span>
                                                    {hasDiscount && (
                                                        <span className="text-gray-500 line-through">{formatPriceVND(item.base_price)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-[#c992c9]">No related products found in this category.</p>
                        )}
                    </section>
                )}

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
