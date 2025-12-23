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

    const formatChange = (value) => {
        if (value === undefined || value === null || Number.isNaN(value)) return '0.0%';
        const prefix = value >= 0 ? '+' : '';
        return `${prefix}${value.toFixed(1)}%`;
    };

    const statsCards = [
        {
            label: 'Total Revenue',
            value: formatPriceVND(dashboardData?.total_revenue || 0),
            change: formatChange(dashboardData?.revenue_change_percent),
            positive: dashboardData?.revenue_change_percent >= 0,
            icon: 'payments'
        },
        {
            label: 'Orders',
            value: (dashboardData?.total_orders ?? 0).toString(),
            change: formatChange(dashboardData?.order_change_percent),
            positive: dashboardData?.order_change_percent >= 0,
            icon: 'shopping_bag'
        },
    ];

    // Mixed Chart Component (Revenue Line & Orders Bar)
    const MixedChart = ({ timeStats }) => {
        if (!timeStats || timeStats.length === 0) {
            return <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>;
        }

        const revenueData = timeStats.map(s => s.revenue);
        const orderData = timeStats.map(s => s.order_count);

        const maxRevenue = Math.max(...revenueData, 1);
        const maxOrders = Math.max(...orderData, 1);

        const chartHeight = 350;
        const chartWidth = 100;
        const paddingTop = 20;
        const paddingBottom = 40;
        const paddingLeft = 5;
        const paddingRight = 5;

        const chartAreaHeight = chartHeight - paddingTop - paddingBottom;
        const chartAreaWidth = chartWidth - paddingLeft - paddingRight;

        const getX = (index) => {
            return paddingLeft + (index / (timeStats.length - 1 || 1)) * chartAreaWidth;
        };

        const getYRevenue = (value) => {
            return paddingTop + ((maxRevenue - value) / maxRevenue) * chartAreaHeight;
        };

        const getYOrders = (value) => {
            return paddingTop + ((maxOrders - value) / maxOrders) * chartAreaHeight;
        };

        const gap = timeStats.length > 1 ? chartAreaWidth / (timeStats.length - 1) : chartAreaWidth;
        const barWidth = Math.min(gap * 0.6, 6);

        // Revenue Points (Line)
        const revenuePoints = timeStats.map((item, i) => ({
            x: getX(i),
            y: getYRevenue(item.revenue),
            value: item.revenue,
            label: item.label
        }));

        // Order Points (Bar)
        const orderPoints = timeStats.map((item, i) => ({
            x: getX(i),
            y: getYOrders(item.order_count),
            value: item.order_count,
            label: item.label,
            barHeight: (chartHeight - paddingBottom) - getYOrders(item.order_count)
        }));

        const createPath = (points) => {
            if (points.length === 0) return '';
            let path = `M ${points[0].x},${points[0].y}`;
            for (let i = 0; i < points.length - 1; i++) {
                const curr = points[i];
                const next = points[i + 1];
                const midX = (curr.x + next.x) / 2;
                path += ` Q ${curr.x},${curr.y} ${midX},${(curr.y + next.y) / 2}`;
                path += ` Q ${next.x},${next.y} ${next.x},${next.y}`;
            }
            return path;
        };

        return (
            <div className="h-[450px] relative">
                <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="gradient-revenue" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#d411d4', stopOpacity: 0.2 }} />
                            <stop offset="100%" style={{ stopColor: '#d411d4', stopOpacity: 0 }} />
                        </linearGradient>
                        <linearGradient id="gradient-orders" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.5 }} />
                            <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.1 }} />
                        </linearGradient>
                    </defs>

                    <line x1={paddingLeft - 2} y1={chartHeight - paddingBottom} x2={chartWidth - paddingRight + 2} y2={chartHeight - paddingBottom} stroke="#ffffff" strokeWidth="0.3" opacity="0.5" />

                    {/* Orders Bars */}
                    {orderPoints.map((point, i) => (
                        <rect key={`bar-${i}`} x={point.x - barWidth / 2} y={point.y} width={barWidth} height={point.barHeight} fill="url(#gradient-orders)" rx="1" ry="1" />
                    ))}

                    {/* Revenue Line */}
                    <path d={`${createPath(revenuePoints)} L ${revenuePoints[revenuePoints.length - 1].x},${chartHeight - paddingBottom} L ${paddingLeft},${chartHeight - paddingBottom} Z`} fill="url(#gradient-revenue)" />
                    <path d={createPath(revenuePoints)} fill="none" stroke="#d411d4" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
                </svg>

                {/* X-axis Labels */}
                <div className="flex justify-between text-xs text-gray-400 font-medium px-2 mt-2 absolute bottom-2 left-0 right-0">
                    {timeStats.filter((_, i, arr) => {
                        if (arr.length <= 7) return true;
                        if (i === 0 || i === arr.length - 1) return true;
                        const step = Math.floor(arr.length / 5);
                        return i % step === 0;
                    }).map((item, i) => <span key={i} className="text-center">{item.label}</span>)}
                </div>

                {/* Revenue Value Labels */}
                <div className="absolute inset-0 pointer-events-none">
                    {revenuePoints.map((point, i) => (
                        <div
                            key={`rev-label-${i}`}
                            className="absolute -translate-x-1/2 -translate-y-full text-[11px] bg-[#1a1a2e] text-white px-2 py-1 rounded border border-[#d411d4]/40 shadow-md whitespace-nowrap"
                            style={{
                                left: `${(point.x / chartWidth) * 100}%`,
                                top: `${Math.max(0, ((point.y - 8) / chartHeight) * 100)}%`
                            }}
                        >
                            {formatPriceVND(point.value)}
                        </div>
                    ))}
                </div>

                {/* Revenue Points Interaction */}
                <div className="absolute inset-0 pointer-events-none">
                    {revenuePoints.map((point, i) => (
                        <div key={`rev-${i}`}
                            className="group absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-[#1a1a2e] border-2 border-[#d411d4] hover:scale-125 transition-transform cursor-pointer pointer-events-auto flex items-center justify-center"
                            style={{ left: `${(point.x / chartWidth) * 100}%`, top: `${(point.y / chartHeight) * 100}%` }}>
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg">
                                {formatPriceVND(point.value)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Bars Interaction */}
                <div className="absolute inset-0 pointer-events-none">
                    {orderPoints.map((point, i) => (
                        <div key={`ord-${i}`}
                            className="group absolute hover:bg-white/5 transition-colors cursor-pointer pointer-events-auto flex justify-center items-start"
                            style={{
                                left: `${((point.x - barWidth / 2) / chartWidth) * 100}%`,
                                top: `${(point.y / chartHeight) * 100}%`,
                                width: `${(barWidth / chartWidth) * 100}%`,
                                height: `${(point.barHeight / chartHeight) * 100}%`
                            }}>
                            <div className="absolute bottom-full mb-2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg">
                                {point.value} Orders
                            </div>
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-[#d411d4]"></div>
                        <span className="text-sm text-gray-400">Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-blue-500"></div>
                        <span className="text-sm text-gray-400">Orders</span>
                    </div>
                </div>
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

            {/* Combined Chart Section */}
            <div className="bg-[#1a1a2e] rounded-xl border border-white/5 p-6">
                <h2 className="text-lg font-bold mb-6">Revenue & Orders Overview</h2>
                <MixedChart timeStats={dashboardData?.time_stats} />
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
