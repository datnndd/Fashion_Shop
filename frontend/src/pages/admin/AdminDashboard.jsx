import { useState, useEffect } from 'react';
import { formatPriceVND } from '../../utils/currency';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../../services/api';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('day');
    // Default to current date/month/year
    const today = new Date();
    const getDefaultDate = (p) => {
        if (p === 'day') return today.toISOString().split('T')[0]; // YYYY-MM-DD
        if (p === 'month') return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
        return today.getFullYear().toString(); // YYYY
    };
    const [selectedDate, setSelectedDate] = useState(getDefaultDate('day'));
    const [dashboardData, setDashboardData] = useState(null);
    const [exportLoading, setExportLoading] = useState(false);

    // Update selectedDate when period changes
    useEffect(() => {
        setSelectedDate(getDefaultDate(period));
    }, [period]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const data = await dashboardAPI.getStats(period, selectedDate || null, null);
                setDashboardData(data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [period, selectedDate]);

    const handleExport = async (type) => {
        try {
            setExportLoading(true);
            if (type === 'excel') {
                await dashboardAPI.exportExcel(period, selectedDate || null, null);
            } else {
                await dashboardAPI.exportPdf(period, selectedDate || null, null);
            }
        } catch (error) {
            alert('Export failed: ' + error.message);
        } finally {
            setExportLoading(false);
        }
    };

    const statsCards = [
        {
            label: 'Total Revenue',
            value: formatPriceVND(dashboardData?.total_revenue || 0),
            change: `${dashboardData?.revenue_change_percent >= 0 ? '+' : ''}${dashboardData?.revenue_change_percent.toFixed(1)}%`,
            positive: dashboardData?.revenue_change_percent >= 0,
            icon: 'payments'
        },
        {
            label: 'Orders',
            value: dashboardData?.total_orders.toString() || '0',
            change: `${dashboardData?.order_change_percent >= 0 ? '+' : ''}${dashboardData?.order_change_percent.toFixed(1)}%`,
            positive: dashboardData?.order_change_percent >= 0,
            icon: 'shopping_bag'
        },
    ];

    // Simple Bar Chart Component
    const Chart = ({ data, color }) => {
        if (!data || data.length === 0) return <div className="h-48 flex items-center justify-center text-gray-500">No data available</div>;

        const maxValue = Math.max(...data.map(d => d.value)) || 1;

        return (
            <div className="h-48 flex items-end gap-2 px-2">
                {data.map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                        <div
                            className={`w-full rounded-t-sm transition-all duration-500 ${color}`}
                            style={{ height: `${(item.value / maxValue) * 100}%` }}
                        >
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {period === 'day' ? item.label : item.label} : {item.value.toLocaleString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (loading && !dashboardData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d411d4]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-gray-400 mt-1">Business performance metrics and analysis.</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex bg-[#1a1a2e] p-1 rounded-lg border border-white/5 mr-2">
                        {['day', 'month', 'year'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${period === p ? 'bg-[#d411d4] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 bg-[#1a1a2e] p-2 rounded-lg border border-white/5">
                        {period === 'day' && (
                            <>
                                <label className="text-xs text-gray-400">Ngày:</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="bg-transparent text-sm text-white border-none outline-none cursor-pointer"
                                />
                            </>
                        )}
                        {period === 'month' && (
                            <>
                                <label className="text-xs text-gray-400">Tháng:</label>
                                <input
                                    type="month"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="bg-transparent text-sm text-white border-none outline-none cursor-pointer"
                                />
                            </>
                        )}
                        {period === 'year' && (
                            <>
                                <label className="text-xs text-gray-400">Năm:</label>
                                <select
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="bg-transparent text-sm text-white border-none outline-none cursor-pointer"
                                >
                                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                        <option key={year} value={year} className="bg-[#1a1a2e]">{year}</option>
                                    ))}
                                </select>
                            </>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleExport('excel')}
                            disabled={exportLoading}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[18px]">table_view</span>
                            Excel
                        </button>
                        <button
                            onClick={() => handleExport('pdf')}
                            disabled={exportLoading}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                            PDF
                        </button>
                    </div>
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

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1a1a2e] rounded-xl border border-white/5 p-6">
                    <h2 className="text-lg font-bold mb-6">Revenue</h2>
                    <Chart
                        data={dashboardData?.time_stats?.map(s => ({ label: s.label, value: s.revenue }))}
                        color="bg-[#d411d4]"
                    />
                    <div className="mt-4 flex justify-between text-[10px] text-gray-500 overflow-hidden">
                        {dashboardData?.time_stats?.filter((_, i, arr) => i === 0 || i === arr.length - 1 || i === Math.floor(arr.length / 2)).map((s, i) => (
                            <span key={i}>{s.label}</span>
                        ))}
                    </div>
                </div>
                <div className="bg-[#1a1a2e] rounded-xl border border-white/5 p-6">
                    <h2 className="text-lg font-bold mb-6">Orders</h2>
                    <Chart
                        data={dashboardData?.time_stats?.map(s => ({ label: s.label, value: s.order_count }))}
                        color="bg-blue-500"
                    />
                    <div className="mt-4 flex justify-between text-[10px] text-gray-500 overflow-hidden">
                        {dashboardData?.time_stats.filter((_, i, arr) => i === 0 || i === arr.length - 1 || i === Math.floor(arr.length / 2)).map((s, i) => (
                            <span key={i}>{s.label}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Products Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Best Sellers */}
                <div className="bg-[#1a1a2e] rounded-xl border border-white/5">
                    <div className="p-6 border-b border-white/5">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-400">trending_up</span>
                            Top 5 Best Sellers
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-400 border-b border-white/5">
                                    <th className="px-6 py-4 font-medium">Rank</th>
                                    <th className="px-6 py-4 font-medium">Product</th>
                                    <th className="px-6 py-4 font-medium">Sold</th>
                                    <th className="px-6 py-4 font-medium">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardData?.top_best_sellers.map((product, i) => (
                                    <tr key={product.product_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="w-6 h-6 flex items-center justify-center bg-green-500/20 text-green-400 text-xs font-bold rounded">
                                                {i + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">{product.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-300">{product.total_sold}</td>
                                        <td className="px-6 py-4 text-sm font-medium">{formatPriceVND(product.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Worst Sellers */}
                <div className="bg-[#1a1a2e] rounded-xl border border-white/5">
                    <div className="p-6 border-b border-white/5">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-400">trending_down</span>
                            Top 5 Unsold Products
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-400 border-b border-white/5">
                                    <th className="px-6 py-4 font-medium">Rank</th>
                                    <th className="px-6 py-4 font-medium">Product</th>
                                    <th className="px-6 py-4 font-medium">Sold</th>
                                    <th className="px-6 py-4 font-medium">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardData?.top_worst_sellers.map((product, i) => (
                                    <tr key={product.product_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="w-6 h-6 flex items-center justify-center bg-red-500/20 text-red-400 text-xs font-bold rounded">
                                                {i + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">{product.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-300">{product.total_sold}</td>
                                        <td className="px-6 py-4 text-sm font-medium">{formatPriceVND(product.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
