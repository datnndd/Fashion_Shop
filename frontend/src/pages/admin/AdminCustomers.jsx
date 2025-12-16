import { useState } from 'react';

const AdminCustomers = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Mock customers data
    const customers = [
        { id: 1, name: 'Sarah Mitchell', email: 'sarah@email.com', orders: 12, spent: '$1,245.00', joined: 'Oct 15, 2024', status: 'Active' },
        { id: 2, name: 'James Kennedy', email: 'james@email.com', orders: 5, spent: '$520.00', joined: 'Nov 2, 2024', status: 'Active' },
        { id: 3, name: 'Emily Rodriguez', email: 'emily@email.com', orders: 8, spent: '$890.00', joined: 'Sep 28, 2024', status: 'Active' },
        { id: 4, name: 'Marcus Thompson', email: 'marcus@email.com', orders: 3, spent: '$312.00', joined: 'Dec 1, 2024', status: 'Active' },
        { id: 5, name: 'Alex Parker', email: 'alex@email.com', orders: 1, spent: '$55.00', joined: 'Dec 10, 2024', status: 'New' },
        { id: 6, name: 'Lisa Wang', email: 'lisa@email.com', orders: 0, spent: '$0.00', joined: 'Dec 14, 2024', status: 'New' },
    ];

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Customers</h1>
                    <p className="text-gray-400 mt-1">View and manage customer accounts</p>
                </div>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-fit">
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Export
                </button>
            </div>

            {/* Search */}
            <div className="bg-[#1a1a2e] rounded-xl border border-white/5 p-4">
                <div className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-2 max-w-md">
                    <span className="material-symbols-outlined text-gray-400 text-[20px]">search</span>
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-500"
                    />
                </div>
            </div>

            {/* Customers table */}
            <div className="bg-[#1a1a2e] rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-sm text-gray-400 border-b border-white/5">
                                <th className="px-6 py-4 font-medium">Customer</th>
                                <th className="px-6 py-4 font-medium">Orders</th>
                                <th className="px-6 py-4 font-medium">Total Spent</th>
                                <th className="px-6 py-4 font-medium">Joined</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-[#d411d4] to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                                                {customer.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-medium">{customer.name}</p>
                                                <p className="text-sm text-gray-400">{customer.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{customer.orders}</td>
                                    <td className="px-6 py-4 font-medium">{customer.spent}</td>
                                    <td className="px-6 py-4 text-gray-400">{customer.joined}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${customer.status === 'Active'
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {customer.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedCustomer(customer)}
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
            </div>

            {/* Customer Detail Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a2e] rounded-xl w-full max-w-lg">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-lg font-bold">Customer Details</h2>
                            <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Profile */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#d411d4] to-purple-600 rounded-full flex items-center justify-center text-xl font-bold">
                                    {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{selectedCustomer.name}</h3>
                                    <p className="text-gray-400">{selectedCustomer.email}</p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white/5 rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold">{selectedCustomer.orders}</p>
                                    <p className="text-sm text-gray-400">Orders</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold">{selectedCustomer.spent}</p>
                                    <p className="text-sm text-gray-400">Spent</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-[#d411d4]">{selectedCustomer.status}</p>
                                    <p className="text-sm text-gray-400">Status</p>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Member since</span>
                                    <span>{selectedCustomer.joined}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Email</span>
                                    <span>{selectedCustomer.email}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/5 flex justify-end">
                            <button onClick={() => setSelectedCustomer(null)} className="px-4 py-2 bg-[#d411d4] hover:bg-[#b00eb0] rounded-lg text-sm font-medium transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCustomers;
