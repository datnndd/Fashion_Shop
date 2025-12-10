import { useState } from 'react';
import { motion } from 'framer-motion';
import { colorSwatchHover, staggerContainer, staggerItem } from '../utils/animations';

const colors = [
    { id: 'black', name: 'Đen', hex: '#111111' },
    { id: 'white', name: 'Trắng', hex: '#FFFFFF', border: true },
    { id: 'beige', name: 'Be', hex: '#D7C4A8' },
    { id: 'gray', name: 'Xám', hex: '#9A9A9A' },
    { id: 'navy', name: 'Navy', hex: '#1E335A' },
    { id: 'olive', name: 'Olive', hex: '#6B7A4C' },
];

const ColorNavBar = ({ activeColor, onColorChange }) => {
    const [hoveredColor, setHoveredColor] = useState(null);

    return (
        <motion.div
            className="w-full py-6 px-4 md:px-8 bg-white/80 backdrop-blur-sm sticky top-16 z-40 border-b border-gray-100"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
        >
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium tracking-widest uppercase text-gray-500">
                        Màu Sắc
                    </h3>
                    <span className="text-xs text-gray-400">
                        {colors.length} màu có sẵn
                    </span>
                </div>

                <motion.div
                    className="flex items-center gap-4 md:gap-6 overflow-x-auto pb-2 scrollbar-hide"
                    variants={staggerContainer}
                >
                    {colors.map((color) => (
                        <motion.button
                            key={color.id}
                            className="group flex flex-col items-center gap-2 min-w-fit"
                            variants={staggerItem}
                            onClick={() => onColorChange(color.id)}
                            onMouseEnter={() => setHoveredColor(color.id)}
                            onMouseLeave={() => setHoveredColor(null)}
                        >
                            <motion.div
                                className={`
                  w-10 h-10 md:w-12 md:h-12 rounded-full cursor-pointer
                  transition-all duration-200
                  ${color.border ? 'border border-gray-200' : ''}
                  ${activeColor === color.id ? 'ring-2 ring-offset-2 ring-black' : ''}
                `}
                                style={{ backgroundColor: color.hex }}
                                variants={colorSwatchHover}
                                initial="rest"
                                whileHover="hover"
                                whileTap="active"
                            />
                            <motion.span
                                className={`
                  text-xs font-medium tracking-wide uppercase
                  transition-colors duration-200
                  ${activeColor === color.id ? 'text-black' : 'text-gray-400'}
                  ${hoveredColor === color.id ? 'text-gray-700' : ''}
                `}
                            >
                                {color.name}
                            </motion.span>
                        </motion.button>
                    ))}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ColorNavBar;
