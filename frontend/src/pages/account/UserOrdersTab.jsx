import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI, cartAPI, reviewsAPI } from '../../services/api';
import { formatPriceVND } from '../../utils/currency';

const UserOrdersTab = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [actionError, setActionError] = useState('');
    const [actionOrderId, setActionOrderId] = useState(null);
    const [reviewingItem, setReviewingItem] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
    const [reviewError, setReviewError] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewedItems, setReviewedItems] = useState(new Set());

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await authAPI.getMyOrders();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        setActionError('');
        setActionOrderId(orderId);
        try {
            const updated = await authAPI.cancelMyOrder(orderId);
            setOrders((prev) => prev.map((o) => (o.order_id === orderId ? updated : o)));
        } catch (err) {
            setActionError(err.message || 'Unable to cancel this order.');
        } finally {
            setActionOrderId(null);
        }
    };

    const handleReorder = async (order) => {
        setActionError('');
        setActionOrderId(order.order_id);
        try {
            for (const item of order.items || []) {
                if (!item.product_variant_id) continue;
                await cartAPI.addItem({ product_variant_id: item.product_variant_id, quantity: item.quantity });
            }
            navigate('/cart');
        } catch (err) {
            setActionError(err.message || 'Unable to buy this order again.');
        } finally {
            setActionOrderId(null);
        }
    };

    const openReviewModal = (order, item) => {
        setReviewError('');
        setReviewForm({ rating: 5, title: '', comment: '' });
        setReviewingItem({
            orderId: order.order_id,
            orderItemId: item.order_item_id,
            productId: item.product_id,
            productName: item.product_name,
            size: item.variant_attributes_snapshot?.size || item.variant_attributes_snapshot?.size_name || null,
        });
    };

    const closeReviewModal = () => {
        setReviewingItem(null);
    };

    const handleSubmitReview = async () => {
        if (!reviewingItem) return;
        setSubmittingReview(true);
        setReviewError('');
        try {
            await reviewsAPI.create({
                product_id: reviewingItem.productId,
                order_item_id: reviewingItem.orderItemId,
                rating: reviewForm.rating,
                title: reviewForm.title || undefined,
                comment: reviewForm.comment || undefined,
                size_purchased: reviewingItem.size || undefined,
            });
            setReviewedItems((prev) => {
                const next = new Set(prev);
                next.add(reviewingItem.orderItemId);
                return next;
            });
            setReviewingItem(null);
        } catch (err) {
            setReviewError(err.message || 'Could not submit review.');
        } finally {
            setSubmittingReview(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'confirmed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'shipped': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
            case 'delivered': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return 'schedule';
            case 'confirmed': return 'check_circle';
            case 'shipped': return 'local_shipping';
            case 'delivered': return 'package_2';
            case 'cancelled': return 'cancel';
            default: return 'help';
        }
    };

    const getPaymentMethodMeta = (method) => {
        switch (method) {
            case 'cash':
                return { label: 'Cash on Delivery', icon: 'payments' };
            case 'card':
                return { label: 'Credit / Debit Card', icon: 'credit_card' };
            default:
                return { label: method || 'Unknown', icon: 'account_balance_wallet' };
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderReviewModal = () => {
        if (!reviewingItem) return null;
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="w-full max-w-lg bg-[#2d1b2d] border border-[#4a2b4a] rounded-xl shadow-2xl">
                    <div className="flex items-start justify-between p-4 border-b border-[#4a2b4a]">
                        <div>
                            <h3 className="text-xl font-bold text-white">Write a review</h3>
                            <p className="text-sm text-gray-400">{reviewingItem.productName}</p>
                            {reviewingItem.size && <p className="text-xs text-gray-500">Size: {reviewingItem.size}</p>}
                        </div>
                        <button
                            type="button"
                            onClick={closeReviewModal}
                            className="text-gray-400 hover:text-white"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="p-4 space-y-4">
                        <div>
                            <p className="text-sm text-gray-300 mb-2">Rating</p>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                                        className={`p-2 rounded-lg border ${reviewForm.rating >= star ? 'border-[#d411d4] bg-[#d411d4]/10 text-[#d411d4]' : 'border-[#4a2b4a] text-gray-300 hover:border-[#d411d4]/60'}`}
                                    >
                                        <span
                                            className="material-symbols-outlined"
                                            style={{ fontVariationSettings: `'FILL' ${reviewForm.rating >= star ? 1 : 0}` }}
                                        >
                                            star
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-gray-300">Title (optional)</label>
                            <input
                                type="text"
                                value={reviewForm.title}
                                onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                                className="mt-1 w-full rounded-lg border border-[#4a2b4a] bg-[#1a0f1a] text-white px-3 py-2 focus:border-[#d411d4] focus:outline-none"
                                placeholder="Summarize your experience"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-300">Comment</label>
                            <textarea
                                rows={4}
                                value={reviewForm.comment}
                                onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                                className="mt-1 w-full rounded-lg border border-[#4a2b4a] bg-[#1a0f1a] text-white px-3 py-2 focus:border-[#d411d4] focus:outline-none"
                                placeholder="What did you like or dislike?"
                            />
                        </div>

                        {reviewError && <p className="text-sm text-red-400">{reviewError}</p>}

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeReviewModal}
                                className="px-4 py-2 rounded-lg border border-[#4a2b4a] text-gray-200 hover:border-[#d411d4]/60 transition-colors"
                                disabled={submittingReview}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmitReview}
                                disabled={submittingReview}
                                className="px-4 py-2 rounded-lg bg-[#d411d4] text-white font-semibold hover:bg-[#b00eb0] disabled:opacity-60"
                            >
                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    useEffect(() => {
        if (location.state?.newOrderId) {
            setExpandedOrder(location.state.newOrderId);
        }
    }, [location.state?.newOrderId]);

    const statusFilters = [
        { value: 'all', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    const filteredOrders = statusFilter === 'all' ? orders : orders.filter((order) => order.status === statusFilter);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="material-symbols-outlined text-4xl text-[#d411d4] animate-spin">progress_activity</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                <span className="material-symbols-outlined text-4xl text-red-400 mb-2">error</span>
                <p className="text-red-400">{error}</p>
                <button onClick={fetchOrders} className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                    Try Again
                </button>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-gray-500 mb-4">shopping_bag</span>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No orders yet</h3>
                <p className="text-gray-500">Start shopping to see your orders here!</p>
            </div>
        );
    }

    const openFirstReviewForOrder = (order) => {
        setActionError('');
        const target = (order.items || []).find(
            (item) => item.product_id && !reviewedItems.has(item.order_item_id)
        );
        if (target) {
            openReviewModal(order, target);
        } else {
            setActionError('All items in this order have been reviewed.');
        }
    };

    return (
        <>
            {renderReviewModal()}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-6">My Orders</h2>

                <div className="flex flex-wrap gap-2 mb-4">
                    {statusFilters.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setStatusFilter(option.value)}
                            className={`px-3 py-1 rounded-full text-sm border transition-colors ${statusFilter === option.value
                                ? 'bg-[#d411d4]/20 border-[#d411d4] text-white'
                                : 'bg-transparent border-[#4a2b4a] text-gray-300 hover:border-[#d411d4]/50'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {actionError && <p className="text-sm text-red-400">{actionError}</p>}

                {filteredOrders.length === 0 && (
                    <div className="text-center py-8 text-gray-400 border border-dashed border-[#4a2b4a] rounded-xl">
                        No orders for this status.
                    </div>
                )}

                {filteredOrders.map((order) => {
                    const address = order.shipping_address || {};
                    const subtotalValue = order.subtotal ?? order.total_price;
                    const discountValue = order.discount_amount || 0;
                    const recipientName = address.recipient_name || order.recipient_name || 'Recipient';
                    const recipientPhone = address.recipient_phone || order.recipient_phone || '';
                    const recipientAddress = address.full_address || order.shipping_address_full || address.street || '';
                    const statusLabel = order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown';
                    const canCancel = order.status === 'pending';
                    const canReorder = ['delivered', 'completed', 'cancelled'].includes(order.status);
                    const paymentMeta = getPaymentMethodMeta(order.payment_method);
                    const reviewableItems = (order.items || []).filter((i) => i.product_id);
                    const allReviewed = reviewableItems.length > 0 && reviewableItems.every((i) => reviewedItems.has(i.order_item_id));

                    return (
                        <div key={order.order_id} className="bg-[#2d1b2d]/80 rounded-xl border border-[#4a2b4a] overflow-hidden">
                            {/* Order Header */}
                            <div
                                className="p-4 cursor-pointer hover:bg-[#3d2b3d]/50 transition-colors"
                                onClick={() => setExpandedOrder(expandedOrder === order.order_id ? null : order.order_id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="font-mono text-sm text-[#d411d4]">#{order.code}</span>
                                            <span className="text-xs text-gray-400">{formatDate(order.created_at)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                                            <span className="material-symbols-outlined text-base">{getStatusIcon(order.status)}</span>
                                            {statusLabel}
                                        </span>
                                        {canCancel && (
                                            <button
                                                className="text-sm px-3 py-1 rounded-lg border border-red-500/50 text-red-300 hover:bg-red-500/10 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCancelOrder(order.order_id);
                                                }}
                                                disabled={actionOrderId === order.order_id}
                                            >
                                                {actionOrderId === order.order_id ? 'Cancelling...' : 'Cancel order'}
                                            </button>
                                        )}
                                        {canReorder && (
                                            <button
                                                className="text-sm px-3 py-1 rounded-lg border border-[#d411d4]/50 text-white hover:bg-[#d411d4]/10 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleReorder(order);
                                                }}
                                                disabled={actionOrderId === order.order_id}
                                            >
                                                {actionOrderId === order.order_id ? 'Processing...' : 'Buy again'}
                                            </button>
                                        )}
                                        {order.status === 'delivered' && reviewableItems.length > 0 && (
                                            <button
                                                type="button"
                                                className="text-sm px-3 py-1 rounded-lg border border-[#d411d4]/60 text-white hover:bg-[#d411d4]/10 transition-colors disabled:opacity-60"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openFirstReviewForOrder(order);
                                                }}
                                                disabled={allReviewed}
                                            >
                                                {allReviewed ? 'Reviewed' : 'Review items'}
                                            </button>
                                        )}
                                        <span className="font-bold text-[#d411d4]">{formatPriceVND(order.total_price)}</span>
                                        <span className={`material-symbols-outlined transition-transform duration-300 ${expandedOrder === order.order_id ? 'rotate-180' : ''}`}>
                                            expand_more
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Details (Expandable) */}
                            {expandedOrder === order.order_id && (
                                <div className="border-t border-[#4a2b4a] p-4 bg-[#1d101d]/50">
                                    {/* Shipping Info */}
                                    <div className="mb-4 pb-4 border-b border-[#4a2b4a]/50">
                                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Shipping Address</h4>
                                        <p className="text-white">{recipientName}</p>
                                        {recipientPhone && <p className="text-gray-300">{recipientPhone}</p>}
                                        <p className="text-gray-400 text-sm">{recipientAddress || 'No address on file'}</p>
                                    </div>

                                    {/* Order Items */}
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-gray-400">Order Items</h4>
                                        {order.items?.map((item, idx) => (
                                            <div key={item.order_item_id || idx} className="flex items-center justify-between py-2 border-b border-[#4a2b4a]/30 last:border-0">
                                                <div className="flex-1">
                                                    <p className="text-white">{item.product_name}</p>
                                                    {item.variant_attributes_snapshot && (
                                                        <p className="text-sm text-gray-400">
                                                            {Object.entries(item.variant_attributes_snapshot).map(([key, value]) => `${key}: ${value}`).join(', ')}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-2">
                                                    <p className="text-gray-300">x{item.quantity}</p>
                                                    <p className="text-[#d411d4] font-medium">{formatPriceVND(item.total_price)}</p>
                                                    {order.status === 'delivered' && item.product_id && !reviewedItems.has(item.order_item_id) && (
                                                        <button
                                                            type="button"
                                                            className="text-xs px-3 py-1 rounded-lg border border-[#d411d4]/40 text-[#d411d4] hover:bg-[#d411d4]/10 transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openReviewModal(order, item);
                                                            }}
                                                        >
                                                            Write a review
                                                        </button>
                                                    )}
                                                    {order.status === 'delivered' && reviewedItems.has(item.order_item_id) && (
                                                        <span className="text-xs text-green-400">Review sent</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Summary */}
                                    <div className="mt-4 pt-4 border-t border-[#4a2b4a]/50 space-y-2">
                                        <div className="flex justify-between text-gray-400">
                                            <span>Subtotal</span>
                                            <span>{formatPriceVND(subtotalValue)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-400 items-center">
                                            <span>Payment Method</span>
                                            <span className="flex items-center gap-2 text-white">
                                                <span className="material-symbols-outlined text-base text-[#d411d4]">{paymentMeta.icon}</span>
                                                <span>{paymentMeta.label}</span>
                                            </span>
                                        </div>
                                        {discountValue > 0 && (
                                            <div className="flex justify-between text-green-400">
                                                <span>Discount</span>
                                                <span>-{formatPriceVND(discountValue)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-[#4a2b4a]/50">
                                            <span>Total</span>
                                            <span className="text-[#d411d4]">{formatPriceVND(order.total_price)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default UserOrdersTab;
