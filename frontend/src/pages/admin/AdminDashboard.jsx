import { useState, useEffect } from 'react';
import { formatPriceVND } from '../../utils/currency';
import { Link } from 'react-router-dom';
import { productsAPI, categoriesAPI, usersAPI } from '../../services/api';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        customers: 0
    });
    const [topProducts, setTopProducts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [products, categories] = await Promise.all([
                    productsAPI.list({ limit: 100 }),
                    categoriesAPI.list()
                ]);

                setStats({
                    products: products.length,
                    categories: categories.length,
                    customers: 0 // Will be fetched when users API is ready
                });

                // Get top 3 products
                setTopProducts(products.slice(0, 3));
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Stats cards data
    const statsCards = [
        { label: 'Total Revenue', value: formatPriceVND(614000000), change: '+12.5%', positive: true, icon: 'payments' },
        { label: 'Orders', value: '156', change: '+8.2%', positive: true, icon: 'shopping_bag' },
        { label: 'Products', value: stats.products.toString(), change: `${stats.products}`, positive: true, icon: 'inventory_2' },
        { label: 'Categories', value: (stats.categories || 0).toString(), change: `${stats.categories || 0}`, positive: true, icon: 'category' },
    ];

    // Mock recent orders (will be replaced with API data later)
    const recentOrders = [
        { id: 'ORD-001', customer: 'Sarah M.', items: 3, total: 6125000, status: 'Processing', date: 'Dec 16, 2024' },
        { id: 'ORD-002', customer: 'James K.', items: 1, total: 3000000, status: 'Shipped', date: 'Dec 16, 2024' },
        { id: 'ORD-003', customer: 'Emily R.', items: 2, total: 2225000, status: 'Delivered', date: 'Dec 15, 2024' },
        { id: 'ORD-004', customer: 'Marcus T.', items: 4, total: 7800000, status: 'Pending', date: 'Dec 15, 2024' },
    ];

    const statusColors = {
        'Pending': 'bg-yellow-500/20 text-yellow-400',
        'Processing': 'bg-blue-500/20 text-blue-400',
        'Shipped': 'bg-purple-500/20 text-purple-400',
        'Delivered': 'bg-green-500/20 text-green-400',
        'Cancelled': 'bg-red-500/20 text-red-400',
    };

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-gray-400 mt-1">Welcome back! Here's what's happening.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Export
                    </button>
                    <button className="px-4 py-2 bg-[#d411d4] hover:bg-[#b00eb0] rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        New Product
                    </button>
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, index) => (
                    <div key={index} className="bg-[#1a1a2e] rounded-xl p-6 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-[#d411d4]/10 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#d411d4]">{stat.icon}</span>
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded ${stat.positive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold">{stat.value}</h3>
                        <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent orders */}
                <div className="lg:col-span-2 bg-[#1a1a2e] rounded-xl border border-white/5">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-lg font-bold">Recent Orders</h2>
                        <Link to="/admin/orders" className="text-sm text-[#d411d4] hover:text-[#d411d4]/80 transition-colors">
                            View all →
                        </Link>
                    </div>
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
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium">{order.id}</td>
                                        <td className="px-6 py-4 text-gray-300">{order.customer}</td>
                                        <td className="px-6 py-4 text-gray-400">{order.items}</td>
                                        <td className="px-6 py-4 font-medium">{formatPriceVND(order.total)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[order.status]}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">{order.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick actions & Top products */}
                <div className="space-y-6">
                    {/* Quick actions */}
                    <div className="bg-[#1a1a2e] rounded-xl border border-white/5 p-6">
                        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <Link to="/admin/products" className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-[#d411d4]">add_circle</span>
                                <span className="text-sm">Add Product</span>
                            </Link>

                            <Link to="/admin/orders" className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-[#d411d4]">local_shipping</span>
                                <span className="text-sm">View Orders</span>
                            </Link>
                            <Link to="/admin/reviews" className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-[#d411d4]">rate_review</span>
                                <span className="text-sm">Reviews</span>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-[#1a1a2e] rounded-xl border border-white/5 p-6">
                        <h2 className="text-lg font-bold mb-4">Top Products</h2>
                        <div className="space-y-4">
                            {topProducts.length > 0 ? topProducts.map((product, i) => (
                                <div key={product.product_id} className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#d411d4]/20 rounded-lg flex items-center justify-center text-sm font-bold text-[#d411d4]">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{product.name}</p>
                                        <p className="text-xs text-gray-400">In stock</p>
                                    </div>
                                    <span className="text-sm font-medium">{formatPriceVND(product.base_price)}</span>
                                </div>
                            )) : (
                                <p className="text-gray-400 text-sm">No products yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
