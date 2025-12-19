import { useState, useEffect, useRef } from 'react';
import { formatPriceVND } from '../../utils/currency';
import { productsAPI, categoriesAPI, uploadAPI } from '../../services/api';

const API_BASE = 'http://localhost:8000';

const AdminProducts = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState({});
    const [error, setError] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        category_id: '',
        base_price: '',
        description: '',
        thumbnail: '',
        is_new: false,
        discount_percent: 0,
        badge: '',
        is_published: true,
        variants: []
    });

    // Fetch products and categories from API
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsData, categoriesData] = await Promise.all([
                productsAPI.list({ limit: 100 }),
                categoriesAPI.list()
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    // Generate slug from name
    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    // Get category name by ID
    const getCategoryName = (categoryId) => {
        const category = categories.find(c => c.category_id === categoryId);
        return category?.name || 'Unknown';
    };

    // Get product status based on stock (simplified for now)
    const getProductStatus = (product) => {
        return product.is_published ? 'Active' : 'Draft';
    };

    const openEditModal = (product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name || '',
            slug: product.slug || '',
            category_id: product.category_id || '',
            base_price: product.base_price || '',
            description: product.description || '',
            thumbnail: product.thumbnail || '',
            is_new: product.is_new || false,
            discount_percent: product.discount_percent || 0,
            badge: product.badge || '',
            is_published: product.is_published ?? true,
            variants: product.variants || []
        });
        setShowModal(true);
        setError('');
    };

    const openAddModal = () => {
        setSelectedProduct(null);
        setFormData({
            name: '',
            slug: '',
            category_id: categories[0]?.category_id || '',
            base_price: '',
            description: '',
            thumbnail: '',
            is_new: false,
            discount_percent: 0,
            badge: '',
            is_published: true,
            variants: [
                { sku: '', size: '', color: '', price: '', stock: 0, images: [''] }
            ]
        });
        setShowModal(true);
        setError('');
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            // Auto-generate slug when name changes
            ...(name === 'name' && !selectedProduct ? { slug: generateSlug(value) } : {})
        }));
    };

    // Variant handlers
    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [
                ...prev.variants,
                { sku: '', size: '', color: '', price: '', stock: 0, images: [''] }
            ]
        }));
    };

    const removeVariant = (index) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const handleVariantChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map((v, i) =>
                i === index ? { ...v, [field]: value } : v
            )
        }));
    };

    // Handle file upload for variant images
    const handleImageUpload = async (variantIndex, files) => {
        if (!files || files.length === 0) return;

        setUploading(prev => ({ ...prev, [variantIndex]: true }));

        try {
            const result = await uploadAPI.uploadImages(Array.from(files));
            const uploadedUrls = result.urls;

            // Add uploaded URLs to variant images
            setFormData(prev => {
                const newVariants = [...prev.variants];
                const currentImages = newVariants[variantIndex].images?.filter(img => img.trim()) || [];
                newVariants[variantIndex] = {
                    ...newVariants[variantIndex],
                    images: [...currentImages, ...uploadedUrls]
                };
                return { ...prev, variants: newVariants };
            });
        } catch (err) {
            console.error('Upload failed:', err);
            setError(`Upload failed: ${err.message}`);
        } finally {
            setUploading(prev => ({ ...prev, [variantIndex]: false }));
        }
    };

    // Remove an image from variant
    const removeImage = (variantIndex, imageIndex) => {
        setFormData(prev => {
            const newVariants = [...prev.variants];
            const newImages = newVariants[variantIndex].images.filter((_, i) => i !== imageIndex);
            newVariants[variantIndex] = {
                ...newVariants[variantIndex],
                images: newImages
            };
            return { ...prev, variants: newVariants };
        });
    };

    const generateSku = (index) => {
        const variant = formData.variants[index];
        const productSlug = formData.slug || generateSlug(formData.name);
        const size = variant.size?.toUpperCase() || 'X';
        const color = variant.color?.replace('#', '').slice(0, 4).toUpperCase() || 'XXXX';
        return `${productSlug.slice(0, 10).toUpperCase()}-${size}-${color}`;
    };

    const handleSubmit = async () => {
        setError('');
        setSaving(true);

        try {
            // Validate required fields
            if (!formData.name || !formData.category_id || !formData.base_price) {
                setError('Please fill in all required fields (name, category, price)');
                setSaving(false);
                return;
            }

            // Prepare variants data
            const variants = formData.variants
                .filter(v => v.sku || v.size || v.color) // Only include non-empty variants
                .map(v => ({
                    sku: v.sku || generateSku(formData.variants.indexOf(v)),
                    attributes: {
                        size: v.size || null,
                        color: v.color || null
                    },
                    price: parseFloat(v.price) || parseFloat(formData.base_price),
                    stock: parseInt(v.stock) || 0,
                    images: v.images?.filter(img => img.trim()) || null,
                    is_active: true
                }));

            const productData = {
                name: formData.name,
                slug: formData.slug || generateSlug(formData.name),
                category_id: parseInt(formData.category_id),
                base_price: parseFloat(formData.base_price),
                description: formData.description || null,
                thumbnail: formData.thumbnail || null,
                is_new: formData.is_new,
                discount_percent: parseInt(formData.discount_percent) || 0,
                badge: formData.badge || null,
                images: null,
                is_published: formData.is_published,
                variants: variants
            };

            if (selectedProduct) {
                // Update existing product (would need PUT endpoint)
                await productsAPI.update(selectedProduct.product_id, productData);
            } else {
                // Create new product
                await productsAPI.create(productData);
            }

            // Refresh products list
            await fetchData();
            setShowModal(false);
        } catch (err) {
            console.error('Failed to save product:', err);
            setError(err.message || 'Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    // Filter products by search query
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-400">Loading products...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Products</h1>
                    <p className="text-gray-400 mt-1">Manage your product inventory</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="px-4 py-2 bg-[#d411d4] hover:bg-[#b00eb0] rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-fit"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add Product
                </button>
            </div>

            {/* Filters */}
            <div className="bg-[#1a1a2e] rounded-xl border border-white/5 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-lg px-4 py-2">
                        <span className="material-symbols-outlined text-gray-400 text-[20px]">search</span>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-500"
                        />
                    </div>
                    <select className="bg-white/5 rounded-lg px-4 py-2 text-sm border-none outline-none cursor-pointer">
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                        ))}
                    </select>
                    <select className="bg-white/5 rounded-lg px-4 py-2 text-sm border-none outline-none cursor-pointer">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="out-of-stock">Out of Stock</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>
            </div>

            {/* Products table */}
            <div className="bg-[#1a1a2e] rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-sm text-gray-400 border-b border-white/5">
                                <th className="px-6 py-4 font-medium">Product</th>
                                <th className="px-6 py-4 font-medium">Category</th>
                                <th className="px-6 py-4 font-medium">Price</th>
                                <th className="px-6 py-4 font-medium">Variants</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => {
                                const status = getProductStatus(product);
                                const variantCount = product.variants?.length || 0;
                                return (
                                    <tr key={product.product_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {product.thumbnail ? (
                                                    <img src={product.thumbnail} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-[#d411d4]/20 rounded-lg"></div>
                                                )}
                                                <span className="font-medium">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">{getCategoryName(product.category_id)}</td>
                                        <td className="px-6 py-4 font-medium">{formatPriceVND(product.base_price)}</td>
                                        <td className="px-6 py-4 text-gray-400">{variantCount} variants</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${status === 'Active'
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-gray-400 hover:text-red-400">
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
                    <p className="text-sm text-gray-400">Showing {filteredProducts.length} of {products.length} products</p>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white disabled:opacity-50" disabled>
                            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        </button>
                        <button className="w-8 h-8 bg-[#d411d4] rounded-lg text-sm font-medium">1</button>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white disabled:opacity-50" disabled>
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a2e] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-lg font-bold">{selectedProduct ? 'Edit Product' : 'Add Product'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {error && (
                            <div className="mx-6 mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="p-6 space-y-4">
                            {/* Product Info Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Product Information</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Product Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none transition-colors"
                                            placeholder="Enter product name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Slug</label>
                                        <input
                                            type="text"
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none transition-colors"
                                            placeholder="auto-generated-slug"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Category *</label>
                                    <select
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleInputChange}
                                        className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map(cat => (
                                            <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Base Price *</label>
                                        <input
                                            type="number"
                                            name="base_price"
                                            value={formData.base_price}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none"
                                            placeholder="0.00"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Giảm giá (%)</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="range"
                                                name="discount_percent"
                                                min="0"
                                                max="90"
                                                step="5"
                                                value={formData.discount_percent}
                                                onChange={handleInputChange}
                                                className="flex-1 accent-[#d411d4]"
                                            />
                                            <div className="w-16 text-center bg-white/5 rounded px-2 py-1 text-sm font-medium">
                                                {formData.discount_percent}%
                                            </div>
                                        </div>
                                        {formData.discount_percent > 0 && formData.base_price && (
                                            <p className="text-xs text-green-400 mt-1">
                                                Giá sale: {formatPriceVND(parseFloat(formData.base_price) * (1 - formData.discount_percent / 100))}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none resize-none"
                                        placeholder="Product description..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Thumbnail URL</label>
                                    <input
                                        type="text"
                                        name="thumbnail"
                                        value={formData.thumbnail}
                                        onChange={handleInputChange}
                                        className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_published"
                                            checked={formData.is_published}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 accent-[#d411d4]"
                                        />
                                        <span className="text-sm">Published</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_new"
                                            checked={formData.is_new}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 accent-[#d411d4]"
                                        />
                                        <span className="text-sm">New Arrival</span>
                                    </label>
                                    {formData.discount_percent > 0 && (
                                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                                            On Sale (-{formData.discount_percent}%)
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Variants Section */}
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Product Variants</h3>
                                    <button
                                        type="button"
                                        onClick={addVariant}
                                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">add</span>
                                        Add Variant
                                    </button>
                                </div>

                                {formData.variants.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">No variants added. Click "Add Variant" to add size/color options.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {formData.variants.map((variant, index) => (
                                            <div key={index} className="p-4 bg-white/5 rounded-lg space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-400">Variant #{index + 1}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariant(index)}
                                                        className="text-red-400 hover:text-red-300 text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">SKU</label>
                                                        <input
                                                            type="text"
                                                            value={variant.sku}
                                                            onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                                                            placeholder={generateSku(index)}
                                                            className="w-full bg-white/5 rounded px-3 py-2 text-sm border border-white/10 focus:border-[#d411d4] outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Size</label>
                                                        <select
                                                            value={variant.size}
                                                            onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                                                            className="w-full bg-white/5 rounded px-3 py-2 text-sm border border-white/10 focus:border-[#d411d4] outline-none"
                                                        >
                                                            <option value="">Select</option>
                                                            <option value="XS">XS</option>
                                                            <option value="S">S</option>
                                                            <option value="M">M</option>
                                                            <option value="L">L</option>
                                                            <option value="XL">XL</option>
                                                            <option value="XXL">XXL</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Color</label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="color"
                                                                value={variant.color || '#ffffff'}
                                                                onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                                                className="w-10 h-[38px] bg-transparent border border-white/10 rounded cursor-pointer"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={variant.color}
                                                                onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                                                placeholder="#ffffff"
                                                                className="flex-1 bg-white/5 rounded px-3 py-2 text-sm border border-white/10 focus:border-[#d411d4] outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Price</label>
                                                        <input
                                                            type="number"
                                                            value={variant.price}
                                                            onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                                            placeholder={formData.base_price || '0.00'}
                                                            step="0.01"
                                                            className="w-full bg-white/5 rounded px-3 py-2 text-sm border border-white/10 focus:border-[#d411d4] outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Stock</label>
                                                        <input
                                                            type="number"
                                                            value={variant.stock}
                                                            onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                                                            placeholder="0"
                                                            min="0"
                                                            className="w-full bg-white/5 rounded px-3 py-2 text-sm border border-white/10 focus:border-[#d411d4] outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                {/* Variant Images */}
                                                <div className="col-span-2 md:col-span-5 mt-3 pt-3 border-t border-white/10">
                                                    <label className="block text-xs text-gray-500 mb-2">Ảnh variant</label>

                                                    {/* Image previews */}
                                                    {variant.images && variant.images.filter(img => img).length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mb-3">
                                                            {variant.images.filter(img => img).map((imgUrl, imgIndex) => (
                                                                <div key={imgIndex} className="relative group">
                                                                    <img
                                                                        src={imgUrl.startsWith('/') ? `${API_BASE}${imgUrl}` : imgUrl}
                                                                        alt={`Variant ${index + 1} - Image ${imgIndex + 1}`}
                                                                        className="w-16 h-16 object-cover rounded-lg border border-white/10"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeImage(index, imgIndex)}
                                                                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Upload button */}
                                                    <div className="flex gap-2">
                                                        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-dashed border-white/20 rounded-lg cursor-pointer transition-colors">
                                                            <span className="material-symbols-outlined text-gray-400">cloud_upload</span>
                                                            <span className="text-sm text-gray-400">
                                                                {uploading[index] ? 'Đang upload...' : 'Chọn ảnh để upload'}
                                                            </span>
                                                            <input
                                                                type="file"
                                                                multiple
                                                                accept="image/*"
                                                                onChange={(e) => handleImageUpload(index, e.target.files)}
                                                                disabled={uploading[index]}
                                                                className="hidden"
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="px-4 py-2 bg-[#d411d4] hover:bg-[#b00eb0] rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : (selectedProduct ? 'Save Changes' : 'Add Product')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
