import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const HomePage = () => {
    return (
        <div className="relative min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden selection:bg-primary selection:text-white">
            <Header />

            {/* Marquee / Headline */}
            <div className="w-full bg-primary overflow-hidden py-3">
                <div className="animate-marquee whitespace-nowrap flex gap-8 text-black font-black text-sm tracking-widest uppercase">
                    <span>Basic Color / Bold Impact / Monochrome / Express Yourself</span>
                    <span>Basic Color / Bold Impact / Monochrome / Express Yourself</span>
                    <span>Basic Color / Bold Impact / Monochrome / Express Yourself</span>
                    <span>Basic Color / Bold Impact / Monochrome / Express Yourself</span>
                    <span>Basic Color / Bold Impact / Monochrome / Express Yourself</span>
                    <span>Basic Color / Bold Impact / Monochrome / Express Yourself</span>
                </div>
            </div>

            {/* Hero / Color Matrix */}
            <main className="flex-grow w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[300px] md:auto-rows-[400px]">
                    {/* Block 1: Dominant Color (Red) */}
                    <Link to="/shop" className="group relative overflow-hidden rounded-xl md:col-span-8 md:row-span-2 cursor-pointer block" role="img" aria-label="Woman with intense gaze in monochrome red lighting">
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCATomUtVFgXcbDMr60r5X7UMhlYDAES0UPyHePPiDpqabOhBrif5oL_c9L_mv0qMgbYsqK3lDHqQsB_zXZRbRukrwxMQK7o2yBy5z6vOyBrtnST0gX7mLklhQkWG7oXoyddIkAnGtS8_RnAQbTj9KQEYo3A1pHEkUpz39V4JV2HV9ocPz63DqCRj7OCBqD_cDgKmYaNTI4SOUosRUKzP5RolGrqol-SvxV21QlLyUNPAqNuuO_2fM__s_R7MdITAh8z0mK-jR4VUc')" }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                        <div className="absolute inset-0 bg-[#ff0000] mix-blend-overlay opacity-40 group-hover:opacity-20 transition-opacity duration-500"></div>
                        <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full flex flex-col items-start gap-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <h2 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter leading-none text-white drop-shadow-lg">
                                Wear<br /><span className="text-primary">Red</span>
                            </h2>
                            <span className="inline-flex items-center gap-2 text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                Explore Collection <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </span>
                        </div>
                    </Link>

                    {/* Block 2: Secondary Color (Midnight Blue) */}
                    <Link to="/shop" className="group relative overflow-hidden rounded-xl md:col-span-4 md:row-span-1 cursor-pointer block" role="img" aria-label="Abstract deep blue fashion photography with moody lighting">
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA_kuTRPo8OQyL0vLXIZFjpFkZfnBFkP9s07UMpZPeB-zsmMhiZ9Ip2B-IglHrDWbdjqJnSFadr_45m1kWxFcldU_GGSmUsVP428PPRZM3eri8boNGqYx41rE6mfGbzYjdRvAdMRgsRY7auKbu7o0czWz0ZX0WKY0lrjFT4vX-FjVuyHjVxP5c-QMJ0kzSD3oUv-V192zxlKmyNaQDbE9YYPMFI89S-Fnq5OvitAM15Zxt_2fk0jvX65Vu0z4Ok2VsL_payaexrVl8')" }}></div>
                        <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                            <h3 className="text-3xl md:text-4xl font-bold uppercase text-white mb-1">Midnight</h3>
                            <p className="text-white/80 text-sm font-medium tracking-wide">THE DEEP EDIT</p>
                        </div>
                        {/* Hover Action */}
                        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="material-symbols-outlined text-white">north_east</span>
                        </div>
                    </Link>

                    {/* Block 3: Secondary Color (Toxic Green) */}
                    <Link to="/shop" className="group relative overflow-hidden rounded-xl md:col-span-4 md:row-span-1 cursor-pointer block" role="img" aria-label="Fashion model wearing bright outfit in neon green lighting">
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDHbs71nX8NnkiIm5KjB2gUj5JfeZQPKYgsnKsrXO8m-Aeqb5_oOan73pySPBewf3Lqd7EhJesRAtVudbbI741qFlGYhjB3lJO4L42VSbWtZFvaqauvgVAwQyZlqq1QNOYX-RwqiNqjUMI52CXYt62gykUh_TTb4Dmy1MEsNj-Dur72IV_MPu1nPzmaUE3tTBdxcrRoHM1vzdvZVRF28oepWtuunlj9VhyPLeN8ZnmD5xe2oySlo0s4kl6lPGYd4TiZ0UazH4mr42g')" }}></div>
                        <div className="absolute inset-0 bg-green-500/30 mix-blend-color-burn"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                            <h3 className="text-3xl md:text-4xl font-bold uppercase text-white mb-1">Toxic</h3>
                            <p className="text-white/80 text-sm font-medium tracking-wide">NEON HIGHLIGHTS</p>
                        </div>
                        {/* Hover Action */}
                        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="material-symbols-outlined text-white">north_east</span>
                        </div>
                    </Link>
                </div>

                {/* Lower Feature Band */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-primary/10 rounded-xl p-8 flex flex-col justify-between min-h-[300px] border border-primary/20 hover:border-primary/50 transition-colors group">
                        <div className="flex justify-between items-start">
                            <span className="material-symbols-outlined text-4xl text-primary">palette</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-primary border border-primary px-2 py-1 rounded">New Drop</span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold mb-2">Monochrome Essentials</h3>
                            <p className="text-white/60 mb-6 max-w-sm">Discover the power of single-color styling. Curated sets designed to make a statement without saying a word.</p>
                            <Link to="/shop" className="bg-primary hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors inline-flex items-center gap-2">
                                Shop Now <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </Link>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-neutral-800 to-black rounded-xl p-8 flex flex-col justify-center items-center text-center min-h-[300px] relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)", backgroundSize: "24px 24px" }}></div>
                        <h3 className="relative z-10 text-4xl md:text-5xl font-black uppercase tracking-tight mb-2">
                            Sale<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Up to 50%</span>
                        </h3>
                        <p className="relative z-10 text-white/60 mb-8 uppercase tracking-widest text-sm">On selected colorways</p>
                        <a className="relative z-10 text-white font-bold underline decoration-primary decoration-2 underline-offset-4 hover:text-primary transition-colors" href="#">View Offers</a>
                    </div>
                </div>
            </main>

            {/* Newsletter CTA */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-background-dark/50">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="material-symbols-outlined text-5xl text-primary mb-6">mark_email_unread</span>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Stay Connected</h2>
                    <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto">Sign up for exclusive color drops and monochrome edits. Be the first to know when new shades arrive.</p>
                    <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input className="flex-grow bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Enter your email" type="email" aria-label="Email Address" />
                        <button className="bg-primary hover:bg-red-600 text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wider transition-colors shadow-[0_0_20px_rgba(236,19,73,0.3)]" type="button">
                            Subscribe
                        </button>
                    </form>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default HomePage;
