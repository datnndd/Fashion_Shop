import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();

    const headerBg = useTransform(
        scrollY,
        [0, 100],
        ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.95)']
    );

    const headerBlur = useTransform(
        scrollY,
        [0, 100],
        ['blur(0px)', 'blur(12px)']
    );

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            {/* Top announcement bar */}
            <motion.div
                className="bg-black text-white text-center py-2 px-4 text-xs tracking-wider"
                initial={{ y: -40 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                Miễn phí vận chuyển đơn từ 499.000đ • Đổi trả trong 30 ngày
            </motion.div>

            {/* Main header */}
            <motion.header
                className={`
          fixed top-8 left-0 right-0 z-50
          transition-shadow duration-300
          ${isScrolled ? 'shadow-sm' : ''}
        `}
                style={{
                    backgroundColor: headerBg,
                    backdropFilter: headerBlur,
                }}
            >
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center">
                            <motion.div
                                className="flex items-center"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="text-xl font-semibold tracking-tight">
                                    BASIC<span className="font-light">COLOR</span>
                                </span>
                            </motion.div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-8">
                            {[
                                { path: '/products', label: 'Sản phẩm' },
                                { path: '/collections', label: 'Bộ sưu tập' },
                                { path: '/upload', label: 'Studio' },
                                { path: '/about', label: 'Về chúng tôi' },
                            ].map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="relative text-sm font-medium tracking-wide text-gray-700 hover:text-black transition-colors group"
                                >
                                    {link.label}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full" />
                                </Link>
                            ))}
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <span className="text-lg">🔍</span>
                            </button>
                            <button className="hidden md:block p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <span className="text-lg">👤</span>
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <span className="text-lg">♡</span>
                            </button>
                            <Link
                                to="/cart"
                                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <span className="text-lg">🛒</span>
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                                    2
                                </span>
                            </Link>

                            {/* Mobile menu button */}
                            <button
                                className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                <span className="text-lg">{isMobileMenuOpen ? '✕' : '☰'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <motion.div
                    className={`md:hidden bg-white border-t border-gray-100 ${isMobileMenuOpen ? 'block' : 'hidden'}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                        opacity: isMobileMenuOpen ? 1 : 0,
                        height: isMobileMenuOpen ? 'auto' : 0
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <nav className="px-4 py-4 space-y-3">
                        {[
                            { path: '/products', label: 'Sản phẩm' },
                            { path: '/collections', label: 'Bộ sưu tập' },
                            { path: '/upload', label: 'Studio' },
                            { path: '/about', label: 'Về chúng tôi' },
                        ].map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="block py-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </motion.div>
            </motion.header>
        </>
    );
};

export default Header;
