/**
 * API Service for Fashion Shop
 * Handles all API calls to the backend
 */

const API_BASE = 'http://localhost:8000';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // If body is FormData, delete Content-Type to let browser set it with boundary
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    console.log(`[API] ${endpoint} status:`, response.status);
    console.log(`[API] ${endpoint} headers:`, [...response.headers.entries()]);

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { detail: response.statusText || 'An error occurred' };
        }
        const errorMessage = errorData.detail || JSON.stringify(errorData) || 'API request failed';
        throw new Error(errorMessage);
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return null;
    }

    return response.json();
}

// Products API
export const productsAPI = {
    /**
     * Get all products with optional filters
     */
    list: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.categoryId) searchParams.append('category_id', params.categoryId);
        if (params.isNew !== undefined) searchParams.append('is_new', params.isNew);
        if (params.isSale !== undefined) searchParams.append('is_sale', params.isSale);
        if (params.sortBy) searchParams.append('sort_by', params.sortBy);
        if (params.limit) searchParams.append('limit', params.limit);
        if (params.offset) searchParams.append('offset', params.offset);

        const queryString = searchParams.toString();
        return fetchAPI(`/catalog/products${queryString ? `?${queryString}` : ''}`);
    },

    /**
     * Get a single product by ID
     */
    get: (productId) => fetchAPI(`/catalog/products/${productId}`),

    /**
     * Create a new product (admin only)
     */
    create: (data) => {
        const token = localStorage.getItem('token');
        return fetchAPI('/catalog/products', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },

    /**
     * Update a product (admin only)
     */
    update: (productId, data) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/catalog/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },

    /**
     * Delete a product (admin only)
     */
    delete: (productId) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/catalog/products/${productId}`, {
            method: 'DELETE',
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },

    /**
     * Get product variants
     */
    getVariants: (productId) => fetchAPI(`/catalog/products/${productId}/variants`),
};



// Categories API
export const categoriesAPI = {
    /**
     * Get all categories
     */
    list: (isActive = null) => {
        const params = isActive !== null ? `?is_active=${isActive}` : '';
        return fetchAPI(`/catalog/categories${params}`);
    },

    /**
     * Get a single category
     */
    get: (categoryId) => fetchAPI(`/catalog/categories/${categoryId}`),

    /**
     * Create a new category (admin only)
     */
    create: (data) => {
        const token = localStorage.getItem('token');
        return fetchAPI('/catalog/categories', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },

    /**
     * Update a category (admin only)
     */
    update: (categoryId, data) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/catalog/categories/${categoryId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },

    /**
     * Delete a category (admin only)
     */
    delete: (categoryId) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/catalog/categories/${categoryId}`, {
            method: 'DELETE',
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
};

