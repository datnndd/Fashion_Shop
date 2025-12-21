import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserOrdersTab from './account/UserOrdersTab';
import PersonalInfoTab from './account/PersonalInfoTab';
import AddressesTab from './account/AddressesTab';

const AccountPage = () => {
    const navigate = useNavigate();
    const { logout, user, isAuthenticated, loading } = useAuth();
    const [activeTab, setActiveTab] = useState('orders');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
        navigate('/login');
        return null;
    }

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="bg-[#221022] text-white min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <span className="material-symbols-outlined text-4xl text-[#d411d4] animate-spin">progress_activity</span>
                    <p className="mt-4 text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'orders', label: 'My Orders', icon: 'shopping_bag' },
        { id: 'personal', label: 'Personal Info', icon: 'person' },
        { id: 'addresses', label: 'Addresses', icon: 'location_on' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'orders':
                return <UserOrdersTab />;
            case 'personal':
                return <PersonalInfoTab />;
            case 'addresses':
                return <AddressesTab />;
            default:
                return <UserOrdersTab />;
        }
    };

    return (
        <div className="bg-[#221022] text-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-72 flex-shrink-0">
                        <div className="bg-[#2d1b2d]/80 backdrop-blur-sm rounded-2xl border border-[#4a2b4a] p-6 sticky top-24">
                            {/* User Avatar & Info */}
                            <div className="text-center mb-6 pb-6 border-b border-[#4a2b4a]">
                                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#d411d4] to-[#6b0f6b] flex items-center justify-center text-3xl font-bold text-white shadow-[0_0_30px_rgba(212,17,212,0.3)] mb-4">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <h2 className="text-lg font-bold">{user?.name || 'User'}</h2>
                                <p className="text-sm text-gray-400">{user?.email}</p>
                                <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-[#d411d4]/20 text-[#d411d4] uppercase tracking-wider">
                                    {user?.role}
                                </span>
                            </div>

                            {/* Navigation Tabs */}
                            <nav className="space-y-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${activeTab === tab.id
                                                ? 'bg-[#d411d4]/20 text-[#d411d4] font-medium'
                                                : 'text-gray-300 hover:bg-[#4a2b4a]/50 hover:text-white'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined">{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>

                            {/* Logout Button */}
                            <div className="mt-6 pt-6 border-t border-[#4a2b4a]">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-medium hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300"
                                >
                                    <span className="material-symbols-outlined">logout</span>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;
