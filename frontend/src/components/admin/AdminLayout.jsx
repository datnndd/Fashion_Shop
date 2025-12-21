import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

    const navItems = [
        { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard', exact: true },
        { path: '/admin/products', icon: 'inventory_2', label: 'Products' },
        { path: '/admin/categories', icon: 'category', label: 'Categories' },
        { path: '/admin/orders', icon: 'shopping_cart', label: 'Orders' },
        { path: '/admin/users', icon: 'group', label: 'Users' },
        { path: '/admin/reviews', icon: 'reviews', label: 'Reviews' },
    ];

    const isActive = (item) => {
        if (item.exact) {
            return location.pathname === item.path;
        }
        return location.pathname.startsWith(item.path);
    };

    return (
        <div className="min-h-screen bg-[#0f0f1a] text-white font-[Space_Grotesk]">
            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-40 h-screen transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} bg-[#1a1a2e] border-r border-white/10`}
                style={{ width: sidebarOpen ? '260px' : '0' }}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
                    <Link to="/admin" className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#d411d4]" style={{ fontVariationSettings: "'FILL' 1" }}>hexagon</span>
                        <span className="text-xl font-bold">Admin</span>
                    </Link>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(item)
                                ? 'bg-[#d411d4]/20 text-[#d411d4] border-l-2 border-[#d411d4]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Bottom section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                    <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                        <span className="material-symbols-outlined text-[20px]">storefront</span>
                        <span className="font-medium">View Store</span>
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <div className={`transition-all ${sidebarOpen ? 'lg:ml-[260px]' : 'ml-0'}`}>
                {/* Header removed as per request */}

                {/* Page content */}

                {/* Page content */}
                <main className="p-6">
                    <Outlet />
                </main>
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminLayout;
