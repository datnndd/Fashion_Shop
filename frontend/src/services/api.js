/**
 * API Service for Fashion Shop
 * Handles all API calls to the backend
 */

const API_BASE = 'http://localhost:8000';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
        throw new Error(error.detail || 'API request failed');
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
     * Create a new product
     */
    create: (data) => fetchAPI('/catalog/products', { method: 'POST', body: JSON.stringify(data) }),

    /**
     * Update a product
     */
    update: (productId, data) => fetchAPI(`/catalog/products/${productId}`, { method: 'PUT', body: JSON.stringify(data) }),

    /**
     * Delete a product
     */
    delete: (productId) => fetchAPI(`/catalog/products/${productId}`, { method: 'DELETE' }),

    /**
     * Get product variants
     */
    getVariants: (productId) => fetchAPI(`/catalog/products/${productId}/variants`),
};

// Collections API
export const collectionsAPI = {
    /**
     * Get all collections
     */
    list: (isActive = null) => {
        const params = isActive !== null ? `?is_active=${isActive}` : '';
        return fetchAPI(`/collections${params}`);
    },

    /**
     * Get a single collection by ID
     */
    get: (collectionId) => fetchAPI(`/collections/${collectionId}`),

    /**
     * Create a new collection
     */
    create: (data) => fetchAPI('/collections', { method: 'POST', body: JSON.stringify(data) }),

    /**
     * Update a collection
     */
    update: (collectionId, data) => fetchAPI(`/collections/${collectionId}`, { method: 'PUT', body: JSON.stringify(data) }),

    /**
     * Delete a collection
     */
    delete: (collectionId) => fetchAPI(`/collections/${collectionId}`, { method: 'DELETE' }),

    /**
     * Get products in a collection
     */
    getProducts: (collectionId) => fetchAPI(`/collections/${collectionId}/products`),
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
    collections: collectionsAPI,
    categories: categoriesAPI,
    reviews: reviewsAPI,
    users: usersAPI,
    admin: adminAPI,
};

export default api;

