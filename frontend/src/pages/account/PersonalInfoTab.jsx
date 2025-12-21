import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

const PersonalInfoTab = () => {
    const { user, refreshUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form state
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        gender: user?.gender || 0,
        dob: user?.dob || '',
    });

    // Password form state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async () => {
        try {
            setLoading(true);
            setMessage({ type: '', text: '' });

            const updateData = {
                name: formData.name,
                phone: formData.phone || null,
                gender: parseInt(formData.gender),
                dob: formData.dob || null,
            };

            await authAPI.updateProfile(updateData);
            await refreshUser(); // Refresh user data in context
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match!' });
            return;
        }
        if (passwordData.newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters!' });
            return;
        }

        try {
            setLoading(true);
            setMessage({ type: '', text: '' });
            await authAPI.changePassword(passwordData.currentPassword, passwordData.newPassword);
            setIsChangingPassword(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setFormData({
            name: user?.name || '',
            phone: user?.phone || '',
            gender: user?.gender || 0,
            dob: user?.dob || '',
        });
    };

    const getGenderLabel = (gender) => {
        switch (parseInt(gender)) {
            case 1: return 'Male';
            case 2: return 'Female';
            default: return 'Not specified';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Personal Information</h2>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#d411d4]/20 text-[#d411d4] rounded-lg hover:bg-[#d411d4]/30 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">edit</span>
                        Edit
                    </button>
                )}
            </div>

            {/* Message */}
            {message.text && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {message.text}
                </div>
            )}

            {/* Profile Form/Display */}
            <div className="bg-[#2d1b2d]/80 rounded-xl border border-[#4a2b4a] p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-[#1d101d] border border-[#4a2b4a] rounded-lg text-white focus:outline-none focus:border-[#d411d4] transition-colors"
                            />
                        ) : (
                            <p className="text-white font-medium">{user?.name || 'Not set'}</p>
                        )}
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Email</label>
                        <p className="text-white font-medium">{user?.email}</p>
                        {isEditing && <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Phone</label>
                        {isEditing ? (
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Enter phone number"
                                className="w-full px-4 py-3 bg-[#1d101d] border border-[#4a2b4a] rounded-lg text-white focus:outline-none focus:border-[#d411d4] transition-colors"
                            />
                        ) : (
                            <p className="text-white font-medium">{user?.phone || 'Not provided'}</p>
                        )}
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Gender</label>
                        {isEditing ? (
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-[#1d101d] border border-[#4a2b4a] rounded-lg text-white focus:outline-none focus:border-[#d411d4] transition-colors"
                            >
                                <option value={0}>Not specified</option>
                                <option value={1}>Male</option>
                                <option value={2}>Female</option>
                            </select>
                        ) : (
                            <p className="text-white font-medium">{getGenderLabel(user?.gender)}</p>
                        )}
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Date of Birth</label>
                        {isEditing ? (
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-[#1d101d] border border-[#4a2b4a] rounded-lg text-white focus:outline-none focus:border-[#d411d4] transition-colors"
                            />
                        ) : (
                            <p className="text-white font-medium">{formatDate(user?.dob)}</p>
                        )}
                    </div>
                </div>

                {/* Edit Actions */}
                {isEditing && (
                    <div className="flex gap-3 mt-6 pt-6 border-t border-[#4a2b4a]">
                        <button
                            onClick={handleSaveProfile}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-[#d411d4] text-white rounded-lg hover:bg-[#b00eb0] transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                            ) : (
                                <span className="material-symbols-outlined">save</span>
                            )}
                            Save Changes
                        </button>
                        <button
                            onClick={cancelEdit}
                            disabled={loading}
                            className="px-6 py-3 bg-gray-600/30 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {/* Change Password Section */}
            <div className="bg-[#2d1b2d]/80 rounded-xl border border-[#4a2b4a] p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold">Password</h3>
                        <p className="text-sm text-gray-400">Change your account password</p>
                    </div>
                    {!isChangingPassword && (
                        <button
                            onClick={() => setIsChangingPassword(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#4a2b4a]/50 text-white rounded-lg hover:bg-[#4a2b4a] transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">lock</span>
                            Change Password
                        </button>
                    )}
                </div>

                {isChangingPassword && (
                    <div className="space-y-4 pt-4 border-t border-[#4a2b4a]">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-3 bg-[#1d101d] border border-[#4a2b4a] rounded-lg text-white focus:outline-none focus:border-[#d411d4] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-3 bg-[#1d101d] border border-[#4a2b4a] rounded-lg text-white focus:outline-none focus:border-[#d411d4] transition-colors"
                            />
                            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-3 bg-[#1d101d] border border-[#4a2b4a] rounded-lg text-white focus:outline-none focus:border-[#d411d4] transition-colors"
                            />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleChangePassword}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 bg-[#d411d4] text-white rounded-lg hover:bg-[#b00eb0] transition-colors disabled:opacity-50"
                            >
                                {loading ? (
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                ) : (
                                    <span className="material-symbols-outlined">lock</span>
                                )}
                                Update Password
                            </button>
                            <button
                                onClick={() => {
                                    setIsChangingPassword(false);
                                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                }}
                                disabled={loading}
                                className="px-6 py-3 bg-gray-600/30 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PersonalInfoTab;
