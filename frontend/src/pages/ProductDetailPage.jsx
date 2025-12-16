import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';

const ProductDetailPage = () => {
    const { id } = useParams();
    const [selectedColor, setSelectedColor] = useState(0);
    const [selectedSize, setSelectedSize] = useState('M');
    const [quantity, setQuantity] = useState(1);

    const colors = [
        { name: 'Electric Magenta', value: '#d411d4' },
        { name: 'Void Black', value: '#222222' },
        { name: 'Pure White', value: '#f0f0f0' },
        { name: 'Cyber Teal', value: '#00bcd4' },
        { name: 'Acid Lime', value: '#cddc39' },
    ];

    const sizes = ['S', 'M', 'L', 'XL'];

    const reviews = [
        {
            id: 1,
            rating: 5,
            author: 'Sarah M.',
            date: 'December 10, 2024',
            verified: true,
            title: 'Perfect fit and amazing quality!',
            content: 'This hoodie exceeded my expectations. The fabric is so soft and the color is vibrant just like the photos. I\'m 5\'6" and ordered a medium - fits perfectly with a nice relaxed feel.',
            size: 'M',
            helpful: 24
        },
        {
            id: 2,
            rating: 5,
            author: 'James K.',
            date: 'December 5, 2024',
            verified: true,
            title: 'My new favorite hoodie',
            content: 'Absolutely love the quality and the bold color. It\'s become my go-to hoodie. The heavyweight fabric keeps me warm without being too bulky.',
            size: 'L',
            helpful: 18
        },
        {
            id: 3,
            rating: 4,
            author: 'Emily R.',
            date: 'November 28, 2024',
            verified: true,
            title: 'Great but runs slightly large',
            content: 'Beautiful hoodie with excellent construction. Only giving 4 stars because it runs a bit larger than expected. I usually wear medium but should have ordered small for a more fitted look.',
            size: 'M',
            helpful: 12
        },
        {
            id: 4,
            rating: 5,
            author: 'Marcus T.',
            date: 'November 20, 2024',
            verified: true,
            title: 'Premium quality, worth every penny',
            content: 'The attention to detail is incredible. From the stitching to the weight of the fabric, everything screams premium. The magenta color is even better in person!',
            size: 'L',
            helpful: 31
        },
        {
            id: 5,
            rating: 5,
            author: 'Alex P.',
            date: 'November 15, 2024',
            verified: false,
            title: 'Best hoodie I\'ve ever owned',
            content: 'I\'ve been searching for the perfect hoodie for years and finally found it. The fit is relaxed but not sloppy, and the color makes such a statement.',
            size: 'M',
            helpful: 8
        }
    ];

    return (
        <div className="bg-[#221022] text-white font-[Space_Grotesk] min-h-screen">
            {/* Breadcrumbs */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-6">
                <nav className="flex text-sm font-medium text-[#c992c9]">
                    <Link to="/" className="hover:text-[#d411d4] transition-colors">Home</Link>
                    <span className="mx-2">/</span>
                    <Link to="/collections" className="hover:text-[#d411d4] transition-colors">Men</Link>
                    <span className="mx-2">/</span>
                    <span className="text-white">The Essential Hoodie</span>
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
                                alt="Model wearing a bright magenta hoodie"
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5myVFQ4nV3j4md9ocmedDbs1Xlz-tuzfvyfw_iEwgNYfGro_GiZ3BlZDDZJzAhvraUJQdyMWRFFhuEFLf5aIlmFpWDe-xnbhjqqHOVQOD1U7YuAObVcqZS5KhKcDZ0IupU6sq23FwrEG1wIXlsHDAFThiBz2hjwuoDHZyoXS014Y3WJ6S3R7II6OknfU9tuwEhf4FSf26x9K__qFMHuXMNuQ_YtKFDVtmmon8fHUFgAZoGJTxwJ-h64ePjtp0fftXMB2w4ZCn4zQ"
                            />
                            <div className="absolute top-4 left-4 bg-[#d411d4] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                Best Seller
                            </div>
                        </div>
                        {/* Secondary Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-xl overflow-hidden bg-[#2d162d] aspect-[3/4]">
                                <img
                                    alt="Close up detail of hoodie fabric"
                                    className="h-full w-full object-cover hover:opacity-90 transition-opacity"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_iwp0F-zSeVtKKqi0Q2uf2F00AJ2gcansb_4XopeKgVLztBtilhxLPfQkqOTwZPKK4XQ8d8p4-bgezAM7mudkynd6LsBLootR1bR00Mez_zd5wAnKAd_GKmhia_eD73ECySaML6bTFGsZteiKKxud4NZF70edGpg9u7r5old0Gkt64w6fAUoz0iGsphLXZkYTgUGWKO9ouoXNU3wj3hGQ3_Majbt7QyLg4t7o9ezoDaZTqaYnCHVMSjyYgO9e8o-_CcCs9OG_Uas"
                                />
                            </div>
                            <div className="rounded-xl overflow-hidden bg-[#2d162d] aspect-[3/4]">
                                <img
                                    alt="Back view of the essential hoodie"
                                    className="h-full w-full object-cover hover:opacity-90 transition-opacity"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDmAQs1UztgR1zPgm1IXkkPvNBbhgY2QqhybhdlrvPekjBKXmBAL0epStXh3Ycd7mLkg4LXnCx8jX0a2T5xssjbyFB6zcCT6CeK3zQeQzlRBG6m6PoabsGfEJjdFYtYHREk8ZXh-Dqpc-K1EMKCUfgcoZA38I9jQ7yuM1jT8__3b6GC8rY5XYoNnJPf_0do5_4l3V-7TQGZJ5MSSifpbr6KnE1r2qbEnUnHXDIb06zGG-uK4T7EcUiSTp9i5HBn_3vB5T3DgKr87A"
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
                                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.9]">
                                        THE ESSENTIAL <br /><span className="text-[#d411d4]">HOODIE</span>
                                    </h1>
                                    <button className="p-3 rounded-full border border-[#482348] hover:border-[#d411d4] text-gray-400 hover:text-[#d411d4] transition-all">
                                        <span className="material-symbols-outlined filled">favorite</span>
                                    </button>
                                </div>
                                <div className="flex items-end gap-4">
                                    <p className="text-3xl font-bold">$120.00</p>
                                    {/* Rating */}
                                    <div className="flex items-center gap-1 mb-1.5 cursor-pointer group">
                                        <div className="flex text-[#d411d4]">
                                            {[1, 2, 3, 4].map((i) => (
                                                <span key={i} className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                            ))}
                                            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
                                        </div>
                                        <span className="text-sm text-[#c992c9] underline decoration-transparent group-hover:decoration-[#c992c9] transition-all">
                                            4.9 (124 reviews)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-[#482348]" />

                            {/* Color Selection */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold uppercase tracking-wider text-[#c992c9]">Color</span>
                                    <span className="text-sm font-bold text-[#d411d4]">{colors[selectedColor].name}</span>
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
                                Designed for the bold. The Essential Hoodie combines heavyweight organic cotton with our signature "BasicColor" vibrant dyes. A relaxed fit that maintains structure, perfect for making a statement without saying a word.
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
                                    <div className="px-4 pb-4 text-sm text-[#c992c9]">
                                        Free shipping on orders over $150. Returns accepted within 30 days of purchase in original condition.
                                    </div>
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
                            <div className="text-5xl font-bold mb-2">4.9</div>
                            <div className="flex text-[#C07B5F] mb-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <span key={i} className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                ))}
                                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
                            </div>
                            <p className="text-sm text-[#c992c9]">Based on {reviews.length} reviews</p>
                        </div>
                        <div className="flex-1 w-full">
                            {[5, 4, 3, 2, 1].map((rating) => {
                                const count = reviews.filter(r => r.rating === rating).length;
                                const percentage = (count / reviews.length) * 100;
                                return (
                                    <div key={rating} className="flex items-center gap-3 mb-2">
                                        <span className="text-sm w-8">{rating}★</span>
                                        <div className="flex-1 h-2 bg-[#221022] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#C07B5F] rounded-full transition-all"
                                                style={{ width: `${percentage}%` }}
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
                                            <h4 className="font-bold text-lg">{review.author}</h4>
                                            {review.verified && (
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
                                            <span>{review.date}</span>
                                            <span>•</span>
                                            <span>Size: {review.size}</span>
                                        </div>
                                    </div>
                                </div>

                                <h5 className="font-bold mb-2">{review.title}</h5>
                                <p className="text-gray-300 leading-relaxed mb-4">{review.content}</p>

                                <div className="flex items-center gap-4 pt-4 border-t border-[#482348]">
                                    <button className="flex items-center gap-2 text-sm text-[#c992c9] hover:text-[#C07B5F] transition-colors">
                                        <span className="material-symbols-outlined text-base">thumb_up</span>
                                        Helpful ({review.helpful})
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
                </div>
            </main>
        </div>
    );
};

export default ProductDetailPage;
