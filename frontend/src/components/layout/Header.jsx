import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { categoriesAPI } from '../../services/api';

const Header = () => {
    const { isAuthenticated, user, loading } = useAuth();
    const { cartCount } = useCart();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoriesAPI.list(true);
                setCategories(data.filter(c => !c.parent_id)); // Only parent categories
            } catch (error) {
                console.error("Failed to fetch menu categories", error);
            }
        };
        fetchCategories();
    }, []);

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
                    <nav className="hidden md:flex gap-8 items-center">
                        <div className="relative group z-50">
                            <Link to="/products" className="text-sm font-medium text-white hover:text-[#d411d4] transition-colors py-4 flex items-center gap-1">
                                Products
                                <span className="material-symbols-outlined text-lg">expand_more</span>
                            </Link>

                            {/* Dropdown Menu */}
                            <div className="absolute top-full left-0 w-48 bg-[#1F1B18] border border-white/10 rounded-lg shadow-xl opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-300 overflow-hidden">
                                <Link
                                    to="/products"
                                    className="block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 border-b border-white/5"
                                >
                                    All Products
                                </Link>
                                {categories.map(cat => (
                                    <Link
                                        key={cat.category_id}
                                        to={`/products?category_id=${cat.category_id}`}
                                        className="block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5"
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

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
                            <Link to="/cart" preventScrollReset aria-label="Shopping Bag" className="p-2 hover:bg-white/10 rounded-full transition-colors text-white relative">
                                <span className="material-symbols-outlined">shopping_bag</span>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-5 px-1 bg-[#d411d4] text-[11px] leading-5 font-bold rounded-full flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
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
