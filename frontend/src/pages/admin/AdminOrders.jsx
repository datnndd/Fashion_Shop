import { useState, useEffect } from 'react';
import { formatPriceVND } from '../../utils/currency';
import { ordersAPI } from '../../services/api';

const AdminOrders = () => {
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [tempStatus, setTempStatus] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = selectedStatus ? { status: selectedStatus } : {};
            const data = await ordersAPI.list(params);
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [selectedStatus]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await ordersAPI.updateStatus(orderId, newStatus);
            // Update local state
            setOrders(prev => prev.map(o =>
                o.order_id === orderId ? { ...o, status: newStatus } : o
            ));
            if (selectedOrder && selectedOrder.order_id === orderId) {
                setSelectedOrder(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status');
        }
    };

    const statusColors = {
        'pending': 'bg-yellow-500/20 text-yellow-400',
        'shipped': 'bg-purple-500/20 text-purple-400',
        'delivered': 'bg-green-500/20 text-green-400',
        'cancelled': 'bg-red-500/20 text-red-400',
    };




    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Orders</h1>
                    <p className="text-gray-400 mt-1">Manage customer orders</p>
                </div>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-fit">
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Export Orders
                </button>
            </div>

            {/* Status tabs */}
            <div className="flex flex-wrap gap-2">
                {['', 'pending', 'shipped', 'delivered', 'cancelled'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedStatus === status
                            ? 'bg-[#d411d4] text-white'
                            : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {status || 'All Orders'}
                    </button>
                ))}
            </div>

            {/* Orders table */}
            <div className="bg-[#1a1a2e] rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-sm text-gray-400 border-b border-white/5">
                                <th className="px-6 py-4 font-medium">Order ID</th>
                                <th className="px-6 py-4 font-medium">Customer</th>
                                <th className="px-6 py-4 font-medium">Items</th>
                                <th className="px-6 py-4 font-medium">Total</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.order_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium">{order.code || `#${order.order_id}`}</td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium">{order.recipient_name}</p>
                                            <p className="text-sm text-gray-400">{order.recipient_phone}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{order.items?.length || 0}</td>
                                    <td className="px-6 py-4 font-medium">{formatPriceVND(order.total_price)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[order.status] || 'bg-gray-500/20 text-gray-400'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a2e] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-lg font-bold">Order {selectedOrder.id}</h2>
                            <button onClick={() => {
                                setSelectedOrder(null);
                                setTempStatus('');
                            }} className="text-gray-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <span className={`px-3 py-1 rounded text-sm font-medium ${statusColors[selectedOrder.status] || 'bg-gray-500/20 text-gray-400'}`}>
                                    {selectedOrder.status}
                                </span>
                                <div className="flex items-center gap-2">
                                    <select
                                        className="bg-white/5 rounded-lg px-4 py-2 text-sm border-none outline-none cursor-pointer"
                                        value={tempStatus || selectedOrder.status}
                                        onChange={(e) => setTempStatus(e.target.value)}
                                    >
                                        <option value="pending" className="bg-[#1a1a2e]">Pending</option>
                                        <option value="shipped" className="bg-[#1a1a2e]">Shipped</option>
                                        <option value="delivered" className="bg-[#1a1a2e]">Delivered</option>
                                        <option value="cancelled" className="bg-[#1a1a2e]">Cancelled</option>
                                    </select>
                                    {tempStatus && tempStatus !== selectedOrder.status && (
                                        <button
                                            onClick={() => handleStatusUpdate(selectedOrder.order_id, tempStatus)}
                                            className="px-3 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-xs font-bold transition-colors uppercase tracking-wider"
                                        >
                                            OK
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Customer info */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-400 mb-2">Customer</h3>
                                    <p className="font-medium">{selectedOrder.recipient_name}</p>
                                    <p className="text-sm text-gray-400">{selectedOrder.recipient_phone}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-400 mb-2">Shipping Address</h3>
                                    <p className="text-sm">{selectedOrder.shipping_address_full}</p>
                                </div>
                            </div>

                            {/* Order items */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-400 mb-3">Order Items</h3>
                                <div className="bg-white/5 rounded-lg p-4 space-y-3">
                                    {selectedOrder.items?.map((item, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[#d411d4]/20 rounded-lg flex items-center justify-center">
                                                <span className="material-symbols-outlined text-white/50">inventory_2</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{item.product_name}</p>
                                                <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-medium">{formatPriceVND(item.total_price)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <span className="font-medium">Total</span>
                                <span className="text-xl font-bold">{formatPriceVND(selectedOrder.total_price)}</span>
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">print</span>
                                Print Invoice
                            </button>
                            <button onClick={() => {
                                setSelectedOrder(null);
                                setTempStatus('');
                            }} className="px-4 py-2 bg-[#d411d4] hover:bg-[#b00eb0] rounded-lg text-sm font-medium transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
