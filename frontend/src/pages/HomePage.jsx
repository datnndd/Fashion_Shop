import { Link } from 'react-router-dom';

const HomePage = () => {
    const colorBlocks = [
        { id: '01', name: 'Electric Magenta', from: '#d411d4', to: '#7a0a7a', description: 'Bold. Unapologetic. The core of our identity.' },
        { id: '02', name: 'Deep Azure', from: '#0044ff', to: '#001144', description: 'Calm intensity. For the deep thinkers.' },
        { id: '03', name: 'Acid Lime', from: '#ccff00', to: '#558800', description: 'Shock the system. High visibility style.', isDark: true },
        { id: '04', name: 'Void Black', from: '#222', to: '#000', description: 'The absence of light. Pure silhouette.' },
        { id: '05', name: 'Solar Orange', from: '#ff5500', to: '#aa2200', description: 'Warmth radiating. Energy embodied.' },
        { id: '06', name: 'Cyber Teal', from: '#00ffee', to: '#008877', description: 'Digital age hues. Future focused.', isDark: true },
    ];

    const trendingItems = [
        {
            id: 1,
            name: 'Magenta Dress',
            price: '$120.00',
            isNew: true,
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhNL0xRIRRvQIivTdIFP_g6UkCXYW5G_23iWRbHLfUMCDwVp91pFbbaFo18kFcf-tJQ2S39nDMj2lBlSK28PXLFgYR33VsFWqINWtBMPB2CTSiAhY9VieYSGW1Nj0syIc5cf06an_VdMNrcVM0w79ke7WWw47_NYhh-4f9azehS_PuaCLelv3MmIv3MSfhJ5WAK4OD8KoeijMBSZuOOwj6xuqqfNCRPNb64FoPYXwCELgwClLvByr_Q3VpTFpq52Y4wXg_aZYoe48',
        },
        {
            id: 2,
            name: 'Neon Jacket',
            price: '$250.00',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0MlYG9alsJAMyrMKbrcVIHAPUnRUMV-9wjlC9BgpKrfl2KA0BPcmh4-eIe5EhsomuitV8mD7osBMdFLQLPD-qG0fJzLpv-Yq0DYIOqF64D0bPUnJN-xhMqeJ8QcQYxv-YX1z2d79xLZomROLR9CAkOohynucRXlV8FxPRZwR8Hpp2siA0gzU1MIRmLGmyOkyVWlGy170D1sAGor3QN68-2ePxdw8krppzzj5J20QQ-tnuA_njb-gQEBxfX_wQGhYcDYd4AC-jGJQ',
        },
        {
            id: 3,
            name: 'Solar Visor',
            price: '$45.00',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCD2UXorvoVrFa2HIcvutB-5jfXcne75AwhPWoY0y_wiSD1m384ydJ0yPoKbGolp0RgnLgZu0m-FdPnvKC8ej5M5U8zoGq7sIkBShES3SwsTtDkLcllI0yuGdSdogZ3YrKUidG4lUyus-RNwsN_VEI3E3QdDjw10XU7hBOPKBB_20SvH0RV8YEWyBZISxE86kKbpqkX1xqis09Cil4w9PjDhIWpZwxWbPa9abks6A3T7CgzZcAp0AVFNA6g8X92L1Wv-zzpOI4cw0E',
        },
        {
            id: 4,
            name: 'Azure Kicks',
            price: '$110.00',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUc6XbKClsIQNhkb5NjuJtR5GUvb6C_0QWd4iOIDKtghFxnggOVpB0kZFW8SqgrVicutt4tJkQi8KIkUwUVIKcLyfHpwSGbiusmVC4tEP1DiKWfJuLMAm5IvsPJ0ODYXdTQ8B3PVqitMDN9xjmVTkekxudJNdjlfDaiUJlqype_NrRLD-DwN7sTkU5sbtte9mN0ZsbJ_gZBqdJ-rXo0Zm-zn4uz1bHu8YSGrua8scMCoEbeGLof5RnfheDeRsF5jbgrwXGyl6r1bw',
        },
        {
            id: 5,
            name: 'Prism Hoodie',
            price: '$85.00',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBviu4omyAFWsIHOfXobWLY8BBFtdjODfeyHQRFQuJj4W4YQx7iNfzYnIPSSGa8cL57Yq6vP4WVIwtKxgrh4ZXVhb0OkvaT6QEDGrtYVV__XdnV1pRFKZS6yk0uWWUnXaFr4XmKifz2_wR8cyf5CLcLmFqdxLGqpJEMe85x3lc8wUbC5EDpoPr8-03ktuvIwDeGSDM71i7bGfhFAAoKgMkkrO6rxTwN0dfN-5i3yyahhZL_UWJthZSiPIgA0W-nhaR_mtaHfJcRWog',
        },
    ];

    return (
        <main className="flex-grow flex flex-col">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 px-4 flex flex-col items-center justify-center text-center overflow-hidden">
                {/* Decorative Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d411d4]/20 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-6 items-center">
                    <h2 className="text-[#d411d4] font-bold tracking-wider text-sm uppercase animate-pulse">New Collection Drop</h2>
                    <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tighter text-white">
                        WEAR THE<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d411d4] via-purple-400 to-blue-500">SPECTRUM</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-lg mx-auto font-sans leading-relaxed">
                        Defy the grey. Experience fashion driven by pure, unadulterated color.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <Link to="/collections" className="bg-[#d411d4] hover:bg-[#d411d4]/90 text-white px-8 py-4 rounded-lg font-bold text-lg tracking-wide transition-all transform hover:scale-105 flex items-center gap-2">
                            Explore Colors
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                        <button className="bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-bold text-lg tracking-wide transition-all">
                            View Lookbook
                        </button>
                    </div>
                </div>
            </section>

            {/* Color Navigation Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h3 className="text-3xl font-bold mb-2 text-white">Shop by Spectrum</h3>
                        <p className="text-gray-400 font-sans">Select your vibe.</p>
                    </div>
                    <Link to="/collections" className="hidden sm:flex items-center gap-1 text-[#d411d4] hover:text-white transition-colors text-sm font-bold">
                        View All Categories <span className="material-symbols-outlined text-sm">arrow_outward</span>
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {colorBlocks.map((block) => (
                        <Link
                            to={`/collections/${block.name.toLowerCase().replace(' ', '-')}`}
                            key={block.id}
                            className="group relative aspect-[4/5] sm:aspect-square lg:aspect-[4/3] overflow-hidden rounded-xl cursor-pointer"
                        >
                            <div
                                className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                                style={{ background: `linear-gradient(to bottom right, ${block.from}, ${block.to})` }}
                            ></div>
                            <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-cover bg-center"></div>
                            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                <span className="text-white/80 text-sm font-bold mb-1 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    {block.id}
                                </span>
                                <h4 className={`text-3xl font-bold text-white leading-none ${block.isDark ? 'mix-blend-difference' : ''}`}>
                                    {block.name}
                                </h4>
                                <p className={`text-white/60 text-sm mt-2 max-h-0 overflow-hidden group-hover:max-h-20 transition-all duration-500 ease-out ${block.isDark ? 'mix-blend-difference' : ''}`}>
                                    {block.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Carousel Section */}
            <section className="w-full py-16 bg-black/20 backdrop-blur-sm border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold text-white">Trending in the Spectrum</h3>
                        <div className="flex gap-2">
                            <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                                <span className="material-symbols-outlined text-white">arrow_back</span>
                            </button>
                            <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                                <span className="material-symbols-outlined text-white">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                    <div className="flex overflow-x-auto scrollbar-hide gap-6 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                        {trendingItems.map((item) => (
                            <Link to={`/product/${item.id}`} key={item.id} className="flex-none w-64 group cursor-pointer">
                                <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden mb-4">
                                    <div className="absolute inset-0 bg-gray-800 animate-pulse"></div>
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{ backgroundImage: `url('${item.image}')` }}
                                    ></div>
                                    {item.isNew && (
                                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded">
                                            NEW
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-white font-bold text-lg leading-tight group-hover:text-[#d411d4] transition-colors">
                                    {item.name}
                                </h4>
                                <p className="text-gray-400 font-sans text-sm mt-1">{item.price}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter / Footer Teaser */}
            <section className="max-w-4xl mx-auto px-4 py-24 text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Never miss a shade.</h2>
                <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                    Join the chromatic revolution. Get early access to new color drops and exclusive gradients.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                        className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#d411d4] focus:ring-1 focus:ring-[#d411d4] transition-all"
                        placeholder="Enter your email"
                        type="email"
                    />
                    <button className="bg-[#d411d4] hover:bg-[#d411d4]/90 text-white font-bold px-6 py-3 rounded-lg transition-colors">
                        Subscribe
                    </button>
                </div>
            </section>

            {/* FAB: Shop All */}
            <div className="fixed bottom-6 right-6 z-40">
                <Link
                    to="/collections"
                    className="flex items-center gap-3 bg-[#d411d4] hover:bg-[#b00eb0] text-white px-6 py-4 rounded-full shadow-[0_0_30px_rgba(212,17,212,0.4)] transition-all hover:scale-105 active:scale-95"
                >
                    <span className="material-symbols-outlined">shopping_bag</span>
                    <span className="font-bold tracking-wide">Shop All</span>
                </Link>
            </div>
        </main>
    );
};

export default HomePage;
