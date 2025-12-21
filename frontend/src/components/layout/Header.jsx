import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const { isAuthenticated, user, loading } = useAuth();
    return (
        <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#221022]/60 border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group cursor-pointer">
                        <span className="material-symbols-outlined text-[#d411d4] text-3xl">palette</span>
                        <h1 className="text-2xl font-bold tracking-tight uppercase text-white">BasicColor</h1>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex gap-8">
                        <Link to="/products" className="text-sm font-medium text-white hover:text-[#d411d4] transition-colors">
                            Products
                        </Link>

                        <Link to="/about" className="text-sm font-medium text-white hover:text-[#d411d4] transition-colors">
                            About
                        </Link>

                        <Link to="/contact" className="text-sm font-medium text-white hover:text-[#d411d4] transition-colors">
                            Contact
                        </Link>
                    </nav>

                    {/* Action Icons */}
                    <div className="flex items-center gap-3">
                        {/* Auth Buttons - Only show after loading is complete */}
                        {!loading && isAuthenticated && (
                            <Link to="/account" aria-label="Account" className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-full transition-colors text-white group">
                                <span className="material-symbols-outlined group-hover:text-[#d411d4] transition-colors">person</span>
                            </Link>
                        )}
                        {/* Login/Register - Show on all screen sizes when not logged in and loading is complete */}
                        {!loading && !isAuthenticated && (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-sm font-medium text-white hover:text-[#d411d4] transition-colors">
                                    Login
                                </Link>
                                <Link to="/register" className="text-sm font-medium bg-[#d411d4] text-white px-4 py-2 rounded-full hover:bg-[#b00eb0] transition-colors">
                                    Register
                                </Link>
                            </div>
                        )}


                        {/* Search Removed as per request */}

                        {/* Cart - Only show after loading is complete and if authenticated, or maybe just if authenticated? Request said "When user is NOT logged in, only show Login/Register, do NOT show cart" */}
                        {!loading && isAuthenticated && (
                            <Link to="/cart" aria-label="Shopping Bag" className="p-2 hover:bg-white/10 rounded-full transition-colors text-white relative">
                                <span className="material-symbols-outlined">shopping_bag</span>
                                <span className="absolute top-1 right-1 w-2 h-2 bg-[#d411d4] rounded-full"></span>
                            </Link>
                        )}
                        {/* Mobile Menu Trigger */}
                        <button className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
