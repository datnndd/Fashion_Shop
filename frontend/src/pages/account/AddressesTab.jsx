import { useState, useEffect } from 'react';
import { addressesAPI, locationsAPI } from '../../services/api';

const AddressesTab = () => {
    const [addresses, setAddresses] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({
        recipient_name: '',
        recipient_phone: '',
        province_id: '',
        ward_id: '',
        street: '',
        full_address: '',
        is_default: false,
    });

    useEffect(() => {
        fetchAddresses();
        fetchProvinces();
    }, []);

    useEffect(() => {
        if (formData.province_id) {
            fetchWards(formData.province_id);
        } else {
            setWards([]);
        }
    }, [formData.province_id]);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const data = await addressesAPI.list();
            setAddresses(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchProvinces = async () => {
        try {
            const data = await locationsAPI.getProvinces();
            setProvinces(data);
        } catch (err) {
            console.error('Failed to load provinces:', err);
        }
    };

    const fetchWards = async (provinceId) => {
        try {
            const data = await locationsAPI.getWards(provinceId);
            setWards(data);
        } catch (err) {
            console.error('Failed to load wards:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            // Reset ward when province changes
            ...(name === 'province_id' ? { ward_id: '' } : {}),
        }));
    };

    const openAddModal = () => {
        setEditingAddress(null);
        setFormData({
            recipient_name: '',
            recipient_phone: '',
            province_id: '',
            ward_id: '',
            street: '',
            full_address: '',
            is_default: false,
        });
        setWards([]);
        setShowModal(true);
    };

    const openEditModal = async (address) => {
        setEditingAddress(address);
        setFormData({
            recipient_name: address.recipient_name,
            recipient_phone: address.recipient_phone,
            province_id: address.province_id,
            ward_id: address.ward_id,
            street: address.street,
            full_address: address.full_address,
            is_default: address.is_default,
        });
        // Fetch wards for the province
        await fetchWards(address.province_id);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (
            !formData.recipient_name ||
            !formData.recipient_phone ||
            !formData.province_id ||
            !formData.ward_id ||
            !formData.street ||
            !formData.full_address
        ) {
            setMessage({ type: 'error', text: 'Please fill in all required fields' });
            return;
        }

        try {
            setSaving(true);
            setMessage({ type: '', text: '' });

            const payload = {
                recipient_name: formData.recipient_name,
                recipient_phone: formData.recipient_phone,
                province_id: parseInt(formData.province_id),
                ward_id: parseInt(formData.ward_id),
                street: formData.street,
                full_address: formData.full_address,
                is_default: formData.is_default,
            };

            if (editingAddress) {
                await addressesAPI.update(editingAddress.shipping_address_id, payload);
                setMessage({ type: 'success', text: 'Address updated successfully!' });
            } else {
                await addressesAPI.create(payload);
                setMessage({ type: 'success', text: 'Address added successfully!' });
            }

            setShowModal(false);
            fetchAddresses();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (addressId) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            await addressesAPI.delete(addressId);
            setMessage({ type: 'success', text: 'Address deleted successfully!' });
            fetchAddresses();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
    };

    const handleSetDefault = async (address) => {
        try {
            await addressesAPI.update(address.shipping_address_id, { is_default: true });
            setMessage({ type: 'success', text: 'Default address updated!' });
            fetchAddresses();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
    };

    const getProvinceName = (provinceId) => {
        const province = provinces.find(p => p.province_id === provinceId);
        return province?.name || 'Unknown';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="material-symbols-outlined text-4xl text-[#d411d4] animate-spin">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">My Addresses</h2>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-[#d411d4] text-white rounded-lg hover:bg-[#b00eb0] transition-colors"
                >
                    <span className="material-symbols-outlined">add</span>
                    Add Address
                </button>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {message.text}
                </div>
            )}

            {/* Addresses List */}
            {addresses.length === 0 ? (
                <div className="text-center py-12 bg-[#2d1b2d]/80 rounded-xl border border-[#4a2b4a]">
                    <span className="material-symbols-outlined text-6xl text-gray-500 mb-4">location_off</span>
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">No addresses yet</h3>
                    <p className="text-gray-500">Add your first shipping address</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                        <div
                            key={address.shipping_address_id}
                            className={`bg-[#2d1b2d]/80 rounded-xl border p-5 relative ${address.is_default ? 'border-[#d411d4]' : 'border-[#4a2b4a]'
                                }`}
                        >
                            {address.is_default && (
                                <span className="absolute top-3 right-3 px-2 py-1 bg-[#d411d4]/20 text-[#d411d4] text-xs rounded-full font-medium">
                                    Default
                                </span>
                            )}

                            <div className="mb-4">
                                <p className="text-white font-medium mb-1">{address.street}</p>
                                <p className="text-gray-400 text-sm">{address.full_address}</p>
                                <p className="text-gray-500 text-xs mt-1">{getProvinceName(address.province_id)}</p>
                            </div>

                            <div className="flex gap-2 pt-3 border-t border-[#4a2b4a]/50">
                                <button
                                    onClick={() => openEditModal(address)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[#4a2b4a]/50 text-white rounded-lg hover:bg-[#4a2b4a] transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base">edit</span>
                                    Edit
                                </button>
                                {!address.is_default && (
                                    <button
                                        onClick={() => handleSetDefault(address)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[#d411d4]/20 text-[#d411d4] rounded-lg hover:bg-[#d411d4]/30 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-base">check_circle</span>
                                        Set Default
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(address.shipping_address_id)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors ml-auto"
                                >
                                    <span className="material-symbols-outlined text-base">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#2d1b2d] rounded-2xl border border-[#4a2b4a] w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-[#4a2b4a]">
                            <h3 className="text-xl font-bold">
                                {editingAddress ? 'Edit Address' : 'Add New Address'}
                            </h3>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Recipient Name */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Recipient Name *</label>
                                <input
                                    type="text"
                                    name="recipient_name"
                                    value={formData.recipient_name}
                                    onChange={handleInputChange}
                                    placeholder="Full name"
                                    className="w-full px-4 py-3 bg-[#1d101d] border border-[#4a2b4a] rounded-lg text-white focus:outline-none focus:border-[#d411d4] transition-colors"
                                />
                            </div>

                            {/* Recipient Phone */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Phone Number *</label>
                                <input
                                    type="tel"
                                    name="recipient_phone"
                                    value={formData.recipient_phone}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 0912345678"
                                    className="w-full px-4 py-3 bg-[#1d101d] border border-[#4a2b4a] rounded-lg text-white focus:outline-none focus:border-[#d411d4] transition-colors"
                                />
                            </div>

                            {/* Province */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Province/City *</label>
                                <select
                                    name="province_id"
                                    value={formData.province_id}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-[#1d101d] border border-[#4a2b4a] rounded-lg text-white focus:outline-none focus:border-[#d411d4] transition-colors"
                                >
                                    <option value="">Select Province/City</option>
                                    {provinces.map(province => (
                                        <option key={province.province_id} value={province.province_id}>
                                            {province.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Ward */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Ward/District *</label>
                                <select
                                    name="ward_id"
                                    value={formData.ward_id}
                                    onChange={handleInputChange}
                                    disabled={!formData.province_id}
                                    className="w-full px-4 py-3 bg-[#1d101d] border border-[#4a2b4a] rounded-lg text-white focus:outline-none focus:border-[#d411d4] transition-colors disabled:opacity-50"
                                >
                                    <option value="">Select Ward/District</option>
                                    {wards.map(ward => (
                                        <option key={ward.ward_id} value={ward.ward_id}>
                                            {ward.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Street */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Street Address *</label>
                                <input
                                    type="text"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleInputChange}
                                    placeholder="123 Main Street"
                                    className="w-full px-4 py-3 bg-[#1d101d] border border-[#4a2b4a] rounded-lg text-white focus:outline-none focus:border-[#d411d4] transition-colors"
                                />
                            </div>

                            {/* Full Address */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Full Address *</label>
                                <textarea
                                    name="full_address"
                                    value={formData.full_address}
                                    onChange={handleInputChange}
                                    placeholder="Full address including building, apartment number, landmarks..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-[#1d101d] border border-[#4a2b4a] rounded-lg text-white focus:outline-none focus:border-[#d411d4] transition-colors resize-none"
                                />
                            </div>

                            {/* Default Address */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="is_default"
                                    id="is_default"
                                    checked={formData.is_default}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 rounded bg-[#1d101d] border-[#4a2b4a] text-[#d411d4] focus:ring-[#d411d4]"
                                />
                                <label htmlFor="is_default" className="text-gray-300">
                                    Set as default address
                                </label>
                            </div>
                        </div>

                        <div className="p-6 border-t border-[#4a2b4a] flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#d411d4] text-white rounded-lg hover:bg-[#b00eb0] transition-colors disabled:opacity-50"
                            >
                                {saving ? (
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                ) : (
                                    <span className="material-symbols-outlined">save</span>
                                )}
                                {editingAddress ? 'Update Address' : 'Save Address'}
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={saving}
                                className="px-6 py-3 bg-gray-600/30 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressesTab;
