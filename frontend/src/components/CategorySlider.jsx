import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { categorySlide, staggerContainer, staggerItem } from '../utils/animations';

const categories = [
    { id: 'tshirt', name: 'Áo Thun', icon: '👕' },
    { id: 'polo', name: 'Áo Polo', icon: '🎽' },
    { id: 'pants', name: 'Quần Dài', icon: '👖' },
    { id: 'shorts', name: 'Quần Short', icon: '🩳' },
    { id: 'jacket', name: 'Áo Khoác', icon: '🧥' },
    { id: 'hoodie', name: 'Hoodie', icon: '🧥' },
];

const CategorySlider = ({ activeCategory, onCategoryChange }) => {
    const [direction, setDirection] = useState(0);
    const scrollRef = useRef(null);

    const handleCategoryChange = (categoryId) => {
        const currentIndex = categories.findIndex(c => c.id === activeCategory);
        const newIndex = categories.findIndex(c => c.id === categoryId);
        setDirection(newIndex > currentIndex ? 1 : -1);
        onCategoryChange(categoryId);
    };

    const scroll = (dir) => {
        if (scrollRef.current) {
            const scrollAmount = dir === 'left' ? -200 : 200;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="relative w-full py-4 md:py-6 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium tracking-widest uppercase text-gray-500">
                        Danh Mục
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => scroll('left')}
                            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <span className="text-gray-600">←</span>
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <span className="text-gray-600">→</span>
                        </button>
                    </div>
                </div>

                <motion.div
                    ref={scrollRef}
                    className="flex items-center gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    {categories.map((category) => (
                        <motion.button
                            key={category.id}
                            className={`
                group flex items-center gap-3 px-5 py-3 rounded-full
                whitespace-nowrap transition-all duration-300
                ${activeCategory === category.id
                                    ? 'bg-black text-white shadow-lg'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-400 hover:shadow-md'
                                }
              `}
                            variants={staggerItem}
                            onClick={() => handleCategoryChange(category.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className="text-lg">{category.icon}</span>
                            <span className="text-sm font-medium tracking-wide">
                                {category.name}
                            </span>
                        </motion.button>
                    ))}
                </motion.div>
            </div>

            {/* Active category indicator with slide animation */}
            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={activeCategory}
                    className="mt-4 px-4 md:px-8 max-w-7xl mx-auto"
                    custom={direction}
                    variants={categorySlide}
                    initial="enter"
                    animate="center"
                    exit="exit"
                >
                    <p className="text-sm text-gray-500">
                        Đang xem:{' '}
                        <span className="font-medium text-black">
                            {categories.find(c => c.id === activeCategory)?.name}
                        </span>
                    </p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default CategorySlider;
