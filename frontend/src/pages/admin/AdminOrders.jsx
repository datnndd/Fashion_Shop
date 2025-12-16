import { useState } from 'react';

const AdminOrders = () => {
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Mock orders data
    const orders = [
        { id: 'ORD-001', customer: 'Sarah M.', email: 'sarah@email.com', items: 3, total: '$245.00', status: 'Processing', date: 'Dec 16, 2024', address: '123 Main St, New York, NY 10001' },
        { id: 'ORD-002', customer: 'James K.', email: 'james@email.com', items: 1, total: '$120.00', status: 'Shipped', date: 'Dec 16, 2024', address: '456 Oak Ave, Los Angeles, CA 90001' },
        { id: 'ORD-003', customer: 'Emily R.', email: 'emily@email.com', items: 2, total: '$89.00', status: 'Delivered', date: 'Dec 15, 2024', address: '789 Pine Blvd, Chicago, IL 60601' },
        { id: 'ORD-004', customer: 'Marcus T.', email: 'marcus@email.com', items: 4, total: '$312.00', status: 'Pending', date: 'Dec 15, 2024', address: '321 Elm St, Miami, FL 33101' },
        { id: 'ORD-005', customer: 'Alex P.', email: 'alex@email.com', items: 1, total: '$55.00', status: 'Delivered', date: 'Dec 14, 2024', address: '654 Cedar Ln, Seattle, WA 98101' },
        { id: 'ORD-006', customer: 'Lisa W.', email: 'lisa@email.com', items: 2, total: '$175.00', status: 'Cancelled', date: 'Dec 14, 2024', address: '987 Birch Dr, Austin, TX 78701' },
    ];

    const statusColors = {
        'Pending': 'bg-yellow-500/20 text-yellow-400',
        'Processing': 'bg-blue-500/20 text-blue-400',
        'Shipped': 'bg-purple-500/20 text-purple-400',
        'Delivered': 'bg-green-500/20 text-green-400',
        'Cancelled': 'bg-red-500/20 text-red-400',
    };

    const filteredOrders = selectedStatus
        ? orders.filter(o => o.status === selectedStatus)
        : orders;

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
                {['', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
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
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium">{order.id}</td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium">{order.customer}</p>
                                            <p className="text-sm text-gray-400">{order.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{order.items}</td>
                                    <td className="px-6 py-4 font-medium">{order.total}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[order.status]}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{order.date}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                                            </button>
                                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                                                <span className="material-symbols-outlined text-[18px]">print</span>
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
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <span className={`px-3 py-1 rounded text-sm font-medium ${statusColors[selectedOrder.status]}`}>
                                    {selectedOrder.status}
                                </span>
                                <select className="bg-white/5 rounded-lg px-4 py-2 text-sm border-none outline-none cursor-pointer">
                                    <option>Update Status</option>
                                    <option>Processing</option>
                                    <option>Shipped</option>
                                    <option>Delivered</option>
                                    <option>Cancelled</option>
                                </select>
                            </div>

                            {/* Customer info */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-400 mb-2">Customer</h3>
                                    <p className="font-medium">{selectedOrder.customer}</p>
                                    <p className="text-sm text-gray-400">{selectedOrder.email}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-400 mb-2">Shipping Address</h3>
                                    <p className="text-sm">{selectedOrder.address}</p>
                                </div>
                            </div>

                            {/* Order items */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-400 mb-3">Order Items</h3>
                                <div className="bg-white/5 rounded-lg p-4 space-y-3">
                                    {[...Array(selectedOrder.items)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[#d411d4]/20 rounded-lg"></div>
                                            <div className="flex-1">
                                                <p className="font-medium">Product Item {i + 1}</p>
                                                <p className="text-sm text-gray-400">Size: M / Color: Pink</p>
                                            </div>
                                            <p className="font-medium">${(parseFloat(selectedOrder.total.replace('$', '')) / selectedOrder.items).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <span className="font-medium">Total</span>
                                <span className="text-xl font-bold">{selectedOrder.total}</span>
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">print</span>
                                Print Invoice
                            </button>
                            <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 bg-[#d411d4] hover:bg-[#b00eb0] rounded-lg text-sm font-medium transition-colors">
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
