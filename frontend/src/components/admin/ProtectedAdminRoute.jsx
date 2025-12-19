import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Protected route component for admin pages.
 * - Redirects to login if not authenticated
 * - Shows access denied if authenticated but not admin
 */
const ProtectedAdminRoute = ({ children }) => {
    const { user, loading, isAuthenticated } = useAuth();

    // Show loading state while checking auth
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#d411d4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Show access denied if not admin
    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center font-[Space_Grotesk]">
                <div className="text-center max-w-md px-6">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-red-400 text-4xl">block</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-gray-400 mb-6">
                        You don't have permission to access this page. Admin privileges are required.
                    </p>
                    <a
                        href="/"
                        className="inline-block px-6 py-3 bg-[#d411d4] hover:bg-[#b00eb0] rounded-lg text-sm font-medium transition-colors"
                    >
                        Go to Homepage
                    </a>
                </div>
            </div>
        );
    }

    // User is admin, render children
    return children;
};

export default ProtectedAdminRoute;
