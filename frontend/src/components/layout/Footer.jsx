import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="border-t border-white/10 bg-black/40 backdrop-blur-lg pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div>
                        <h5 className="text-white font-bold mb-4">Shop</h5>
                        <ul className="space-y-2">
                            <li><Link to="/collections" className="text-gray-400 hover:text-[#d411d4] text-sm transition-colors">New Arrivals</Link></li>
                            <li><Link to="/collections" className="text-gray-400 hover:text-[#d411d4] text-sm transition-colors">Best Sellers</Link></li>
                            <li><Link to="/collections" className="text-gray-400 hover:text-[#d411d4] text-sm transition-colors">Accessories</Link></li>
                            <li><Link to="/collections" className="text-gray-400 hover:text-[#d411d4] text-sm transition-colors">Sale</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-white font-bold mb-4">Support</h5>
                        <ul className="space-y-2">
                            <li><Link to="/faq" className="text-gray-400 hover:text-[#d411d4] text-sm transition-colors">FAQ</Link></li>
                            <li><Link to="/shipping" className="text-gray-400 hover:text-[#d411d4] text-sm transition-colors">Shipping</Link></li>
                            <li><Link to="/returns" className="text-gray-400 hover:text-[#d411d4] text-sm transition-colors">Returns</Link></li>
                            <li><Link to="/contact" className="text-gray-400 hover:text-[#d411d4] text-sm transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-white font-bold mb-4">Company</h5>
                        <ul className="space-y-2">
                            <li><Link to="/about" className="text-gray-400 hover:text-[#d411d4] text-sm transition-colors">Our Story</Link></li>
                            <li><Link to="/sustainability" className="text-gray-400 hover:text-[#d411d4] text-sm transition-colors">Sustainability</Link></li>
                            <li><Link to="/careers" className="text-gray-400 hover:text-[#d411d4] text-sm transition-colors">Careers</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-white font-bold mb-4">Connect</h5>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#d411d4] hover:text-white transition-all text-gray-400">
                                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path clipRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" fillRule="evenodd"></path>
                                </svg>
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#d411d4] hover:text-white transition-all text-gray-400">
                                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path clipRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.409-.06 3.809-.06h.63zm1.673 5.378a5.369 5.369 0 00-1.672-.266c-2.964 0-5.378 2.414-5.378 5.378 0 2.964 2.414 5.378 5.378 5.378 2.964 0 5.378-2.414 5.378-5.378 0-2.964-2.414-5.378-5.378-5.378zm0 1.943a3.435 3.435 0 013.435 3.435 3.435 3.435 0 01-3.435 3.435 3.435 3.435 0 01-3.435-3.435 3.435 3.435 0 013.435-3.435zm6.059-4.83a1.189 1.189 0 110 2.378 1.189 1.189 0 010-2.378z" fillRule="evenodd"></path>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-sans border-t border-white/10 pt-8">
                    <p>© 2024 BasicColor. All rights reserved.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
