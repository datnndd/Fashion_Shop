import { Link, useLocation } from 'react-router-dom';

const AccountPage = () => {
    const location = useLocation();

    const navItems = [
        { path: '/account', icon: 'dashboard', label: 'Overview' },
        { path: '/account/profile', icon: 'person', label: 'Personal Info' },
        { path: '/account/orders', icon: 'shopping_bag', label: 'Orders' },
        { path: '/account/addresses', icon: 'location_on', label: 'Addresses' },
        { path: '/account/wishlist', icon: 'favorite', label: 'Wishlist' },
    ];

    const recommendations = [
        {
            id: 1,
            name: 'Yellow Pleated Skirt',
            price: '$89.00',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyuWzHrKdE0TkJv1KILouRvkHdH52K9DOXLAvFUj6v-CKCPuqfRNuuAD3TXTonvbWtSOC1fDujZZVNg9tQFD41k0UoU8wCoGxLYxtBDB_HUd42wEUXB-DevtPzdn1SbjiCu25zYJPLLgpL07hnmYGPcWpX3Vdy0PqvH-7Lsz-G6GPtsBI_G14Nqn4sQ-ULn37EIX87-Vkj92sBTsAJc_jAtwjBBKYqF3E5DwCOgDwgVp8RV3rfLQeeePQVM5srvLiAp_mcMcwKDqc',
        },
        {
            id: 2,
            name: 'Velvet Midnight Dress',
            price: '$120.00',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChYRrdwa9mdWmUfDstL8P46YJcG86E5cMC7DIxuvttQb9I9xCeoqVuaBxogwb0nKgSaH6Ru49ZnyGBFYiZGLIldwk82_XtEfkUfvdwcmlw_sA8s8yjFIyvpK9azcsBL7PXdgBcJlENNeuWtqLho6gLbCRFrhi1NJVF5siVvnVvLlnNLGeTHJoQUpGTP4TilzbbYnL2ahquch5ZXUnKmYyOyMK_-z3ey37R_Vnh3MSGzuqtnnAI0zJ71ZzZiLuwfFMzTrr19HFZ8DA',
        },
        {
            id: 3,
            name: 'Azure Heels',
            price: '$145.00',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCU0toqF60qeZ-Nf_eDWoTuZpJPF_SC_WTcvlrTNWPKhgzdBV7vo72tQ4ld_U93Iul3mcFDDg8vRspdh6x3sHkoLC4fm8FzKjXI-BHGsxWbgbqJaZs8i7HSqAj2vkpDS-eJLFIBCx2h3gehegpeBUsOsEyNWTfa3ovA2JP1IiYbujcC59A9aCqmbn5zgejtj-GdVafMZD7BnLRLjXHfIOcUt5OW50tU3b01fxqOR0HnzP--_gnhyar8nAGjOUpQ82ySOE3Nj6h4PsM',
        },
        {
            id: 4,
            name: 'Neon Gradient Scarf',
            price: '$35.00',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxJbrW_a3yyce3FLtPAqSVnEqPE48dhcWXRWhDd36fFuWEOkufsCfpUtOWlqzb1S1K19ykQfBiANI9vFMxIHBs1AXwpSIxVb6igPtZIMo69dCuhZXRgLp-iMZr2PoPLqSHyYlZIqFkIe8MqaQeFLIH8EcXG2XPKsk1-ilgC1Z3Xbh7dtd9WGK_DJczk6VWpudaI-M5qsmWjxqxzAyYNXd24xHevWosfuMMIlJiEv_1FcXayOELvUSdxyTMzsdJDxSedaW8GEkqnDY',
        },
    ];

    return (
        <div className="bg-[#221022] text-white font-[Space_Grotesk] min-h-screen flex flex-col">
            {/* Main Layout */}
            <div className="flex-1 w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-8 lg:py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Navigation */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="sticky top-24 flex flex-col gap-8">
                            {/* User Profile Snippet */}
                            <div className="flex items-center gap-4 pb-6 border-b border-[#4a2b4a]">
                                <div
                                    className="w-12 h-12 rounded-full bg-cover bg-center border-2 border-[#d411d4]"
                                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBWF3awBlhH7lDg0KaOO-OSN3z3EzuOuiKR24gUoE4XgFcGeL-k4WJZM-qgecodltH7djnoJyCP6CHyk3lFovEp0Akp9izx98zM-9sUQRrk861Ie7MMCSAVpcdpb7XpJknEzhjEROM84KN2IXLqtOCPyB0BabOLxL7iWpi8_PEo3xdgTwSg2sUuxqBDvmAp1YLW3dj0w7zDWHH_LbZBOtu_j7hYDrilAgupm5v49zLQho8NLFYLkfD-9O3uXBqf1x6fF2IgkDwrZ2Y')" }}
                                ></div>
                                <div className="flex flex-col">
                                    <h3 className="font-bold text-lg leading-none">ALEXA D.</h3>
                                    <span className="text-xs text-[#d411d4] font-medium mt-1">Diamond Member</span>
                                </div>
                            </div>
                            {/* Navigation Links */}
                            <nav className="flex flex-col gap-2">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${location.pathname === item.path
                                            ? 'bg-[#d411d4] text-white shadow-[0_0_15px_rgba(212,17,212,0.3)]'
                                            : 'text-gray-300 hover:bg-[#2d1b2d] hover:text-[#d411d4]'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined">{item.icon}</span>
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                ))}
                                <div className="pt-4 mt-2 border-t border-[#4a2b4a]">
                                    <a href="#" className="flex items-center gap-4 px-4 py-3 text-red-500 hover:text-red-400 font-medium transition-colors">
                                        <span className="material-symbols-outlined">logout</span>
                                        <span>Sign Out</span>
                                    </a>
                                </div>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">YOUR SPACE</h1>
                            <p className="text-gray-400">Welcome back, Alexa. Here's what's happening with your account.</p>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                            <div className="bg-[#2d1b2d] p-6 rounded-xl border border-[#4a2b4a] flex flex-col justify-between group hover:border-[#d411d4]/50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-medium text-gray-400">Active Orders</p>
                                    <span className="material-symbols-outlined text-[#d411d4]">local_shipping</span>
                                </div>
                                <p className="text-3xl font-bold mt-4">3</p>
                            </div>
                            <div className="bg-[#2d1b2d] p-6 rounded-xl border border-[#4a2b4a] flex flex-col justify-between group hover:border-[#d411d4]/50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-medium text-gray-400">Wishlist Items</p>
                                    <span className="material-symbols-outlined text-[#d411d4]">favorite</span>
                                </div>
                                <p className="text-3xl font-bold mt-4">12</p>
                            </div>

                        </div>

                        {/* Recent Order Section */}
                        <section className="mb-12">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold tracking-tight">RECENT ORDER</h2>
                                <a href="#" className="text-[#d411d4] hover:text-white transition-colors text-sm font-medium">View All History</a>
                            </div>
                            <div className="bg-[#2d1b2d] rounded-xl border border-[#4a2b4a] overflow-hidden p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
                                {/* Order Image */}
                                <div className="w-full md:w-32 h-32 flex-shrink-0 bg-black rounded-lg overflow-hidden relative">
                                    <img
                                        alt="A bold, colorful button-up shirt"
                                        className="w-full h-full object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLj4cK2lJTeDYJjeAGge-3d3mZnp_088bDLTSWiMafLMRRp9FWGwgAc-b93jXe-kf-RAhucb0d2y6eykphP5YuVpVWevLoQZqvmEH16YyZIVX-FFpfkO2PwZc9qJFuvNyI5KqN9T4R7-Mgno1LLsuDs_fKUcybxctuWJv4kFCk1ECzoyx0GC3uLKnCIQKE-UbPVx17SXQh01TUPg7NEjd6R-zeJV44yuzhO2556e2N6pZ0WW_ECk5obdkCLI6MF0PioT4eo3hG_tc"
                                    />
                                </div>
                                {/* Order Info */}
                                <div className="flex-1 w-full flex flex-col gap-2">
                                    <div className="flex justify-between items-start flex-wrap gap-2">
                                        <div>
                                            <h3 className="font-bold text-lg">Order #882910</h3>
                                            <p className="text-sm text-gray-400">Placed on October 24, 2023</p>
                                        </div>
                                        <span className="px-3 py-1 rounded-full bg-[#d411d4]/10 text-[#d411d4] text-xs font-bold uppercase tracking-wider border border-[#d411d4]/20">
                                            Shipped
                                        </span>
                                    </div>
                                    <div className="mt-2 text-sm">
                                        <span className="text-gray-400">Items:</span>
                                        <span className="font-medium ml-1">Geometric Silk Shirt, Neon Belt</span>
                                    </div>
                                    <div className="mt-auto pt-4 flex gap-4">
                                        <button className="bg-[#d411d4] text-white text-sm font-bold px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity">
                                            Track Order
                                        </button>
                                        <button className="bg-transparent border border-gray-600 text-sm font-bold px-6 py-2 rounded-lg hover:border-white hover:text-white transition-colors">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            {/* Personal Info Card */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold tracking-tight">PERSONAL DETAILS</h2>
                                    <button className="text-sm text-gray-500 hover:text-[#d411d4] transition-colors">Edit</button>
                                </div>
                                <div className="bg-[#2d1b2d] rounded-xl border border-[#4a2b4a] p-6 h-full">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                                            <p className="font-medium">Alexa Doe</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Email</p>
                                            <p className="font-medium">alexa.doe@example.com</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                                            <p className="font-medium">+1 (555) 000-1234</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Default Address Card */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold tracking-tight">DEFAULT SHIPPING</h2>
                                    <button className="text-sm text-gray-500 hover:text-[#d411d4] transition-colors">Manage</button>
                                </div>
                                <div className="bg-[#2d1b2d] rounded-xl border border-[#4a2b4a] p-6 h-full relative overflow-hidden">
                                    {/* Background Map decoration */}
                                    <div
                                        className="absolute right-0 top-0 w-32 h-32 opacity-10 pointer-events-none bg-cover"
                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDh8T49cxs--6Rh-l0MkZ78jTeXOiaYpfw_hgVrYX2jz_Z2aTRySr3MxBQV0MYEFjertE5DbSmRF9N9o2ZMdfgVV0SnGBsQjb1pQ-2y50i7IUP-BnAaFdWsK9RKBUvSGyGA44HtuqCyu_tHw-EemikkKmG8Gah2cNtScjpcKeWLP6w0bC-9EvOPnSjiJDmln7vdgAFa6Ek041K2QGvROpejV4qqMwey1sPYC2egp8BzQd9mna8vq9HDGlD9VZxl1T6hG2YK_bE7ehU')" }}
                                    ></div>
                                    <div className="relative z-10 space-y-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="material-symbols-outlined text-[#d411d4]">home</span>
                                            <span className="text-sm font-bold uppercase text-[#d411d4]">Home</span>
                                        </div>
                                        <p className="font-bold text-lg">Alexa Doe</p>
                                        <p className="text-gray-300">123 Fashion Avenue, Apt 4B</p>
                                        <p className="text-gray-300">New York, NY 10012</p>
                                        <p className="text-gray-300">United States</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recommendations */}
                        <section>
                            <h2 className="text-xl font-bold tracking-tight mb-6">RECOMMENDED FOR YOU</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {recommendations.map((product) => (
                                    <Link to={`/product/${product.id}`} key={product.id} className="group cursor-pointer">
                                        <div className="aspect-[3/4] bg-[#2d1b2d] rounded-lg overflow-hidden relative mb-3">
                                            <img
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                src={product.image}
                                            />
                                            <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="material-symbols-outlined text-sm">shopping_bag</span>
                                            </div>
                                        </div>
                                        <h3 className="text-sm font-bold truncate">{product.name}</h3>
                                        <p className="text-xs text-gray-500">{product.price}</p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;
