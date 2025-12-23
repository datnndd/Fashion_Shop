
import { useState, useEffect } from 'react';
import { marketingAPI } from '../../services/api';

const AdminDiscounts = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [error, setError] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        type: 'percentage', // percentage or fixed
        value: '',
        max_discount_amount: '',
        min_order_value: '',
        start_date: '',
        end_date: '',
        usage_limit: '',
        is_active: true
    });

    // Fetch discounts
    useEffect(() => {
        fetchDiscounts();
    }, []);

    const fetchDiscounts = async () => {
        try {
            setLoading(true);
            const data = await marketingAPI.list();
            setDiscounts(data);
        } catch (err) {
            console.error('Failed to fetch discounts:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setSelectedDiscount(null);
        setFormData({
            code: '',
            type: 'percentage',
            value: '',
            max_discount_amount: '',
            min_order_value: '',
            start_date: '',
            end_date: '',
            usage_limit: '',
            is_active: true
        });
        setShowModal(true);
        setError('');
    };

    const openEditModal = (discount) => {
        setSelectedDiscount(discount);
        setFormData({
            code: discount.code,
            type: discount.type,
            value: discount.value,
            max_discount_amount: discount.max_discount_amount || '',
            min_order_value: discount.min_order_value || '',
            start_date: discount.start_date ? discount.start_date.slice(0, 16) : '',
            end_date: discount.end_date ? discount.end_date.slice(0, 16) : '',
            usage_limit: discount.usage_limit || '',
            is_active: discount.is_active
        });
        setShowModal(true);
        setError('');
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async () => {
        setError('');
        setSaving(true);

        try {
            if (!formData.code || !formData.value) {
                setError('Code and value are required');
                setSaving(false);
                return;
            }

            const discountData = {
                code: formData.code.toUpperCase(),
                type: formData.type,
                value: parseFloat(formData.value),
                max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
                min_order_value: formData.min_order_value ? parseFloat(formData.min_order_value) : null,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
                usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
                is_active: formData.is_active
            };

            if (selectedDiscount) {
                await marketingAPI.update(selectedDiscount.discount_id, discountData);
            } else {
                await marketingAPI.create(discountData);
            }

            await fetchDiscounts();
            setShowModal(false);
        } catch (err) {
            console.error('Failed to save discount:', err);
            setError(err.message || 'Failed to save discount');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (discount) => {
        if (!window.confirm(`Are you sure you want to delete "${discount.code}"?`)) {
            return;
        }

        try {
            await marketingAPI.delete(discount.discount_id);
            await fetchDiscounts();
        } catch (err) {
            console.error('Failed to delete discount:', err);
            setError(err.message || 'Failed to delete discount');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-400">Loading discounts...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Discounts</h1>
                    <p className="text-gray-400 mt-1">Manage discount codes</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="px-4 py-2 bg-[#d411d4] hover:bg-[#b00eb0] rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-fit"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Create Discount
                </button>
            </div>

            {/* Error message */}
            {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            {/* Discounts Table */}
            <div className="bg-[#1a1a2e] rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-xs font-semibold uppercase text-gray-400">
                            <tr>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Value</th>
                                <th className="px-6 py-4">Limits</th>
                                <th className="px-6 py-4">Usage</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {discounts.map((discount) => (
                                <tr key={discount.discount_id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-white">{discount.code}</div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {discount.start_date ? new Date(discount.start_date).toLocaleDateString() : 'No start'} -
                                            {discount.end_date ? new Date(discount.end_date).toLocaleDateString() : 'No end'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-white">
                                            {discount.type === 'percentage'
                                                ? `${discount.value}%`
                                                : `$${Number(discount.value).toFixed(2)}`
                                            }
                                        </div>
                                        {discount.max_discount_amount && (
                                            <div className="text-xs text-gray-400 mt-1">
                                                Max: ${Number(discount.max_discount_amount).toFixed(2)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        <div>Min Order: {discount.min_order_value ? `$${Number(discount.min_order_value).toFixed(2)}` : 'None'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-300">
                                            Used: {discount.used_count || 0}
                                            {discount.usage_limit && ` / ${discount.usage_limit}`}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${discount.is_active
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {discount.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(discount)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(discount)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {discounts.length === 0 && (
                    <div className="text-center py-12">
                        <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">local_offer</span>
                        <h3 className="text-xl font-semibold mb-2">No discounts yet</h3>
                        <p className="text-gray-400">Create your first discount code</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a2e] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-lg font-bold">
                                {selectedDiscount ? 'Edit Discount' : 'Create Discount'}
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

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Code */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-2">Discount Code *</label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none transition-colors uppercase"
                                    placeholder="e.g., SUMMER2024"
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none transition-colors text-white"
                                >
                                    <option value="percentage" className="bg-[#1a1a2e]">Percentage (%)</option>
                                    <option value="fixed" className="bg-[#1a1a2e]">Fixed Amount ($)</option>
                                </select>
                            </div>

                            {/* Value */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Value *</label>
                                <input
                                    type="number"
                                    name="value"
                                    value={formData.value}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none transition-colors"
                                    placeholder="0.00"
                                    step="0.01"
                                />
                            </div>

                            {/* Min Order Value */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Min Order Value</label>
                                <input
                                    type="number"
                                    name="min_order_value"
                                    value={formData.min_order_value}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none transition-colors"
                                    placeholder="0.00"
                                    step="0.01"
                                />
                            </div>

                            {/* Max Discount Amount */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Max Discount Amount</label>
                                <input
                                    type="number"
                                    name="max_discount_amount"
                                    value={formData.max_discount_amount}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none transition-colors"
                                    placeholder="0.00"
                                    step="0.01"
                                />
                                <p className="text-xs text-gray-500 mt-1">Useful for percentage discounts</p>
                            </div>

                            {/* Start Date */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Start Date</label>
                                <input
                                    type="datetime-local"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none transition-colors text-white"
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="block text-sm font-medium mb-2">End Date</label>
                                <input
                                    type="datetime-local"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none transition-colors text-white"
                                />
                            </div>

                            {/* Usage Limit */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Usage Limit</label>
                                <input
                                    type="number"
                                    name="usage_limit"
                                    value={formData.usage_limit}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm border border-white/10 focus:border-[#d411d4] outline-none transition-colors"
                                    placeholder="e.g., 100"
                                />
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center pt-8">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 accent-[#d411d4] rounded"
                                    />
                                    <span className="text-sm">Active (usable)</span>
                                </label>
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
                                {saving ? 'Saving...' : (selectedDiscount ? 'Save Changes' : 'Create Discount')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDiscounts;
