import { useState } from 'react';

const AdminReviews = () => {
    const [filterStatus, setFilterStatus] = useState('');

    // Mock reviews data
    const [reviews, setReviews] = useState([
        { id: 1, product: 'Neon Oversized Knit', customer: 'Sarah M.', rating: 5, title: 'Perfect fit!', content: 'This hoodie exceeded my expectations. The fabric is so soft and the color is vibrant just like the photos.', date: 'Dec 15, 2024', status: 'Approved' },
        { id: 2, product: 'Urban Tee - Magenta', customer: 'James K.', rating: 4, title: 'Great quality', content: 'Really nice t-shirt, fits well. Would love more color options.', date: 'Dec 14, 2024', status: 'Pending' },
        { id: 3, product: 'Tech Fleece Zip', customer: 'Emily R.', rating: 5, title: 'Love it!', content: 'Super comfortable and looks amazing. Getting compliments everywhere I go!', date: 'Dec 13, 2024', status: 'Approved' },
        { id: 4, product: 'Core Hoodie', customer: 'Marcus T.', rating: 2, title: 'Sizing issues', content: 'The hoodie runs small. Had to return for a larger size.', date: 'Dec 12, 2024', status: 'Pending' },
        { id: 5, product: 'Summer Linen Shirt', customer: 'Alex P.', rating: 5, title: 'Perfect for summer', content: 'Light and breathable, exactly what I needed for the warm weather.', date: 'Dec 11, 2024', status: 'Approved' },
    ]);

    const handleApprove = (id) => {
        setReviews(reviews.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
    };

    const handleReject = (id) => {
        setReviews(reviews.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
    };

    const filteredReviews = filterStatus
        ? reviews.filter(r => r.status === filterStatus)
        : reviews;

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span
                key={i}
                className="material-symbols-outlined text-[16px]"
                style={{
                    fontVariationSettings: i < rating ? "'FILL' 1" : "'FILL' 0",
                    color: i < rating ? '#f59e0b' : '#4b5563'
                }}
            >
                star
            </span>
        ));
    };

    const statusColors = {
        'Pending': 'bg-yellow-500/20 text-yellow-400',
        'Approved': 'bg-green-500/20 text-green-400',
        'Rejected': 'bg-red-500/20 text-red-400',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Reviews</h1>
                    <p className="text-gray-400 mt-1">Moderate customer reviews</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Pending reviews:</span>
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm font-medium">
                        {reviews.filter(r => r.status === 'Pending').length}
                    </span>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2">
                {['', 'Pending', 'Approved', 'Rejected'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === status
                                ? 'bg-[#d411d4] text-white'
                                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {status || 'All Reviews'}
                    </button>
                ))}
            </div>

            {/* Reviews list */}
            <div className="space-y-4">
                {filteredReviews.map((review) => (
                    <div key={review.id} className="bg-[#1a1a2e] rounded-xl border border-white/5 p-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#d411d4] to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                                            {review.customer.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="font-medium">{review.customer}</p>
                                            <p className="text-sm text-gray-400">{review.date}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[review.status]}`}>
                                        {review.status}
                                    </span>
                                </div>

                                {/* Product */}
                                <p className="text-sm text-[#d411d4] mb-2">{review.product}</p>

                                {/* Rating */}
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex">{renderStars(review.rating)}</div>
                                    <span className="text-sm text-gray-400">({review.rating}/5)</span>
                                </div>

                                {/* Content */}
                                <h3 className="font-medium mb-1">{review.title}</h3>
                                <p className="text-gray-400 text-sm">{review.content}</p>
                            </div>

                            {/* Actions */}
                            {review.status === 'Pending' && (
                                <div className="flex gap-2 md:flex-col">
                                    <button
                                        onClick={() => handleApprove(review.id)}
                                        className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">check</span>
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(review.id)}
                                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredReviews.length === 0 && (
                <div className="bg-[#1a1a2e] rounded-xl border border-white/5 p-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-gray-500 mb-4">reviews</span>
                    <p className="text-gray-400">No reviews found</p>
                </div>
            )}
        </div>
    );
};

export default AdminReviews;
