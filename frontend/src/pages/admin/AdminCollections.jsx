import { useState, useEffect } from 'react';
import { collectionsAPI } from '../../services/api';

const AdminCollections = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch collections from API
    useEffect(() => {
        const fetchCollections = async () => {
            try {
                setLoading(true);
                const data = await collectionsAPI.list();
                setCollections(data);
            } catch (error) {
                console.error('Failed to fetch collections:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCollections();
    }, []);

    const openEditModal = (collection) => {
        setSelectedCollection(collection);
        setShowModal(true);
    };

    const openAddModal = () => {
        setSelectedCollection(null);
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-400">Loading collections...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Collections</h1>
                    <p className="text-gray-400 mt-1">Manage your collection themes</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="px-4 py-2 bg-[#d411d4] hover:bg-[#b00eb0] rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-fit"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    New Collection
                </button>
            </div>

            {/* Collections grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => {
                    const accentColor = collection.accent_color || '#d411d4';
                    return (
                        <div
                            key={collection.collection_id}
                            className="bg-[#1a1a2e] rounded-xl border border-white/5 overflow-hidden hover:border-white/10 transition-colors group"
                        >
                            {/* Color header */}
                            <div
                                className="h-24 relative"
                                style={{
                                    background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}10)`,
                                    borderBottom: `2px solid ${accentColor}`
                                }}
                            >
                                <div
                                    className="absolute top-4 right-4 w-8 h-8 rounded-full shadow-lg"
                                    style={{ backgroundColor: accentColor }}
                                />
                                {!collection.is_active && (
                                    <span className="absolute top-4 left-4 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded">
                                        Draft
                                    </span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-lg font-bold mb-2">{collection.name}</h3>
                                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{collection.description}</p>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-400">
                                        Collection
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openEditModal(collection)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                        </button>
                                        <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-gray-400 hover:text-red-400">
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Add new card */}
                <button
                    onClick={openAddModal}
                    className="bg-[#1a1a2e] rounded-xl border-2 border-dashed border-white/10 hover:border-[#d411d4]/50 transition-colors flex flex-col items-center justify-center min-h-[240px] group"
                >
                    <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-[#d411d4]/20 flex items-center justify-center transition-colors mb-4">
                        <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-[#d411d4] transition-colors">add</span>
                    </div>
                    <p className="text-gray-400 group-hover:text-white transition-colors font-medium">Add Collection</p>
                </button>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a2e] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-lg font-bold">{selectedCollection ? 'Edit Collection' : 'New Collection'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Collection Name</label>
                                <input
                                    type="text"
                                    defaultValue={selectedCollection?.name || ''}
                                    className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none transition-colors"
                                    placeholder="Enter collection name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    rows={3}
                                    defaultValue={selectedCollection?.description || ''}
                                    className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none resize-none"
                                    placeholder="Collection description..."
                                />
                            </div>

                            {/* Color pickers */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Theme Colors</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Accent Color</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                defaultValue={selectedCollection?.accentColor || '#d411d4'}
                                                className="w-10 h-10 rounded-lg cursor-pointer border-none"
                                            />
                                            <input
                                                type="text"
                                                defaultValue={selectedCollection?.accentColor || '#d411d4'}
                                                className="flex-1 bg-white/5 rounded-lg px-4 py-2 text-sm border border-white/10 focus:border-[#d411d4] outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Secondary Color</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                defaultValue="#c992c9"
                                                className="w-10 h-10 rounded-lg cursor-pointer border-none"
                                            />
                                            <input
                                                type="text"
                                                defaultValue="#c992c9"
                                                className="flex-1 bg-white/5 rounded-lg px-4 py-2 text-sm border border-white/10 focus:border-[#d411d4] outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Cover Image</label>
                                <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-[#d411d4]/50 transition-colors cursor-pointer">
                                    <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">cloud_upload</span>
                                    <p className="text-sm text-gray-400">Drag and drop or click to upload</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="active" defaultChecked className="w-4 h-4 rounded accent-[#d411d4]" />
                                <label htmlFor="active" className="text-sm">Active (visible on store)</label>
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
                                {selectedCollection ? 'Save Changes' : 'Create Collection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCollections;