// Reviews API
export const reviewsAPI = {
    /**
     * Get reviews for a product
     */
    list: (productId, params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.limit) searchParams.append('limit', params.limit);
        if (params.offset) searchParams.append('offset', params.offset);

        const queryString = searchParams.toString();
        return fetchAPI(`/reviews/products/${productId}${queryString ? `?${queryString}` : ''}`);
    },

    /**
     * Get all reviews (for admin)
     */
    listAll: () => {
        const token = localStorage.getItem('token');
        return fetchAPI('/reviews', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },

    /**
     * Get review summary for a product
     */
    getSummary: (productId) => fetchAPI(`/reviews/products/${productId}/summary`),

    /**
     * Mark a review as helpful
     */
    markHelpful: (reviewId) => fetchAPI(`/reviews/${reviewId}/helpful`, { method: 'POST' }),

    /**
     * Approve a review
     */
    approve: (reviewId) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/reviews/${reviewId}/approve`, {
            method: 'PATCH',
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },

    /**
     * Reject a review
     */
    reject: (reviewId) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/reviews/${reviewId}/reject`, {
            method: 'PATCH',
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
};

// Users API (for admin)
export const usersAPI = {
    /**
     * Get all users
     */
    list: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.limit) searchParams.append('limit', params.limit);
        if (params.offset) searchParams.append('offset', params.offset);
        if (params.role) searchParams.append('role', params.role);
        const queryString = searchParams.toString();
        const token = localStorage.getItem('token');
        return fetchAPI(`/users${queryString ? `?${queryString}` : ''}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },

    /**
     * Create a new user (admin only)
     */
    create: (userData) => {
        const token = localStorage.getItem('token');
        return fetchAPI('/users/admin', {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },

    /**
     * Get a single user
     */
    get: (userId) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/users/${userId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },

    /**
     * Update user role
     */
    updateRole: (userId, role) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/users/${userId}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ role }),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
};

// Auth API
export const authAPI = {
    /**
     * Login user
     */
    login: (email, password) => {
        const formData = new FormData();
        formData.append('username', email); // backend uses OAuth2PasswordRequestForm which expects 'username'
        formData.append('password', password);
        return fetchAPI('/auth/login', {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header, let browser set it with boundary for FormData
            headers: {}
        });
    },

    /**
     * Register user
     */
    register: (userData) => fetchAPI('/users', { method: 'POST', body: JSON.stringify(userData) }),

    /**
     * Get current user
     */
    me: (token) => fetchAPI('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
    }),

    /**
     * Update current user's profile
     */
    updateProfile: (data) => {
        const token = localStorage.getItem('token');
        return fetchAPI('/users/me', {
            method: 'PATCH',
            body: JSON.stringify(data),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },

    /**
     * Change current user's password
     */
    changePassword: (currentPassword, newPassword) => {
        const token = localStorage.getItem('token');
        return fetchAPI('/users/me/change-password', {
            method: 'POST',
            body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },

    /**
     * Get current user's orders
     */
    getMyOrders: () => {
        const token = localStorage.getItem('token');
        return fetchAPI('/users/me/orders', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
};

// Addresses API (for current user)
export const addressesAPI = {
    /**
     * Get current user's addresses
     */
    list: () => {
        const token = localStorage.getItem('token');
        return fetchAPI('/locations/me/addresses', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },

    /**
     * Create a new address
     */
    create: (data) => {
        const token = localStorage.getItem('token');
        return fetchAPI('/locations/me/addresses', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },

    /**
     * Update an address
     */
    update: (addressId, data) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/locations/me/addresses/${addressId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },

    /**
     * Delete an address
     */
    delete: (addressId) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/locations/me/addresses/${addressId}`, {
            method: 'DELETE',
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
};

// Locations API (provinces and wards)
export const locationsAPI = {
    /**
     * Get all provinces
     */
    getProvinces: () => fetchAPI('/locations/provinces'),

    /**
     * Get wards by province
     */
    getWards: (provinceId) => fetchAPI(`/locations/provinces/${provinceId}/wards`),
};

// Orders API (for admin)
export const ordersAPI = {
    list: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.status) searchParams.append('status', params.status);
        if (params.limit) searchParams.append('limit', params.limit);
        if (params.offset) searchParams.append('offset', params.offset);
        const queryString = searchParams.toString();
        const token = localStorage.getItem('token');
        return fetchAPI(`/orders${queryString ? `?${queryString}` : ''}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
    get: (orderId) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/orders/${orderId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
    updateStatus: (orderId, status) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
};

// Admin Stats API
export const adminAPI = {
    /**
     * Get dashboard stats
     */
    getStats: () => fetchAPI('/admin/stats'),

    /**
     * Get recent orders
     */
    getRecentOrders: (limit = 5) => fetchAPI(`/admin/orders/recent?limit=${limit}`),
};

// Dashboard API
export const dashboardAPI = {
    /**
     * Get dashboard statistics
     */
    getStats: (period = 'day', startDate = null, endDate = null) => {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({ period });
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        return fetchAPI(`/dashboard/stats?${params.toString()}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },

    /**
     * Export to Excel
     */
    exportExcel: async (period = 'day', startDate = null, endDate = null) => {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({ period });
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        const response = await fetch(`${API_BASE}/dashboard/export/excel?${params.toString()}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!response.ok) throw new Error('Export failed');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales_report_${period}_${startDate || 'default'}_${endDate || 'default'}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    },

    /**
     * Export to PDF
     */
    exportPdf: async (period = 'day', startDate = null, endDate = null) => {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({ period });
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        const response = await fetch(`${API_BASE}/dashboard/export/pdf?${params.toString()}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!response.ok) throw new Error('Export failed');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales_report_${period}_${startDate || 'default'}_${endDate || 'default'}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
};

// Export a default API object for convenience
const api = {
    products: productsAPI,
    categories: categoriesAPI,
    reviews: reviewsAPI,
    users: usersAPI,
    orders: ordersAPI,
    auth: authAPI,
    admin: adminAPI,
    dashboard: dashboardAPI,
    addresses: addressesAPI,
    locations: locationsAPI,
};

// Upload API
export const uploadAPI = {
    /**
     * Upload multiple images
     */
    uploadImages: (files) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        return fetchAPI('/upload/images', {
            method: 'POST',
            body: formData,
            headers: {}
        });
    },

    /**
     * Upload single image
     */
    uploadImage: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return fetchAPI('/upload/image', {
            method: 'POST',
            body: formData,
            headers: {}
        });
    },
}

export default api;

