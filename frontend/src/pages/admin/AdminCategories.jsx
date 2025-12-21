import { useState, useEffect } from 'react';
import { categoriesAPI, uploadAPI } from '../../services/api';

const API_BASE = 'http://localhost:8000';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [error, setError] = useState('');
    const [imageUploading, setImageUploading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        image: '',
        is_active: true
    });

    // Fetch categories
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await categoriesAPI.list();
            setCategories(data);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            setError(err.message);
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

    const openAddModal = () => {
        setSelectedCategory(null);
        setFormData({
            name: '',
            slug: '',
            description: '',
            image: '',
            is_active: true
        });
        setShowModal(true);
        setError('');
    };

    const openEditModal = (category) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name || '',
            slug: category.slug || '',
            description: category.description || '',
            image: category.image || '',
            is_active: category.is_active ?? true
        });
        setShowModal(true);
        setError('');
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            ...(name === 'name' && !selectedCategory ? { slug: generateSlug(value) } : {})
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImageUploading(true);
        try {
            const result = await uploadAPI.uploadImage(file);
            setFormData(prev => ({
                ...prev,
                image: result.url
            }));
        } catch (err) {
            console.error('Image upload failed:', err);
            setError(`Image upload failed: ${err.message}`);
        } finally {
            setImageUploading(false);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, image: '' }));
    };

    const handleSubmit = async () => {
        setError('');
        setSaving(true);

        try {
            if (!formData.name || !formData.slug) {
                setError('Name and slug are required');
                setSaving(false);
                return;
            }

            const categoryData = {
                name: formData.name,
                slug: formData.slug,
                description: formData.description || null,
                image: formData.image || null,
                is_active: formData.is_active
            };

            if (selectedCategory) {
                await categoriesAPI.update(selectedCategory.category_id, categoryData);
            } else {
                await categoriesAPI.create(categoryData);
            }

            await fetchCategories();
            setShowModal(false);
        } catch (err) {
            console.error('Failed to save category:', err);
            setError(err.message || 'Failed to save category');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (category) => {
        if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
            return;
        }

        try {
            await categoriesAPI.delete(category.category_id);
            await fetchCategories();
        } catch (err) {
            console.error('Failed to delete category:', err);
            setError(err.message || 'Failed to delete category');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-400">Loading categories...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Categories</h1>
                    <p className="text-gray-400 mt-1">Manage product categories</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="px-4 py-2 bg-[#d411d4] hover:bg-[#b00eb0] rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-fit"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add Category
                </button>
            </div>

            {/* Error message */}
            {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            {/* Categories grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                    <div
                        key={category.category_id}
                        className="bg-[#1a1a2e] rounded-xl border border-white/5 overflow-hidden group hover:border-[#d411d4]/30 transition-all"
                    >
                        {/* Category image */}
                        <div className="aspect-video relative bg-white/5">
                            {category.image ? (
                                <img
                                    src={category.image.startsWith('/') ? `${API_BASE}${category.image}` : category.image}
                                    alt={category.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-4xl text-gray-600">category</span>
                                </div>
                            )}
                            {/* Status badge */}
                            <span className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-medium ${category.is_active
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                {category.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        {/* Category info */}
                        <div className="p-4">
                            <h3 className="font-semibold text-lg">{category.name}</h3>
                            <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                                {category.description || 'No description'}
                            </p>
                            <p className="text-gray-500 text-xs mt-2">
                                Slug: <code className="bg-white/10 px-1 rounded">{category.slug}</code>
                            </p>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                                <button
                                    onClick={() => openEditModal(category)}
                                    className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(category)}
                                    className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty state */}
            {categories.length === 0 && (
                <div className="text-center py-12">
                    <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">category</span>
                    <h3 className="text-xl font-semibold mb-2">No categories yet</h3>
                    <p className="text-gray-400 mb-4">Create your first category to organize products</p>
                    <button
                        onClick={openAddModal}
                        className="px-4 py-2 bg-[#d411d4] hover:bg-[#b00eb0] rounded-lg text-sm font-medium transition-colors"
                    >
                        Add Category
                    </button>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a2e] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-lg font-bold">
                                {selectedCategory ? 'Edit Category' : 'Add Category'}
                            </h2>
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
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Category Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none transition-colors"
                                    placeholder="Enter category name"
                                />
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Slug *</label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none transition-colors"
                                    placeholder="category-slug"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none resize-none transition-colors"
                                    placeholder="Category description..."
                                />
                            </div>

                            {/* Image */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Category Image</label>
                                <div className="space-y-3">
                                    {formData.image ? (
                                        <div className="relative w-full h-40 group">
                                            <img
                                                src={formData.image.startsWith('/') ? `${API_BASE}${formData.image}` : formData.image}
                                                alt="Category preview"
                                                className="w-full h-full object-cover rounded-lg border border-white/10"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">close</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                                            <div className="flex flex-col items-center justify-center py-6">
                                                <span className="material-symbols-outlined text-3xl text-gray-400 mb-2">cloud_upload</span>
                                                <p className="text-sm text-gray-400">
                                                    {imageUploading ? 'Uploading...' : 'Click to upload image'}
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={imageUploading}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Active status */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 accent-[#d411d4] rounded"
                                />
                                <span className="text-sm">Active (visible on store)</span>
                            </label>
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
                                {saving ? 'Saving...' : (selectedCategory ? 'Save Changes' : 'Add Category')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
