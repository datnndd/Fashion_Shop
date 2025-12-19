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
    listAll: () => fetchAPI('/reviews'),

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
    approve: (reviewId) => fetchAPI(`/reviews/${reviewId}/approve`, { method: 'POST' }),

    /**
     * Reject a review
     */
    reject: (reviewId) => fetchAPI(`/reviews/${reviewId}/reject`, { method: 'POST' }),
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
        const queryString = searchParams.toString();
        return fetchAPI(`/users${queryString ? `?${queryString}` : ''}`);
    },

    /**
     * Get a single user
     */
    get: (userId) => fetchAPI(`/users/${userId}`),
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

// Export a default API object for convenience
const api = {
    products: productsAPI,

    categories: categoriesAPI,
    reviews: reviewsAPI,
    users: usersAPI,
    auth: authAPI,
    admin: adminAPI,
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

