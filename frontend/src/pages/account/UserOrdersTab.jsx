import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI, cartAPI } from '../../services/api';
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'confirmed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'processing': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
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
            case 'processing': return 'inventory';
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

    useEffect(() => {
        if (location.state?.newOrderId) {
            setExpandedOrder(location.state.newOrderId);
        }
    }, [location.state?.newOrderId]);

    const statusFilters = [
        { value: 'all', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'processing', label: 'Processing' },
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

    return (
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
                                    <span className="flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm border border-[#4a2b4a] text-gray-200 bg-[#3d2b3d]/40">
                                        <span className="material-symbols-outlined text-base text-[#d411d4]">{paymentMeta.icon}</span>
                                        <span>{paymentMeta.label}</span>
                                    </span>
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
                                        <div key={idx} className="flex items-center justify-between py-2 border-b border-[#4a2b4a]/30 last:border-0">
                                            <div className="flex-1">
                                                <p className="text-white">{item.product_name}</p>
                                                {item.variant_attributes_snapshot && (
                                                    <p className="text-sm text-gray-400">
                                                        {Object.entries(item.variant_attributes_snapshot).map(([key, value]) => `${key}: ${value}`).join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-300">x{item.quantity}</p>
                                                <p className="text-[#d411d4] font-medium">{formatPriceVND(item.total_price)}</p>
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
    );
};

export default UserOrdersTab;
