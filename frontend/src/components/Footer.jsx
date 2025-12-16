const Footer = () => (
    <footer className="bg-black py-12 border-t border-white/10 mt-auto w-full">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="text-white size-6">
                            <svg className="h-full w-full" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <span className="text-lg font-bold uppercase tracking-tight text-white">BasicColor</span>
                    </div>
                    <p className="text-white/50 text-sm max-w-xs">
                        Celebrating color diversity through bold monochrome fashion. Designed for the modern expressive individual.
                    </p>
                </div>
                <div>
                    <h4 className="text-white font-bold uppercase mb-4 text-sm tracking-wider">Help</h4>
                    <ul className="space-y-2 text-sm text-white/50">
                        <li><a className="hover:text-primary transition-colors" href="#">Shipping & Returns</a></li>
                        <li><a className="hover:text-primary transition-colors" href="#">Size Guide</a></li>
                        <li><a className="hover:text-primary transition-colors" href="#">FAQ</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold uppercase mb-4 text-sm tracking-wider">Social</h4>
                    <div className="flex gap-4">
                        <a className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-white transition-all" href="#"><span className="material-symbols-outlined text-xl">camera_alt</span></a>
                        <a className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-white transition-all" href="#"><span className="material-symbols-outlined text-xl">music_note</span></a>
                    </div>
                </div>
            </div>
            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-white/30 text-xs">© 2023 BasicColor. All rights reserved.</p>
                <div className="flex gap-6 text-xs text-white/30">
                    <a className="hover:text-white" href="#">Privacy Policy</a>
                    <a className="hover:text-white" href="#">Terms of Service</a>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;
