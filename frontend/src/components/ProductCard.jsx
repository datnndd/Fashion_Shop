import { useState } from 'react';
import { motion } from 'framer-motion';
import { productCardHover, staggerItem } from '../utils/animations';

const ProductCard = ({ product }) => {
    const [activeColorIndex, setActiveColorIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const activeColor = product.colors?.[activeColorIndex] || '#f5f5f5';

    return (
        <motion.div
            className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer"
            variants={staggerItem}
            whileHover="hover"
            initial="rest"
            animate="rest"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div
                className="relative"
                variants={productCardHover}
            >
                {/* Product Image Area */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
                    {/* Placeholder with active color */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{ backgroundColor: activeColor }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="w-32 h-40 md:w-40 md:h-52 bg-white/20 rounded-lg flex items-center justify-center">
                            <span className="text-4xl opacity-50">👕</span>
                        </div>
                    </motion.div>

                    {/* Hover overlay */}
                    <motion.div
                        className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                        <motion.button
                            className="px-6 py-2 bg-white text-black text-sm font-medium rounded-full shadow-lg"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            Xem chi tiết
                        </motion.button>
                    </motion.div>

                    {/* Label badge */}
                    {product.label && (
                        <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-xs font-medium tracking-wide">
                            {product.label}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                    {/* Brand */}
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                        {product.brand || 'Basic Color'}
                    </p>

                    {/* Name */}
                    <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-1">
                        {product.name}
                    </h3>

                    {/* Price */}
                    <p className="text-base font-semibold text-gray-900 mb-3">
                        {product.price}
                    </p>

                    {/* Color swatches */}
                    {product.colors && product.colors.length > 1 && (
                        <div className="flex items-center gap-2">
                            {product.colors.map((color, index) => (
                                <motion.button
                                    key={index}
                                    className={`
                    w-5 h-5 rounded-full transition-all duration-200
                    ${color === '#FFFFFF' || color === '#f5f5f5' ? 'border border-gray-200' : ''}
                    ${activeColorIndex === index ? 'ring-2 ring-offset-1 ring-gray-400' : ''}
                  `}
                                    style={{ backgroundColor: color }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveColorIndex(index);
                                    }}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                />
                            ))}
                            <span className="text-xs text-gray-400 ml-1">
                                +{product.colors.length} màu
                            </span>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ProductCard;
