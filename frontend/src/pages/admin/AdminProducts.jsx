import { useState, useEffect } from 'react';
import { productsAPI, categoriesAPI } from '../../services/api';

const AdminProducts = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch products and categories from API
    useEffect(() => {
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
        fetchData();
    }, []);

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
        setShowModal(true);
    };

    const openAddModal = () => {
        setSelectedProduct(null);
        setShowModal(true);
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
                                <th className="px-6 py-4 font-medium">Stock</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => {
                                const status = getProductStatus(product);
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
                                        <td className="px-6 py-4 font-medium">${product.base_price}</td>
                                        <td className="px-6 py-4 text-gray-400">-</td>
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
                    <div className="bg-[#1a1a2e] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-lg font-bold">{selectedProduct ? 'Edit Product' : 'Add Product'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Product Name</label>
                                <input
                                    type="text"
                                    defaultValue={selectedProduct?.name || ''}
                                    className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none transition-colors"
                                    placeholder="Enter product name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select
                                    defaultValue={selectedProduct?.category || ''}
                                    className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none"
                                >
                                    <option value="">Select category</option>
                                    <option value="Tops">Tops</option>
                                    <option value="T-Shirts">T-Shirts</option>
                                    <option value="Hoodies">Hoodies</option>
                                    <option value="Outerwear">Outerwear</option>
                                    <option value="Shirts">Shirts</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Price</label>
                                    <input
                                        type="number"
                                        defaultValue={selectedProduct?.price || ''}
                                        className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Stock</label>
                                    <input
                                        type="number"
                                        defaultValue={selectedProduct?.stock || ''}
                                        className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    rows={3}
                                    className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none resize-none"
                                    placeholder="Product description..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Product Image</label>
                                <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-[#d411d4]/50 transition-colors cursor-pointer">
                                    <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">cloud_upload</span>
                                    <p className="text-sm text-gray-400">Drag and drop or click to upload</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-[#d411d4] hover:bg-[#b00eb0] rounded-lg text-sm font-medium transition-colors">
                                {selectedProduct ? 'Save Changes' : 'Add Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
