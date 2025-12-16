import { Link } from 'react-router-dom';

const Header = ({ transparent }) => {
    const headerClass = transparent
        ? "sticky top-0 z-50 w-full backdrop-blur-md bg-background-light/90 dark:bg-background-dark/90 border-b border-primary/20 transition-all duration-300"
        : "sticky top-0 z-50 w-full border-b border-[#48232c] bg-background-dark/95 backdrop-blur-sm";

    return (
        <header className={headerClass}>
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="text-primary size-8 group-hover:scale-110 transition-transform">
                            <svg className="h-full w-full" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight uppercase text-slate-900 dark:text-white">BasicColor</h1>
                    </Link>

                    {/* Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/shop" className="text-sm font-bold uppercase hover:text-primary transition-colors text-slate-900 dark:text-white/80">Shop</Link>
                        <a href="#" className="text-sm font-bold uppercase hover:text-primary transition-colors text-slate-900 dark:text-white/80">About</a>
                        <a href="#" className="text-sm font-bold uppercase hover:text-primary transition-colors text-slate-900 dark:text-white/80">Collections</a>
                    </nav>

                    {/* Icons */}
                    <div className="flex items-center gap-2">
                        <button className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-slate-900 dark:text-white">
                            <span className="material-symbols-outlined text-2xl">search</span>
                        </button>
                        <button className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-slate-900 dark:text-white">
                            <span className="material-symbols-outlined text-2xl">account_circle</span>
                        </button>
                        <button className="relative flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-slate-900 dark:text-white">
                            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background-light dark:ring-background-dark"></span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
