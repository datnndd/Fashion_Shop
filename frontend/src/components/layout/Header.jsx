import { Link } from 'react-router-dom';

const Header = () => {
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
                        <Link to="/collections" className="text-sm font-medium text-white hover:text-[#d411d4] transition-colors">
                            Collections
                        </Link>
                        <Link to="/about" className="text-sm font-medium text-white hover:text-[#d411d4] transition-colors">
                            About
                        </Link>
                        <Link to="/account" className="text-sm font-medium text-white hover:text-[#d411d4] transition-colors">
                            Account
                        </Link>
                        <Link to="/contact" className="text-sm font-medium text-white hover:text-[#d411d4] transition-colors">
                            Contact
                        </Link>
                    </nav>

                    {/* Action Icons */}
                    <div className="flex items-center gap-3">
                        <button aria-label="Search" className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                            <span className="material-symbols-outlined">search</span>
                        </button>
                        <Link to="/cart" aria-label="Shopping Bag" className="p-2 hover:bg-white/10 rounded-full transition-colors text-white relative">
                            <span className="material-symbols-outlined">shopping_bag</span>
                            <span className="absolute top-1 right-1 w-2 h-2 bg-[#d411d4] rounded-full"></span>
                        </Link>
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
