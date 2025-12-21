import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reviewsAPI } from '../../services/api';

const AdminReviews = () => {
    const [filterStatus, setFilterStatus] = useState('');
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const data = await reviewsAPI.listAll();
            setReviews(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
            setError('Could not load reviews. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await reviewsAPI.approve(id);
            setReviews(reviews.map(r => r.review_id === id ? { ...r, is_approved: true } : r));
        } catch (err) {
            console.error('Failed to approve review:', err);
            alert('Failed to approve review');
        }
    };

    const handleReject = async (id) => {
        try {
            await reviewsAPI.reject(id);
            setReviews(reviews.map(r => r.review_id === id ? { ...r, is_approved: false } : r));
        } catch (err) {
            console.error('Failed to reject review:', err);
            alert('Failed to reject review');
        }
    };

    const getReviewStatus = (review) => {
        if (review.is_approved === true) return 'Approved';
        if (review.is_approved === false) return 'Rejected';
        return 'Pending';
    };

    const filteredReviews = filterStatus
        ? reviews.filter(r => getReviewStatus(r) === filterStatus)
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d411d4]"></div>
            </div>
        );
    }

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
                        {reviews.filter(r => r.is_approved === null).length}
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

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
                    {error}
                </div>
            )}

            {/* Reviews list */}
            <div className="space-y-4">
                {filteredReviews.map((review) => (
                    <div key={review.review_id} className="bg-[#1a1a2e] rounded-xl border border-white/5 p-6 transition-all hover:border-white/10">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#d411d4] to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                                            {review.user_name ? review.user_name.split(' ').map(n => n[0]).join('') : 'U'}
                                        </div>
                                        <div>
                                            <p className="font-medium">{review.user_name || 'Anonymous'}</p>
                                            <p className="text-sm text-gray-400">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[getReviewStatus(review)]}`}>
                                        {getReviewStatus(review)}
                                    </span>
                                </div>

                                {/* Product */}
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider">Product:</span>
                                    <Link
                                        to={`/product/${review.product_slug}`}
                                        className="text-sm text-[#d411d4] hover:underline flex items-center gap-1"
                                    >
                                        {review.product_name}
                                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                    </Link>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex">{renderStars(review.rating)}</div>
                                    <span className="text-sm text-gray-400">({review.rating}/5)</span>
                                </div>

                                {/* Content */}
                                <h3 className="font-medium mb-1">{review.title}</h3>
                                <p className="text-gray-400 text-sm whitespace-pre-wrap">{review.comment}</p>
                            </div>

                            {/* Actions */}
                            {review.is_approved === null && (
                                <div className="flex gap-2 md:flex-col">
                                    <button
                                        onClick={() => handleApprove(review.review_id)}
                                        className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">check</span>
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(review.review_id)}
                                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                        Reject
                                    </button>
                                </div>
                            )}

                            {/* Re-moderate button if already moderated */}
                            {review.is_approved !== null && (
                                <div className="flex gap-2 md:flex-col">
                                    <button
                                        onClick={() => review.is_approved ? handleReject(review.review_id) : handleApprove(review.review_id)}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">
                                            {review.is_approved ? 'close' : 'check'}
                                        </span>
                                        {review.is_approved ? 'Reject' : 'Approve'}
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
