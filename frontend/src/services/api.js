/**
 * API Service for Fashion Shop
 * Handles all API calls to the backend
 */

const API_BASE = import.meta.env.VITE_API_URL;

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
    list: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.categoryId) searchParams.append('category_id', params.categoryId);
        if (params.categoryIds && Array.isArray(params.categoryIds)) {
            params.categoryIds.forEach((id) => searchParams.append('category_ids', id));
        }
        if (params.q) searchParams.append('q', params.q);
        if (params.minPrice) searchParams.append('min_price', params.minPrice);
        if (params.maxPrice) searchParams.append('max_price', params.maxPrice);
        if (params.isNew !== undefined) searchParams.append('is_new', params.isNew);
        if (params.isSale !== undefined) searchParams.append('is_sale', params.isSale);
        if (params.isPublished !== undefined) searchParams.append('is_published', params.isPublished);
        if (params.sortBy) searchParams.append('sort_by', params.sortBy);
        if (params.limit) searchParams.append('limit', params.limit);
        if (params.offset) searchParams.append('offset', params.offset);

        const queryString = searchParams.toString();
        return fetchAPI(`/catalog/products${queryString ? `?${queryString}` : ''}`);
    },
    get: (productId) => fetchAPI(`/catalog/products/${productId}`),
    related: (productId, limit = 8) => fetchAPI(`/catalog/products/${productId}/related?limit=${limit}`),
    create: (data) => {
        const token = localStorage.getItem('token');
        return fetchAPI('/catalog/products', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
    update: (productId, data) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/catalog/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
    delete: (productId) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/catalog/products/${productId}`, {
            method: 'DELETE',
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
    getVariants: (productId) => fetchAPI(`/catalog/products/${productId}/variants`),
};

// Categories API
export const categoriesAPI = {
    list: (isActive = null) => {
        const params = isActive !== null ? `?is_active=${isActive}` : '';
        return fetchAPI(`/catalog/categories${params}`);
    },
    get: (categoryId) => fetchAPI(`/catalog/categories/${categoryId}`),
    create: (data) => {
        const token = localStorage.getItem('token');
        return fetchAPI('/catalog/categories', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
    update: (categoryId, data) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/catalog/categories/${categoryId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
    delete: (categoryId) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/catalog/categories/${categoryId}`, {
            method: 'DELETE',
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
};

// Marketing API (Discounts)
export const marketingAPI = {
    list: (isActive = null) => {
        const token = localStorage.getItem('token');
        const params = isActive !== null ? `?is_active=${isActive}` : '';
        return fetchAPI(`/marketing/discounts${params}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
    get: (discountId) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/marketing/discounts/${discountId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
    create: (data) => {
        const token = localStorage.getItem('token');
        return fetchAPI('/marketing/discounts', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
    update: (discountId, data) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/marketing/discounts/${discountId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
    delete: (discountId) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/marketing/discounts/${discountId}`, {
            method: 'DELETE',
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
};

// Reviews API
export const reviewsAPI = {
    list: (productId, params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.limit) searchParams.append('limit', params.limit);
        if (params.offset) searchParams.append('offset', params.offset);

        const queryString = searchParams.toString();
        return fetchAPI(`/reviews/products/${productId}${queryString ? `?${queryString}` : ''}`);
    },
    listAll: () => {
        const token = localStorage.getItem('token');
        return fetchAPI('/reviews', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
    getSummary: (productId) => fetchAPI(`/reviews/products/${productId}/summary`),
    markHelpful: (reviewId) => fetchAPI(`/reviews/${reviewId}/helpful`, { method: 'POST' }),
    approve: (reviewId) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/reviews/${reviewId}/approve`, {
            method: 'PATCH',
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
    reject: (reviewId) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/reviews/${reviewId}/reject`, {
            method: 'PATCH',
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
};

// Users API
export const usersAPI = {
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
    create: (userData) => {
        const token = localStorage.getItem('token');
        return fetchAPI('/users/admin', {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
    get: (userId) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/users/${userId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
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
    login: (email, password) => {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);
        return fetchAPI('/auth/login', {
            method: 'POST',
            body: formData,
            headers: {}
        });
    },
    register: (userData) => fetchAPI('/users', { method: 'POST', body: JSON.stringify(userData) }),
    me: (token) => fetchAPI('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
    }),
    updateProfile: (data) => {
        const token = localStorage.getItem('token');
        return fetchAPI('/users/me', {
            method: 'PATCH',
            body: JSON.stringify(data),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
    changePassword: (currentPassword, newPassword) => {
        const token = localStorage.getItem('token');
        return fetchAPI('/users/me/change-password', {
            method: 'POST',
            body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
    getMyOrders: () => {
        const token = localStorage.getItem('token');
        return fetchAPI('/users/me/orders', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
    cancelMyOrder: (orderId) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/users/me/orders/${orderId}/cancel`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
};

// Cart API
export const cartAPI = {
    getMyCart: () => {
        const token = localStorage.getItem('token');
        return fetchAPI('/cart', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
    addItem: ({ product_variant_id, quantity = 1 }) => {
        const token = localStorage.getItem('token');
        return fetchAPI('/cart/items', {
            method: 'POST',
            body: JSON.stringify({ product_variant_id, quantity }),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
    updateItem: (cartItemId, quantity) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/cart/items/${cartItemId}`, {
            method: 'PATCH',
            body: JSON.stringify({ quantity }),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
    removeItem: (cartItemId) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/cart/items/${cartItemId}`, {
            method: 'DELETE',
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
    checkout: (data) => {
        const token = localStorage.getItem('token');
        return fetchAPI('/cart/checkout', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
};

// Addresses API
export const addressesAPI = {
    list: () => {
        const token = localStorage.getItem('token');
        return fetchAPI('/locations/me/shipping-addresses', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
    create: (data) => {
        const token = localStorage.getItem('token');
        return fetchAPI('/locations/me/shipping-addresses', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
    update: (addressId, data) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/locations/me/shipping-addresses/${addressId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
    delete: (addressId) => {
        const token = localStorage.getItem('token');
        return fetchAPI(`/locations/me/shipping-addresses/${addressId}`, {
            method: 'DELETE',
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
};

// Locations API
export const locationsAPI = {
    getProvinces: () => fetchAPI('/locations/provinces'),
    getWards: (provinceId) => fetchAPI(`/locations/provinces/${provinceId}/wards`),
};

// Orders API
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
    getStats: () => fetchAPI('/admin/stats'),
    getRecentOrders: (limit = 5) => fetchAPI(`/admin/orders/recent?limit=${limit}`),
};

// Dashboard API
export const dashboardAPI = {
    getStats: (period = 'day', startDate = null, endDate = null) => {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({ period });
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        return fetchAPI(`/dashboard/stats?${params.toString()}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    },
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

// Upload API
export const uploadAPI = {
    uploadImages: (files) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        return fetchAPI('/upload/images', {
            method: 'POST',
            body: formData,
            headers: {}
        });
    },
    uploadImage: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return fetchAPI('/upload/image', {
            method: 'POST',
            body: formData,
            headers: {}
        });
    },
};

// Payments API
export const paymentsAPI = {
    createIntent: (data) => {
        const token = localStorage.getItem('token');
        return fetchAPI('/payments/create-payment-intent', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    }
};

// Export a default API object for convenience
const api = {
    products: productsAPI,
    categories: categoriesAPI,
    marketing: marketingAPI,
    reviews: reviewsAPI,
    users: usersAPI,
    cart: cartAPI,
    orders: ordersAPI,
    auth: authAPI,
    admin: adminAPI,
    dashboard: dashboardAPI,
    addresses: addressesAPI,
    locations: locationsAPI,
    locations: locationsAPI,
    upload: uploadAPI,
    payments: paymentsAPI,
};

export default api;
