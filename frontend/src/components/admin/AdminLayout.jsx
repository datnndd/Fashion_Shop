import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

    const navItems = [
        { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard', exact: true },
        { path: '/admin/products', icon: 'inventory_2', label: 'Products' },

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
                {/* Header */}
                <header className="sticky top-0 z-30 h-16 bg-[#0f0f1a]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        {/* Search */}
                        <div className="hidden md:flex items-center gap-2 bg-white/5 rounded-lg px-4 py-2 w-80">
                            <span className="material-symbols-outlined text-gray-400 text-[20px]">search</span>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <button className="relative text-gray-400 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#d411d4] rounded-full text-[10px] flex items-center justify-center text-white font-bold">3</span>
                        </button>

                        {/* User menu */}
                        <div className="flex items-center gap-3 cursor-pointer hover:bg-white/5 rounded-lg px-3 py-2 transition-colors">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#d411d4] to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                                A
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-medium">Admin</p>
                                <p className="text-xs text-gray-400">admin@basiccolor.com</p>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 text-[18px]">expand_more</span>
                        </div>
                    </div>
                </header>

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
