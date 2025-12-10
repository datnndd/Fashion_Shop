import { useState } from 'react';
import { motion } from 'framer-motion';
import ColorNavBar from '../components/ColorNavBar';
import CategorySlider from '../components/CategorySlider';
import ProductCard from '../components/ProductCard';
import { staggerContainer, fadeInUp } from '../utils/animations';

// Mock product data
const allProducts = [
    {
        id: 1,
        name: 'Basic Tee – Regular Fit',
        price: '249.000đ',
        brand: 'basic color',
        colors: ['#f5f5f5', '#111111', '#D7C4A8'],
        label: 'Bán chạy',
        category: 'tshirt',
        colorId: 'white'
    },
    {
        id: 2,
        name: 'Oversized Tee – Sand',
        price: '299.000đ',
        brand: 'basic color',
        colors: ['#D7C4A8', '#6B7A4C'],
        label: 'Mới',
        category: 'tshirt',
        colorId: 'beige'
    },
    {
        id: 3,
        name: 'Heavyweight Tee – Olive',
        price: '349.000đ',
        brand: 'basic color',
        colors: ['#6B7A4C', '#111111'],
        label: null,
        category: 'tshirt',
        colorId: 'olive'
    },
    {
        id: 4,
        name: 'Basic Polo – Navy',
        price: '399.000đ',
        brand: 'basic color',
        colors: ['#1E335A', '#ffffff', '#9A9A9A'],
        label: null,
        category: 'polo',
        colorId: 'navy'
    },
    {
        id: 5,
        name: 'Essential Tee – Black',
        price: '249.000đ',
        brand: 'basic color',
        colors: ['#111111', '#f5f5f5'],
        label: 'Bestseller',
        category: 'tshirt',
        colorId: 'black'
    },
    {
        id: 6,
        name: 'Relaxed Polo – Gray',
        price: '429.000đ',
        brand: 'basic color',
        colors: ['#9A9A9A', '#111111', '#1E335A'],
        label: null,
        category: 'polo',
        colorId: 'gray'
    },
    {
        id: 7,
        name: 'Chinos – Beige',
        price: '549.000đ',
        brand: 'basic color',
        colors: ['#D7C4A8', '#111111'],
        label: null,
        category: 'pants',
        colorId: 'beige'
    },
    {
        id: 8,
        name: 'Hoodie Essential – Black',
        price: '599.000đ',
        brand: 'basic color',
        colors: ['#111111', '#9A9A9A', '#1E335A'],
        label: 'Mới',
        category: 'hoodie',
        colorId: 'black'
    },
    {
        id: 9,
        name: 'Basic Short – White',
        price: '299.000đ',
        brand: 'basic color',
        colors: ['#f5f5f5', '#111111'],
        label: null,
        category: 'shorts',
        colorId: 'white'
    },
    {
        id: 10,
        name: 'Light Jacket – Navy',
        price: '699.000đ',
        brand: 'basic color',
        colors: ['#1E335A', '#111111'],
        label: 'Premium',
        category: 'jacket',
        colorId: 'navy'
    },
    {
        id: 11,
        name: 'Slim Polo – Black',
        price: '399.000đ',
        brand: 'basic color',
        colors: ['#111111', '#f5f5f5', '#1E335A'],
        label: null,
        category: 'polo',
        colorId: 'black'
    },
    {
        id: 12,
        name: 'Cropped Tee – Beige',
        price: '279.000đ',
        brand: 'basic color',
        colors: ['#D7C4A8', '#f5f5f5'],
        label: 'Mới',
        category: 'tshirt',
        colorId: 'beige'
    },
];

const Products = () => {
    const [activeColor, setActiveColor] = useState(null);
    const [activeCategory, setActiveCategory] = useState('tshirt');

    // Filter products based on color and category
    const filteredProducts = allProducts.filter((product) => {
        const colorMatch = !activeColor || product.colorId === activeColor;
        const categoryMatch = !activeCategory || product.category === activeCategory;
        return colorMatch && categoryMatch;
    });

    const totalProducts = filteredProducts.length;

    return (
        <div className="min-h-screen bg-[#F7F7F7] pt-24 md:pt-28">
            {/* Page Header */}
            <motion.div
                className="bg-white py-8 md:py-12 px-4 md:px-8 border-b border-gray-100"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
            >
                <div className="max-w-7xl mx-auto">
                    <span className="text-xs uppercase tracking-widest text-gray-400">Bộ sưu tập</span>
                    <h1 className="text-2xl md:text-4xl font-medium mt-2">Tất cả sản phẩm</h1>
                </div>
            </motion.div>

            {/* Color Navigation */}
            <ColorNavBar activeColor={activeColor} onColorChange={setActiveColor} />

            {/* Category Slider */}
            <CategorySlider activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

            {/* Products Section */}
            <section className="py-8 md:py-12 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Results header */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-sm text-gray-500">
                            Hiển thị <span className="font-medium text-gray-900">{totalProducts}</span> sản phẩm
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Sắp xếp:</span>
                            <select className="text-sm font-medium text-gray-900 bg-transparent border-none cursor-pointer">
                                <option>Mới nhất</option>
                                <option>Giá: Thấp → Cao</option>
                                <option>Giá: Cao → Thấp</option>
                                <option>Bán chạy</option>
                            </select>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        key={`${activeColor}-${activeCategory}`}
                    >
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            <motion.div
                                className="col-span-full text-center py-20"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="text-5xl mb-4">🔍</div>
                                <p className="text-gray-500 mb-2">Không tìm thấy sản phẩm nào</p>
                                <button
                                    className="text-sm text-black underline"
                                    onClick={() => {
                                        setActiveColor(null);
                                        setActiveCategory('tshirt');
                                    }}
                                >
                                    Xóa bộ lọc
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Products;
