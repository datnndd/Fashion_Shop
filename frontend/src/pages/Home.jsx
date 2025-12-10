import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ColorNavBar from '../components/ColorNavBar';
import CategorySlider from '../components/CategorySlider';
import ProductCard from '../components/ProductCard';
import { heroContent, heroItem, staggerContainer, staggerItem, fadeInUp } from '../utils/animations';

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
];

const Home = () => {
  const [activeColor, setActiveColor] = useState(null);
  const [activeCategory, setActiveCategory] = useState('tshirt');
  const { scrollY } = useScroll();

  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.1]);

  // Filter products based on color and category
  const filteredProducts = allProducts.filter((product) => {
    const colorMatch = !activeColor || product.colorId === activeColor;
    const categoryMatch = product.category === activeCategory;
    return colorMatch && categoryMatch;
  });

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* HERO SECTION */}
      <motion.section
        className="relative h-screen w-full overflow-hidden"
        style={{ opacity: heroOpacity }}
      >
        {/* Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"
          style={{ scale: heroScale }}
        >
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
          />
        </motion.div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Hero Content */}
        <motion.div
          className="relative z-10 h-full flex flex-col justify-end pb-24 md:pb-32 px-6 md:px-16 max-w-7xl mx-auto"
          variants={heroContent}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="text-xs md:text-sm uppercase tracking-[0.3em] text-white/70 mb-4"
            variants={heroItem}
          >
            BST Basic Mono • Drop 01
          </motion.div>

          <motion.h1
            className="text-3xl md:text-5xl lg:text-6xl font-semibold text-white mb-4 md:mb-6 max-w-2xl leading-tight"
            variants={heroItem}
          >
            Áo thun đơn sắc
            <br />
            <span className="font-light text-white/90">không logo</span>
          </motion.h1>

          <motion.p
            className="text-base md:text-lg text-white/80 max-w-lg mb-8 leading-relaxed"
            variants={heroItem}
          >
            Bề mặt mịn, phom gọn, trọng lượng vừa phải – lý tưởng cho những ngày
            tối giản hoặc trở thành nền hoàn hảo cho logo thương hiệu của bạn.
          </motion.p>

          <motion.div
            className="text-2xl md:text-3xl font-semibold text-white mb-8"
            variants={heroItem}
          >
            Từ 249.000đ
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-4"
            variants={heroItem}
          >
            <motion.button
              className="px-8 py-3 bg-white text-black text-sm font-medium rounded-full uppercase tracking-wider hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Xem bộ sưu tập
            </motion.button>
            <motion.button
              className="px-8 py-3 border border-white text-white text-sm font-medium rounded-full uppercase tracking-wider hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Thử với logo của bạn
            </motion.button>
          </motion.div>

          {/* Color dots preview */}
          <motion.div
            className="flex items-center gap-3 mt-12"
            variants={heroItem}
          >
            {['#111111', '#D7C4A8', '#1E335A', '#f5f5f5'].map((color, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full ${color === '#f5f5f5' ? 'border border-white/30' : ''}`}
                style={{ backgroundColor: color }}
              />
            ))}
            <span className="text-xs text-white/60 ml-2">4 màu bán chạy tuần này</span>
          </motion.div>
        </motion.div>

        {/* Floating scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span className="text-xs text-white/50 uppercase tracking-widest">Cuộn xuống</span>
          <motion.div
            className="w-5 h-8 border border-white/30 rounded-full flex justify-center pt-1"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* COLOR NAVIGATION */}
      <ColorNavBar activeColor={activeColor} onColorChange={setActiveColor} />

      {/* CATEGORY SLIDER */}
      <CategorySlider activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {/* PRODUCTS SECTION */}
      <section className="py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl md:text-2xl font-medium text-gray-900">
              Sản phẩm {activeColor ? `màu ${activeColor}` : 'nổi bật'}
            </h2>
            <a href="#" className="text-sm text-gray-500 hover:text-black transition-colors">
              Xem tất cả →
            </a>
          </div>

          {/* Product Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
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
              <div className="col-span-full text-center py-16">
                <p className="text-gray-500">Không có sản phẩm nào phù hợp</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* BRAND STUDIO PROMO */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid md:grid-cols-2 gap-12 items-center"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div>
              <span className="text-xs uppercase tracking-widest text-gray-400">Studio Thương Hiệu</span>
              <h2 className="text-2xl md:text-4xl font-medium mt-3 mb-6">
                In logo của bạn lên áo basic
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Upload logo và xem trước trực tiếp trên sản phẩm. Chọn vị trí, kích thước và đặt hàng ngay.
              </p>
              <motion.a
                href="/upload"
                className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white text-sm font-medium rounded-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Vào Studio
                <span>→</span>
              </motion.a>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gray-100 rounded-3xl flex items-center justify-center">
                <div className="w-40 h-48 bg-white rounded-lg shadow-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">👕</div>
                    <div className="px-3 py-1 bg-gray-100 rounded text-xs text-gray-600">
                      your logo here
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
