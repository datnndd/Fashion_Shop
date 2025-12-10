import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations';

const shirtColors = [
    { id: 'white', name: 'Trắng', hex: '#FFFFFF' },
    { id: 'black', name: 'Đen', hex: '#111111' },
    { id: 'beige', name: 'Be', hex: '#D7C4A8' },
    { id: 'gray', name: 'Xám', hex: '#9A9A9A' },
    { id: 'navy', name: 'Navy', hex: '#1E335A' },
];

const positions = [
    { id: 'left-chest', name: 'Ngực trái', x: '25%', y: '30%', size: '20%' },
    { id: 'center', name: 'Giữa ngực', x: '50%', y: '35%', size: '35%' },
    { id: 'full-front', name: 'Trước ngực lớn', x: '50%', y: '45%', size: '50%' },
];

const Upload = () => {
    const [uploadedImage, setUploadedImage] = useState(null);
    const [selectedColor, setSelectedColor] = useState('white');
    const [selectedPosition, setSelectedPosition] = useState('left-chest');
    const [logoScale, setLogoScale] = useState(100);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const activeShirtColor = shirtColors.find(c => c.id === selectedColor);
    const activePosition = positions.find(p => p.id === selectedPosition);

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target?.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target?.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const isLightColor = ['white', 'beige'].includes(selectedColor);

    return (
        <div className="min-h-screen bg-[#F7F7F7] pt-24 md:pt-28">
            {/* Header */}
            <motion.div
                className="text-center py-8 md:py-12 px-4"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
            >
                <span className="text-xs uppercase tracking-widest text-gray-400">Studio Thương Hiệu</span>
                <h1 className="text-2xl md:text-4xl font-medium mt-3 mb-4">
                    In logo lên áo của bạn
                </h1>
                <p className="text-gray-500 max-w-md mx-auto">
                    Upload logo và xem trước kết quả trực tiếp. Chọn màu áo, vị trí in và đặt hàng.
                </p>
            </motion.div>

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">

                    {/* Preview Panel */}
                    <motion.div
                        className="order-1 lg:order-1"
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                    >
                        <div
                            className="relative aspect-square bg-white rounded-3xl shadow-lg overflow-hidden flex items-center justify-center p-8"
                            style={{ backgroundColor: activeShirtColor?.hex === '#FFFFFF' ? '#f0f0f0' : '#ffffff' }}
                        >
                            {/* T-shirt mockup */}
                            <div className="relative w-64 h-80 md:w-72 md:h-96">
                                {/* Shirt shape */}
                                <motion.div
                                    className="absolute inset-0 rounded-2xl"
                                    style={{
                                        backgroundColor: activeShirtColor?.hex,
                                        boxShadow: isLightColor ? 'inset 0 0 0 1px rgba(0,0,0,0.05)' : 'none'
                                    }}
                                    animate={{ backgroundColor: activeShirtColor?.hex }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Collar */}
                                    <div
                                        className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 rounded-b-full"
                                        style={{
                                            backgroundColor: isLightColor ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'
                                        }}
                                    />

                                    {/* Sleeves indication */}
                                    <div
                                        className="absolute top-8 -left-4 w-8 h-20 rounded-l-2xl"
                                        style={{ backgroundColor: activeShirtColor?.hex, opacity: 0.9 }}
                                    />
                                    <div
                                        className="absolute top-8 -right-4 w-8 h-20 rounded-r-2xl"
                                        style={{ backgroundColor: activeShirtColor?.hex, opacity: 0.9 }}
                                    />
                                </motion.div>

                                {/* Logo placement */}
                                <AnimatePresence>
                                    {uploadedImage ? (
                                        <motion.div
                                            key="logo"
                                            className="absolute"
                                            style={{
                                                left: activePosition?.x,
                                                top: activePosition?.y,
                                                transform: 'translate(-50%, -50%)',
                                                width: activePosition?.size,
                                                maxWidth: `${logoScale}%`,
                                            }}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <img
                                                src={uploadedImage}
                                                alt="Your logo"
                                                className="w-full h-auto object-contain drop-shadow-lg"
                                                style={{
                                                    maxHeight: '120px',
                                                    filter: isLightColor ? 'none' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                                                }}
                                            />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="placeholder"
                                            className="absolute"
                                            style={{
                                                left: activePosition?.x,
                                                top: activePosition?.y,
                                                transform: 'translate(-50%, -50%)',
                                            }}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <div
                                                className="px-4 py-2 rounded-lg border-2 border-dashed text-sm"
                                                style={{
                                                    borderColor: isLightColor ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)',
                                                    color: isLightColor ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)'
                                                }}
                                            >
                                                Logo của bạn
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Position guide */}
                        <p className="text-center text-sm text-gray-400 mt-4">
                            Vị trí: <span className="text-gray-700">{activePosition?.name}</span>
                        </p>
                    </motion.div>

                    {/* Controls Panel */}
                    <motion.div
                        className="order-2 lg:order-2 space-y-8"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Upload Zone */}
                        <motion.div variants={staggerItem}>
                            <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-4">
                                1. Upload Logo
                            </h3>
                            <div
                                className={`
                  relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
                  transition-all duration-300
                  ${isDragging ? 'border-black bg-gray-100' : 'border-gray-300 hover:border-gray-400'}
                  ${uploadedImage ? 'bg-green-50 border-green-300' : ''}
                `}
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />

                                {uploadedImage ? (
                                    <div className="flex items-center justify-center gap-4">
                                        <img src={uploadedImage} alt="Preview" className="w-16 h-16 object-contain" />
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-green-700">Logo đã tải lên!</p>
                                            <p className="text-xs text-gray-500">Click để thay đổi</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-4xl mb-4">📤</div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">
                                            Kéo thả hoặc click để tải logo
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            PNG với nền trong suốt sẽ đẹp nhất
                                        </p>
                                    </>
                                )}
                            </div>
                        </motion.div>

                        {/* Color Selection */}
                        <motion.div variants={staggerItem}>
                            <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-4">
                                2. Chọn màu áo
                            </h3>
                            <div className="flex items-center gap-3">
                                {shirtColors.map((color) => (
                                    <motion.button
                                        key={color.id}
                                        className={`
                      w-12 h-12 rounded-full transition-all
                      ${color.hex === '#FFFFFF' ? 'border border-gray-200' : ''}
                      ${selectedColor === color.id ? 'ring-2 ring-offset-2 ring-black' : ''}
                    `}
                                        style={{ backgroundColor: color.hex }}
                                        onClick={() => setSelectedColor(color.id)}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                Đang chọn: <span className="font-medium text-gray-800">{activeShirtColor?.name}</span>
                            </p>
                        </motion.div>

                        {/* Position Selection */}
                        <motion.div variants={staggerItem}>
                            <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-4">
                                3. Vị trí in
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                {positions.map((pos) => (
                                    <motion.button
                                        key={pos.id}
                                        className={`
                      px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${selectedPosition === pos.id
                                                ? 'bg-black text-white'
                                                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-400'
                                            }
                    `}
                                        onClick={() => setSelectedPosition(pos.id)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {pos.name}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Size Slider */}
                        <motion.div variants={staggerItem}>
                            <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-4">
                                4. Kích thước logo
                            </h3>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-400">Nhỏ</span>
                                <input
                                    type="range"
                                    min="50"
                                    max="150"
                                    value={logoScale}
                                    onChange={(e) => setLogoScale(Number(e.target.value))}
                                    className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                                />
                                <span className="text-sm text-gray-400">Lớn</span>
                            </div>
                        </motion.div>

                        {/* CTA Button */}
                        <motion.div variants={staggerItem} className="pt-4">
                            <motion.button
                                className={`
                  w-full py-4 rounded-full text-sm font-medium uppercase tracking-wider
                  transition-all
                  ${uploadedImage
                                        ? 'bg-black text-white hover:bg-gray-800'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }
                `}
                                disabled={!uploadedImage}
                                whileHover={uploadedImage ? { scale: 1.01 } : {}}
                                whileTap={uploadedImage ? { scale: 0.99 } : {}}
                            >
                                Đặt hàng ngay
                            </motion.button>
                            <p className="text-center text-xs text-gray-400 mt-3">
                                Giá từ 349.000đ / áo • Đặt từ 10 áo được giảm 15%
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Upload;
