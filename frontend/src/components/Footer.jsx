import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100">
            {/* Main footer */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand column */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="inline-block mb-4">
                            <span className="text-xl font-semibold tracking-tight">
                                BASIC<span className="font-light">COLOR</span>
                            </span>
                        </Link>
                        <p className="text-sm text-gray-500 mb-6 max-w-xs">
                            Áo quần đơn sắc, phong cách tối giản. Canvas hoàn hảo cho thương hiệu của bạn.
                        </p>
                        <div className="flex gap-4">
                            {['📘', '📸', '🐦'].map((icon, i) => (
                                <motion.button
                                    key={i}
                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg hover:bg-gray-200 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {icon}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Links columns */}
                    <div>
                        <h4 className="text-sm font-medium uppercase tracking-wider mb-4">Sản phẩm</h4>
                        <ul className="space-y-3">
                            {['Áo thun', 'Áo polo', 'Quần dài', 'Áo khoác', 'Phụ kiện'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-sm text-gray-500 hover:text-black transition-colors">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium uppercase tracking-wider mb-4">Hỗ trợ</h4>
                        <ul className="space-y-3">
                            {['Liên hệ', 'Đổi trả', 'Chính sách giao hàng', 'FAQ', 'Bảng size'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-sm text-gray-500 hover:text-black transition-colors">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium uppercase tracking-wider mb-4">Về chúng tôi</h4>
                        <ul className="space-y-3">
                            {['Câu chuyện', 'Đội ngũ', 'Tuyển dụng', 'Blog', 'Đối tác'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-sm text-gray-500 hover:text-black transition-colors">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Newsletter bar */}
            <div className="bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h4 className="text-sm font-medium mb-1">Đăng ký nhận tin</h4>
                            <p className="text-xs text-gray-500">Nhận ưu đãi và cập nhật bộ sưu tập mới</p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <input
                                type="email"
                                placeholder="Email của bạn"
                                className="flex-1 md:w-64 px-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
                            />
                            <motion.button
                                className="px-6 py-2 bg-black text-white text-sm font-medium rounded-full"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Đăng ký
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-gray-100 py-6">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
                        <p>© 2024 Basic Color. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-gray-600">Điều khoản</a>
                            <a href="#" className="hover:text-gray-600">Bảo mật</a>
                            <a href="#" className="hover:text-gray-600">Cookies</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
