import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Dashboard.module.css';

// Mock data
const mockStats = [
    { id: 1, label: 'Doanh thu tháng', value: '125.5M', icon: '💰', change: '+12.5%', positive: true },
    { id: 2, label: 'Đơn hàng', value: '1,234', icon: '📦', change: '+8.2%', positive: true },
    { id: 3, label: 'Sản phẩm', value: '456', icon: '👕', change: '+3', positive: true },
    { id: 4, label: 'Khách hàng', value: '2,890', icon: '👥', change: '+156', positive: true },
];

const mockOrders = [
    { id: '#ORD-001', customer: 'Nguyễn Văn A', product: 'Basic Tee - Đen', amount: '450,000₫', status: 'Hoàn thành', date: '10/12/2025' },
    { id: '#ORD-002', customer: 'Trần Thị B', product: 'Basic Hoodie - Trắng', amount: '850,000₫', status: 'Đang giao', date: '10/12/2025' },
    { id: '#ORD-003', customer: 'Lê Văn C', product: 'Basic Polo - Navy', amount: '550,000₫', status: 'Chờ xử lý', date: '09/12/2025' },
    { id: '#ORD-004', customer: 'Phạm Thị D', product: 'Basic Tee - Beige', amount: '450,000₫', status: 'Hoàn thành', date: '09/12/2025' },
    { id: '#ORD-005', customer: 'Hoàng Văn E', product: 'Basic Shirt - Olive', amount: '650,000₫', status: 'Đã hủy', date: '08/12/2025' },
];

const mockProducts = [
    { id: 1, name: 'Basic Tee', stock: 150, sold: 423, revenue: '190M' },
    { id: 2, name: 'Basic Hoodie', stock: 80, sold: 312, revenue: '265M' },
    { id: 3, name: 'Basic Polo', stock: 120, sold: 289, revenue: '159M' },
    { id: 4, name: 'Basic Shirt', stock: 95, sold: 198, revenue: '129M' },
];

const menuItems = [
    { id: 'overview', label: 'Tổng quan', icon: '📊' },
    { id: 'products', label: 'Sản phẩm', icon: '👕' },
    { id: 'orders', label: 'Đơn hàng', icon: '📦' },
    { id: 'customers', label: 'Khách hàng', icon: '👥' },
    { id: 'analytics', label: 'Phân tích', icon: '📈' },
    { id: 'settings', label: 'Cài đặt', icon: '⚙️' },
];

function Dashboard() {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const getStatusClass = (status) => {
        switch (status) {
            case 'Hoàn thành': return styles.statusComplete;
            case 'Đang giao': return styles.statusShipping;
            case 'Chờ xử lý': return styles.statusPending;
            case 'Đã hủy': return styles.statusCanceled;
            default: return '';
        }
    };

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
                <div className={styles.sidebarHeader}>
                    <Link to="/" className={styles.logo}>
                        <span className={styles.logoIcon}>●</span>
                        {sidebarOpen && <span className={styles.logoText}>BASIC COLOR</span>}
                    </Link>
                    <button
                        className={styles.toggleBtn}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                </div>

                <nav className={styles.nav}>
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`${styles.navItem} ${activeMenu === item.id ? styles.navItemActive : ''}`}
                            onClick={() => setActiveMenu(item.id)}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            {sidebarOpen && <span className={styles.navLabel}>{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>AD</div>
                        {sidebarOpen && (
                            <div className={styles.userDetails}>
                                <span className={styles.userName}>Admin Demo</span>
                                <span className={styles.userRole}>Quản trị viên</span>
                            </div>
                        )}
                    </div>
                    <button
                        className={styles.logoutBtn}
                        onClick={() => navigate('/login')}
                    >
                        {sidebarOpen ? 'Đăng xuất' : '🚪'}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                {/* Header */}
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.pageTitle}>
                            {menuItems.find(m => m.id === activeMenu)?.label}
                        </h1>
                        <p className={styles.pageSubtitle}>Chào mừng trở lại, Admin Demo!</p>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.notifBtn}>
                            🔔
                            <span className={styles.notifBadge}>3</span>
                        </button>
                        <button className={styles.addBtn}>
                            + Thêm mới
                        </button>
                    </div>
                </header>

                {/* Stats Cards */}
                <section className={styles.statsGrid}>
                    {mockStats.map((stat, index) => (
                        <motion.div
                            key={stat.id}
                            className={styles.statCard}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className={styles.statIcon}>{stat.icon}</div>
                            <div className={styles.statContent}>
                                <span className={styles.statLabel}>{stat.label}</span>
                                <span className={styles.statValue}>{stat.value}</span>
                                <span className={`${styles.statChange} ${stat.positive ? styles.positive : styles.negative}`}>
                                    {stat.change}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </section>

                {/* Charts Row */}
                <section className={styles.chartsRow}>
                    {/* Revenue Chart */}
                    <motion.div
                        className={styles.chartCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className={styles.chartHeader}>
                            <h3 className={styles.chartTitle}>Doanh thu 7 ngày gần nhất</h3>
                            <select className={styles.chartSelect}>
                                <option>7 ngày</option>
                                <option>30 ngày</option>
                                <option>3 tháng</option>
                            </select>
                        </div>
                        <div className={styles.chartArea}>
                            {/* Mock bar chart */}
                            <div className={styles.barChart}>
                                {[65, 45, 80, 55, 90, 70, 85].map((height, i) => (
                                    <div key={i} className={styles.barGroup}>
                                        <motion.div
                                            className={styles.bar}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                                        />
                                        <span className={styles.barLabel}>
                                            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][i]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Top Products */}
                    <motion.div
                        className={styles.productsCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h3 className={styles.chartTitle}>Sản phẩm bán chạy</h3>
                        <div className={styles.productsList}>
                            {mockProducts.map((product, index) => (
                                <div key={product.id} className={styles.productItem}>
                                    <span className={styles.productRank}>#{index + 1}</span>
                                    <div className={styles.productInfo}>
                                        <span className={styles.productName}>{product.name}</span>
                                        <span className={styles.productStats}>
                                            Đã bán: {product.sold} | Doanh thu: {product.revenue}
                                        </span>
                                    </div>
                                    <div className={styles.productStock}>
                                        Kho: {product.stock}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                {/* Recent Orders */}
                <motion.section
                    className={styles.ordersSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>Đơn hàng gần đây</h3>
                        <button className={styles.viewAllBtn}>Xem tất cả →</button>
                    </div>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Mã đơn</th>
                                    <th>Khách hàng</th>
                                    <th>Sản phẩm</th>
                                    <th>Giá trị</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockOrders.map(order => (
                                    <tr key={order.id}>
                                        <td className={styles.orderId}>{order.id}</td>
                                        <td>{order.customer}</td>
                                        <td>{order.product}</td>
                                        <td className={styles.orderAmount}>{order.amount}</td>
                                        <td>
                                            <span className={`${styles.status} ${getStatusClass(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className={styles.orderDate}>{order.date}</td>
                                        <td>
                                            <button className={styles.actionBtn}>•••</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.section>
            </main>
        </motion.div>
    );
}

export default Dashboard;
