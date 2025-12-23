import { useState, useEffect, useRef } from 'react';
import { formatPriceVND } from '../../utils/currency';
import { productsAPI, categoriesAPI, uploadAPI } from '../../services/api';

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
    const [categorySearch, setCategorySearch] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [bulkSizeSelection, setBulkSizeSelection] = useState([]);
    const categoryDropdownRef = useRef(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        category_id: '',
        categories: [],
        base_price: '',
        description: '',
        thumbnail: '',
        images: [], // Product gallery
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
                productsAPI.list({ limit: 100, isPublished: 'all' }),
                categoriesAPI.list()
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            setError('Failed to load products');
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

    const getCategoryNames = (categoryIds = []) => {
        if (!Array.isArray(categoryIds)) return getCategoryName(categoryIds);
        const names = categoryIds
            .map(id => getCategoryName(id))
            .filter(Boolean);
        return names.length ? names.join(', ') : 'Unknown';
    };

    // Get product status based on stock (simplified for now)
    const getProductStatus = (product) => {
        return product.is_published ? 'Active' : 'Draft';
    };

    const openEditModal = (product) => {
        setSelectedProduct(product);

        // Transform variants from API format to form format
        const formattedVariants = (product.variants || []).map(v => ({
            id: v.variant_id, // Keep ID for updates
            sku: v.sku || '',
            size: v.attributes?.size || '',
            color: v.attributes?.color || '',
            price: v.price || '',
            stock: v.stock || 0,
            images: v.images || []
        }));

        setFormData({
            name: product.name || '',
            slug: product.slug || '',
            category_id: product.category_id || '',
            categories: product.categories || (product.category_id ? [product.category_id] : []),
            base_price: product.base_price || '',
            description: product.description || '',
            thumbnail: product.thumbnail || '',
            images: product.images || [],
            is_new: product.is_new || false,
            discount_percent: product.discount_percent || 0,
            badge: product.badge || '',
            is_published: product.is_published ?? true,
            variants: formattedVariants
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
            categories: categories[0]?.category_id ? [categories[0].category_id] : [],
            base_price: '',
            description: '',
            thumbnail: '',
            images: [],
            is_new: false,
            discount_percent: 0,
            badge: '',
            is_published: true,
            variants: [
                { sku: '', size: '', color: '', price: '', stock: 0, images: [] }
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
                { sku: '', size: '', color: '', price: '', stock: 0, images: [] }
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

    // Bulk size helpers for faster variant creation
    const toggleBulkSizeSelection = (size) => {
        setBulkSizeSelection(prev =>
            prev.includes(size)
                ? prev.filter(s => s !== size)
                : [...prev, size]
        );
    };

    const addVariantsForSizes = () => {
        if (bulkSizeSelection.length === 0) return;

        setFormData(prev => {
            const template = prev.variants[prev.variants.length - 1];
            const templateColor = template?.color || '';
            const templatePrice = template?.price || '';
            const templateStock = template?.stock ?? 0;
            const templateImages = Array.isArray(template?.images) ? [...template.images] : [];
            const existingCombos = new Set(
                prev.variants.map(v => `${v.size || ''}|${v.color || ''}`)
            );

            const variantsToAdd = bulkSizeSelection
                .map(size => {
                    const key = `${size}|${templateColor}`;
                    if (existingCombos.has(key)) return null;
                    existingCombos.add(key);

                    return {
                        sku: '',
                        size,
                        color: templateColor,
                        price: templatePrice,
                        stock: templateStock,
                        images: templateImages
                    };
                })
                .filter(Boolean);

            if (variantsToAdd.length === 0) {
                return prev;
            }

            return {
                ...prev,
                variants: [...prev.variants, ...variantsToAdd]
            };
        });

        setBulkSizeSelection([]);
    };

    // Handle single file upload for variant (Max 1 image)
    const handleVariantImageUpload = async (variantIndex, file) => {
        if (!file) return;

        setUploading(prev => ({ ...prev, [variantIndex]: true }));
        try {
            const result = await uploadAPI.uploadImage(file);
            setFormData(prev => {
                const newVariants = [...prev.variants];
                // Replace images array with single new image
                newVariants[variantIndex] = {
                    ...newVariants[variantIndex],
                    images: [result.url]
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

    // Remove variant image
    const removeVariantImage = (variantIndex) => {
        setFormData(prev => {
            const newVariants = [...prev.variants];
            newVariants[variantIndex] = {
                ...newVariants[variantIndex],
                images: []
            };
            return { ...prev, variants: newVariants };
        });
    };

    // Thumbnail upload handler
    const [thumbnailUploading, setThumbnailUploading] = useState(false);

    const handleThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setThumbnailUploading(true);
        try {
            const result = await uploadAPI.uploadImage(file);
            setFormData(prev => ({
                ...prev,
                thumbnail: result.url
            }));
        } catch (err) {
            console.error('Thumbnail upload failed:', err);
            setError(`Thumbnail upload failed: ${err.message}`);
        } finally {
            setThumbnailUploading(false);
        }
    };

    const removeThumbnail = () => {
        setFormData(prev => ({ ...prev, thumbnail: '' }));
    };

    // Gallery upload handler (Multiple images)
    const [galleryUploading, setGalleryUploading] = useState(false);

    const handleGalleryUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setGalleryUploading(true);
        try {
            const result = await uploadAPI.uploadImages(files);
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...result.urls]
            }));
        } catch (err) {
            console.error('Gallery upload failed:', err);
            setError(`Gallery upload failed: ${err.message}`);
        } finally {
            setGalleryUploading(false);
        }
    };

    const removeGalleryImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const toggleCategorySelection = (categoryId) => {
        setFormData(prev => {
            const exists = prev.categories.includes(categoryId);
            const nextCategories = exists
                ? prev.categories.filter(id => id !== categoryId)
                : [...prev.categories, categoryId];
            return { ...prev, categories: nextCategories };
        });
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(categorySearch.toLowerCase())
    );

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
                setShowCategoryDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                    variant_id: v.id || null, // Include ID if present
                    sku: v.sku || generateSku(formData.variants.indexOf(v)),
                    attributes: {
                        size: v.size || null,
                        color: v.color || null
                    },
                    price: parseFloat(v.price) || 0,
                    stock: parseInt(v.stock) || 0,
                    images: v.images?.filter(img => img.trim()) || null,
                    is_active: true
                }));

            const combinedCategories = new Set(formData.categories || []);
            if (formData.category_id) combinedCategories.add(parseInt(formData.category_id));

            const productData = {
                name: formData.name,
                slug: formData.slug || generateSlug(formData.name),
                category_id: parseInt(formData.category_id),
                categories: Array.from(combinedCategories),
                base_price: parseFloat(formData.base_price),
                description: formData.description || null,
                thumbnail: formData.thumbnail || null,
                is_new: formData.is_new,
                discount_percent: parseInt(formData.discount_percent) || 0,
                badge: formData.badge || null,
                images: formData.images, // Use form data images which is array of strings
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

    // Delete product
    const handleDelete = async (product) => {
        if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
            return;
        }

        try {
            await productsAPI.delete(product.product_id);
            await fetchData();
        } catch (err) {
            console.error('Failed to delete product:', err);
            setError(err.message || 'Failed to delete product');
            // Scroll to top to show error
            window.scrollTo(0, 0);
        }
    };

    // Toggle product visibility
    const handleTogglePublish = async (product) => {
        try {
            await productsAPI.update(product.product_id, {
                is_published: !product.is_published
            });
            await fetchData();
        } catch (err) {
            console.error('Failed to toggle product visibility:', err);
            setError(err.message || 'Failed to update product');
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
                        <option value="" className="bg-[#1a1a2e]">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.category_id} value={cat.category_id} className="bg-[#1a1a2e]">{cat.name}</option>
                        ))}
                    </select>
                    <select className="bg-white/5 rounded-lg px-4 py-2 text-sm border-none outline-none cursor-pointer">
                        <option value="" className="bg-[#1a1a2e]">All Status</option>
                        <option value="active" className="bg-[#1a1a2e]">Active</option>
                        <option value="out-of-stock" className="bg-[#1a1a2e]">Out of Stock</option>
                        <option value="draft" className="bg-[#1a1a2e]">Draft</option>
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
                                <th className="px-6 py-4 font-medium">Categories</th>
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
                                        <td className="px-6 py-4 text-gray-400">
                                            {getCategoryNames(product.categories?.length ? product.categories : [product.category_id])}
                                        </td>
                                        <td className="px-6 py-4 font-medium">{formatPriceVND(product.base_price)}</td>
                                        <td className="px-6 py-4 text-gray-400">{variantCount} variants</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleTogglePublish(product)}
                                                className={`px-2 py-1 rounded text-xs font-medium cursor-pointer transition-all hover:scale-105 ${status === 'Active'
                                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                    : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                                    }`}
                                                title={status === 'Active' ? 'Click to hide product' : 'Click to publish product'}
                                            >
                                                {status}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product)}
                                                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                                                >
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Primary Category *</label>
                                        <select
                                            name="category_id"
                                            value={formData.category_id}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none"
                                        >
                                            <option value="" className="bg-[#1a1a2e]">Select category</option>
                                            {categories.map(cat => (
                                                <option key={cat.category_id} value={cat.category_id} className="bg-[#1a1a2e]">{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Additional Categories</label>
                                        <div className="relative" ref={categoryDropdownRef}>
                                            <button
                                                type="button"
                                                onClick={() => setShowCategoryDropdown(prev => !prev)}
                                                className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10 focus:border-[#d411d4] outline-none flex items-center justify-between"
                                            >
                                                <span className="text-left truncate">
                                                    {formData.categories.length > 0
                                                        ? `${formData.categories.length} selected`
                                                        : 'Select categories'}
                                                </span>
                                                <span className="material-symbols-outlined text-[18px] text-gray-400">
                                                    {showCategoryDropdown ? 'expand_less' : 'expand_more'}
                                                </span>
                                            </button>

                                            {showCategoryDropdown && (
                                                <div className="absolute z-20 mt-2 w-full bg-[#0f0f1a] border border-white/10 rounded-lg shadow-xl p-3 space-y-2">
                                                    <input
                                                        type="text"
                                                        value={categorySearch}
                                                        onChange={(e) => setCategorySearch(e.target.value)}
                                                        placeholder="Search categories..."
                                                        className="w-full bg-white/5 rounded-md px-3 py-2 text-sm border border-white/10 focus:border-[#d411d4] outline-none"
                                                    />
                                                    <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                                                        {filteredCategories.map(cat => (
                                                            <label key={cat.category_id} className="flex items-center gap-2 text-sm text-gray-300 px-2 py-1 rounded hover:bg-white/5">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.categories.includes(cat.category_id)}
                                                                    onChange={() => toggleCategorySelection(cat.category_id)}
                                                                    className="w-4 h-4 accent-[#d411d4]"
                                                                />
                                                                <span className="truncate">{cat.name}</span>
                                                            </label>
                                                        ))}
                                                        {filteredCategories.length === 0 && (
                                                            <span className="text-xs text-gray-500 px-2 py-1 block">No categories match your search.</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                                                        <span>{formData.categories.length} selected</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, categories: [] }))}
                                                            className="hover:text-white underline"
                                                        >
                                                            Clear all
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {formData.categories.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {formData.categories.map((cid) => {
                                                        const name = getCategoryName(cid);
                                                        return (
                                                            <span key={cid} className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#d411d4]/15 text-[#d411d4] text-xs">
                                                                {name}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleCategorySelection(cid)}
                                                                    className="hover:text-white"
                                                                >
                                                                    ×
                                                                </button>
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-gray-500 mt-1">Primary category is set on the left; choose extra categories here.</p>
                                    </div>
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
                                    <label className="block text-sm font-medium mb-2">Thumbnail Image</label>
                                    <div className="space-y-3">
                                        {formData.thumbnail ? (
                                            <div className="relative w-32 h-32 group">
                                                <img
                                                    src={formData.thumbnail.startsWith('http') ? formData.thumbnail : `${API_BASE}${formData.thumbnail}`}
                                                    alt="Thumbnail preview"
                                                    className="w-full h-full object-cover rounded-lg border border-white/10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={removeThumbnail}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-full">
                                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <span className="material-symbols-outlined text-3xl text-gray-400 mb-2">cloud_upload</span>
                                                        <p className="text-sm text-gray-400">
                                                            {thumbnailUploading ? 'Uploading...' : 'Click to upload thumbnail'}
                                                        </p>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleThumbnailUpload}
                                                        disabled={thumbnailUploading}
                                                    />
                                                </label>
                                            </div>
                                        )}
                                        {/* Hidden input to store URL if needed for form submission logic, though state handles it */}
                                    </div>
                                </div>

                                <div className="mt-4 border-t border-white/5 pt-4">
                                    <label className="block text-sm font-medium mb-2">Product Gallery (Multiple Images)</label>
                                    <div className="flex flex-wrap gap-3">
                                        {/* Existing Gallery Images */}
                                        {formData.images && formData.images.map((imgUrl, idx) => (
                                            <div key={idx} className="relative w-24 h-24 group">
                                                <img
                                                    src={imgUrl.startsWith('http') ? imgUrl : `${API_BASE}${imgUrl}`}
                                                    alt={`Gallery ${idx}`}
                                                    className="w-full h-full object-cover rounded-lg border border-white/10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeGalleryImage(idx)}
                                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}

                                        {/* Upload Button */}
                                        <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                                            <span className="material-symbols-outlined text-2xl text-gray-400">add_photo_alternate</span>
                                            <span className="text-[10px] text-gray-500 mt-1">{galleryUploading ? '...' : 'Add'}</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                multiple
                                                accept="image/*"
                                                onChange={handleGalleryUpload}
                                                disabled={galleryUploading}
                                            />
                                        </label>
                                    </div>
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

                                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-200 uppercase tracking-wider">Add Multiple Sizes</p>
                                            <p className="text-[11px] text-gray-500 mt-1">Select sizes to create variants at once. Uses the latest variant&apos;s color/price/stock when available.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addVariantsForSizes}
                                            disabled={bulkSizeSelection.length === 0}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${bulkSizeSelection.length === 0
                                                ? 'bg-white/5 border-white/10 text-gray-500 cursor-not-allowed'
                                                : 'bg-[#d411d4] border-[#d411d4] text-white hover:bg-[#b00eb0]'
                                                }`}
                                        >
                                            {bulkSizeSelection.length > 0 ? `Add ${bulkSizeSelection.length} size${bulkSizeSelection.length > 1 ? 's' : ''}` : 'Add sizes'}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {SIZE_OPTIONS.map((size) => (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => toggleBulkSizeSelection(size)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${bulkSizeSelection.includes(size)
                                                    ? 'bg-[#d411d4] border-[#d411d4] text-white shadow-lg shadow-[#d411d4]/30'
                                                    : 'bg-[#0f0f1a] border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
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
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Row 1: SKU and Stock */}
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-2 font-medium">SKU</label>
                                                        <input
                                                            type="text"
                                                            value={variant.sku}
                                                            onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                                                            placeholder={generateSku(index)}
                                                            className="w-full bg-[#0f0f1a] rounded-lg px-4 py-2.5 text-sm border border-white/10 focus:border-[#d411d4] outline-none"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-2 font-medium">Extra Price (+)</label>
                                                            <input
                                                                type="number"
                                                                value={variant.price}
                                                                onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                                                placeholder="0"
                                                                className="w-full bg-[#0f0f1a] rounded-lg px-4 py-2.5 text-sm border border-white/10 focus:border-[#d411d4] outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-2 font-medium">Stock</label>
                                                            <input
                                                                type="number"
                                                                value={variant.stock}
                                                                onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                                                                placeholder="0"
                                                                min="0"
                                                                className="w-full bg-[#0f0f1a] rounded-lg px-4 py-2.5 text-sm border border-white/10 focus:border-[#d411d4] outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Row 2: Size Buttons */}
                                                <div className="mt-4">
                                                    <label className="block text-xs text-gray-400 mb-2 font-medium">Size</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {SIZE_OPTIONS.map((size) => (
                                                            <button
                                                                key={size}
                                                                type="button"
                                                                onClick={() => handleVariantChange(index, 'size', size)}
                                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${variant.size === size
                                                                    ? 'bg-[#d411d4] text-white'
                                                                    : 'bg-[#0f0f1a] text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                                                                    }`}
                                                            >
                                                                {size}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Row 3: Color Picker */}
                                                <div className="mt-4">
                                                    <label className="block text-xs text-gray-400 mb-2 font-medium">Color</label>
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        {/* Preset colors */}
                                                        {[
                                                            { name: 'Black', hex: '#1a1a1a' },
                                                            { name: 'White', hex: '#ffffff' },
                                                            { name: 'Navy', hex: '#1e3a5f' },
                                                            { name: 'Gray', hex: '#6b7280' },
                                                            { name: 'Pink', hex: '#ec4899' },
                                                            { name: 'Red', hex: '#ef4444' },
                                                            { name: 'Blue', hex: '#3b82f6' },
                                                            { name: 'Green', hex: '#22c55e' },
                                                        ].map((color) => (
                                                            <button
                                                                key={color.hex}
                                                                type="button"
                                                                onClick={() => handleVariantChange(index, 'color', color.hex)}
                                                                className={`w-8 h-8 rounded-full border-2 transition-all ${variant.color === color.hex
                                                                    ? 'border-[#d411d4] scale-110 ring-2 ring-[#d411d4]/50'
                                                                    : 'border-white/20 hover:border-white/40'
                                                                    }`}
                                                                style={{ backgroundColor: color.hex }}
                                                                title={color.name}
                                                            />
                                                        ))}

                                                        {/* Custom color picker */}
                                                        <div className="flex items-center gap-2 ml-2 pl-3 border-l border-white/10">
                                                            <input
                                                                type="color"
                                                                value={variant.color || '#ffffff'}
                                                                onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                                                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={variant.color || ''}
                                                                onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                                                placeholder="#000000"
                                                                className="w-24 bg-[#0f0f1a] rounded-lg px-3 py-2 text-sm border border-white/10 focus:border-[#d411d4] outline-none font-mono"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Variant Images - Single Image Mode */}
                                                <div className="col-span-2 md:col-span-5 mt-3 pt-3 border-t border-white/10">
                                                    <label className="block text-xs text-gray-500 mb-2">Variant Image (Single)</label>

                                                    {variant.images && variant.images.length > 0 && variant.images[0] ? (
                                                        <div className="relative w-16 h-16 group">
                                                            <img
                                                                src={variant.images[0].startsWith('http') ? variant.images[0] : `${API_BASE}${variant.images[0]}`}
                                                                alt={`Variant ${index + 1}`}
                                                                className="w-full h-full object-cover rounded-lg border border-white/10"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeVariantImage(index)}
                                                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label className="flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-dashed border-white/20 rounded-lg cursor-pointer transition-colors max-w-xs">
                                                            <span className="material-symbols-outlined text-gray-400">cloud_upload</span>
                                                            <div className="text-left">
                                                                <p className="text-xs text-gray-300">Upload Image</p>
                                                                <p className="text-[10px] text-gray-500">{uploading[index] ? 'Uploading...' : 'One image allowed'}</p>
                                                            </div>
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => handleVariantImageUpload(index, e.target.files[0])}
                                                                disabled={uploading[index]}
                                                            />
                                                        </label>
                                                    )}
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
