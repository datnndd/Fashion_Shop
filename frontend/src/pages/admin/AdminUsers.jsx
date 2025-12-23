import { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';

// Password validation helper
const validatePassword = (password) => {
    const requirements = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password),
    };
    const isValid = Object.values(requirements).every(Boolean);
    return { requirements, isValid };
};

const AdminUsers = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [tempRole, setTempRole] = useState('');
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentRole, setCurrentRole] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'customer',
        phone: ''
    });
    const pageSize = 10;

    useEffect(() => {
        fetchUsers();
    }, [currentPage, currentRole]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = {
                limit: pageSize,
                offset: (currentPage - 1) * pageSize
            };
            if (currentRole) params.role = currentRole;

            const data = await usersAPI.list(params);
            setUsers(data.items);
            setTotal(data.total);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError('Could not load users. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            await usersAPI.updateRole(userId, newRole);
            setUsers(prev => prev.map(u =>
                u.user_id === userId ? { ...u, role: newRole } : u
            ));
            if (selectedUser && selectedUser.user_id === userId) {
                setSelectedUser(prev => ({ ...prev, role: newRole }));
            }
            setTempRole('');
        } catch (err) {
            console.error('Failed to update role:', err);
            alert('Failed to update user role');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreateError('');

        // Validate passwords match
        if (newUser.password !== newUser.confirmPassword) {
            setCreateError('Passwords do not match');
            return;
        }

        // Validate password strength
        const { isValid } = validatePassword(newUser.password);
        if (!isValid) {
            setCreateError('Password does not meet security requirements');
            return;
        }

        setCreateLoading(true);

        try {
            await usersAPI.create({
                name: newUser.name,
                email: newUser.email,
                password: newUser.password,
                role: newUser.role,
                phone: newUser.phone || null
            });
            setShowCreateModal(false);
            setNewUser({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                role: 'customer',
                phone: ''
            });
            fetchUsers();
        } catch (err) {
            console.error('Failed to create user:', err);
            setCreateError(err.message || 'Failed to create user. Please try again.');
        } finally {
            setCreateLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(total / pageSize);
    const passwordValidation = validatePassword(newUser.password);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d411d4]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Users</h1>
                    <p className="text-gray-400 mt-1">View and manage user accounts</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-[#d411d4] hover:bg-[#b00eb0] rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-fit"
                >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Create User
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-[#1a1a2e] rounded-xl border border-white/5 p-4">
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-2 w-full">
                        <span className="material-symbols-outlined text-gray-400 text-[20px]">search</span>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-500"
                        />
                    </div>
                </div>
                <div className="bg-[#1a1a2e] rounded-xl border border-white/5 p-2 flex gap-1">
                    {['', 'customer', 'manager'].map((role) => (
                        <button
                            key={role}
                            onClick={() => {
                                setCurrentRole(role);
                                setCurrentPage(1);
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentRole === role
                                ? 'bg-[#d411d4] text-white'
                                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'All Roles'}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
                    {error}
                </div>
            )}

            {/* Users table */}
            <div className="bg-[#1a1a2e] rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-sm text-gray-400 border-b border-white/5">
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium">Joined</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.user_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-[#d411d4] to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${user.role === 'manager'
                                            ? 'bg-purple-500/20 text-purple-400'
                                            : 'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${user.is_active
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedUser(user)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                        No users found
                    </div>
                )}

                {/* Pagination */}
                <div className="p-4 border-t border-white/5 flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                        Showing <span className="text-white">{(currentPage - 1) * pageSize + 1}</span> to <span className="text-white">{Math.min(currentPage * pageSize, total)}</span> of <span className="text-white">{total}</span> users
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a2e] rounded-xl w-full max-w-lg">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-lg font-bold">User Details</h2>
                            <button onClick={() => {
                                setSelectedUser(null);
                                setTempRole('');
                            }} className="text-gray-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Profile */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#d411d4] to-purple-600 rounded-full flex items-center justify-center text-xl font-bold">
                                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                                    <p className="text-gray-400">{selectedUser.email}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${selectedUser.role === 'manager'
                                        ? 'bg-purple-500/20 text-purple-400'
                                        : 'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {selectedUser.role}
                                    </span>
                                </div>
                            </div>

                            {/* Role Management */}
                            <div className="bg-white/5 rounded-lg p-4 space-y-3">
                                <h4 className="text-sm font-medium text-gray-400">Manage Role</h4>
                                <div className="flex items-center gap-3">
                                    <select
                                        value={tempRole || selectedUser.role}
                                        onChange={(e) => setTempRole(e.target.value)}
                                        className="flex-1 bg-[#16162a] border border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:border-[#d411d4] transition-colors"
                                    >
                                        <option value="customer" className="bg-[#1a1a2e]">Customer</option>
                                        <option value="manager" className="bg-[#1a1a2e]">Manager</option>
                                    </select>
                                    {tempRole && tempRole !== selectedUser.role && (
                                        <button
                                            onClick={() => handleRoleUpdate(selectedUser.user_id, tempRole)}
                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-xs font-bold transition-colors uppercase tracking-wider"
                                        >
                                            OK
                                        </button>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500 italic block mt-2">Changing roles affects permissions immediately.</span>
                            </div>

                            {/* Info */}
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Member since</span>
                                    <span>{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Phone</span>
                                    <span>{selectedUser.phone || 'Not provided'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Last Login</span>
                                    <span>{selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'Never'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/5 flex justify-end">
                            <button onClick={() => {
                                setSelectedUser(null);
                                setTempRole('');
                            }} className="px-4 py-2 bg-[#d411d4] hover:bg-[#b00eb0] rounded-lg text-sm font-medium transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a2e] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-lg font-bold">Create New User</h2>
                            <button onClick={() => {
                                setShowCreateModal(false);
                                setCreateError('');
                                setNewUser({
                                    name: '',
                                    email: '',
                                    password: '',
                                    confirmPassword: '',
                                    role: 'customer',
                                    phone: ''
                                });
                            }} className="text-gray-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            {createError && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
                                    {createError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#d411d4] transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#d411d4] transition-colors"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={newUser.phone}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#d411d4] transition-colors"
                                    placeholder="+84 123 456 789"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Role *</label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                                    className="w-full px-4 py-3 bg-[#16162a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#d411d4] transition-colors"
                                >
                                    <option value="customer" className="bg-[#1a1a2e]">Customer</option>
                                    <option value="manager" className="bg-[#1a1a2e]">Manager</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Password *</label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#d411d4] transition-colors"
                                    placeholder="Create a strong password"
                                />
                                {/* Password Requirements */}
                                <div className="mt-3 p-3 bg-white/5 rounded-lg">
                                    <p className="text-xs text-gray-400 mb-2 font-medium">Password must contain:</p>
                                    <ul className="text-xs space-y-1">
                                        <li className={`flex items-center gap-2 ${passwordValidation.requirements.minLength ? 'text-green-400' : 'text-gray-500'}`}>
                                            <span className="material-symbols-outlined text-[14px]">{passwordValidation.requirements.minLength ? 'check_circle' : 'circle'}</span>
                                            At least 8 characters
                                        </li>
                                        <li className={`flex items-center gap-2 ${passwordValidation.requirements.hasUppercase ? 'text-green-400' : 'text-gray-500'}`}>
                                            <span className="material-symbols-outlined text-[14px]">{passwordValidation.requirements.hasUppercase ? 'check_circle' : 'circle'}</span>
                                            At least 1 uppercase letter (A-Z)
                                        </li>
                                        <li className={`flex items-center gap-2 ${passwordValidation.requirements.hasLowercase ? 'text-green-400' : 'text-gray-500'}`}>
                                            <span className="material-symbols-outlined text-[14px]">{passwordValidation.requirements.hasLowercase ? 'check_circle' : 'circle'}</span>
                                            At least 1 lowercase letter (a-z)
                                        </li>
                                        <li className={`flex items-center gap-2 ${passwordValidation.requirements.hasNumber ? 'text-green-400' : 'text-gray-500'}`}>
                                            <span className="material-symbols-outlined text-[14px]">{passwordValidation.requirements.hasNumber ? 'check_circle' : 'circle'}</span>
                                            At least 1 number (0-9)
                                        </li>
                                        <li className={`flex items-center gap-2 ${passwordValidation.requirements.hasSpecial ? 'text-green-400' : 'text-gray-500'}`}>
                                            <span className="material-symbols-outlined text-[14px]">{passwordValidation.requirements.hasSpecial ? 'check_circle' : 'circle'}</span>
                                            At least 1 special character (!@#$%^&*...)
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password *</label>
                                <input
                                    type="password"
                                    value={newUser.confirmPassword}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#d411d4] transition-colors"
                                    placeholder="Confirm your password"
                                />
                                {newUser.confirmPassword && newUser.password !== newUser.confirmPassword && (
                                    <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">error</span>
                                        Passwords do not match
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setCreateError('');
                                        setNewUser({
                                            name: '',
                                            email: '',
                                            password: '',
                                            confirmPassword: '',
                                            role: 'customer',
                                            phone: ''
                                        });
                                    }}
                                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading || !passwordValidation.isValid || newUser.password !== newUser.confirmPassword}
                                    className="flex-1 px-4 py-3 bg-[#d411d4] hover:bg-[#b00eb0] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                                >
                                    {createLoading ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
