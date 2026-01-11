import apiClient from './axiosConfig';

export const productsApi = {
  // Get all products with pagination
  getProducts: async (page = 1, limit = 10, category = '') => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (category) params.append('category', category);
    return apiClient.get(`/products?${params}`);
  },

  // Get single product by ID
  getProduct: async (id) => {
    return apiClient.get(`/products/${id}`);
  },

  // Search products
  searchProducts: async (query, page = 1, limit = 10) => {
    const params = new URLSearchParams({ 
      search: query, 
      page: page.toString(), 
      limit: limit.toString() 
    });
    return apiClient.get(`/products/search?${params}`);
  },

  // Get featured products
  getFeaturedProducts: async () => {
    return apiClient.get('/products/featured');
  },

  // Admin: Create product
  createProduct: async (productData) => {
    return apiClient.post('/products', productData);
  },

  // Admin: Update product
  updateProduct: async (id, productData) => {
    return apiClient.patch(`/products/${id}`, productData);
  },

  // Admin: Delete product
  deleteProduct: async (id, force = false) => {
    const params = force ? '?force=true' : '';
    return apiClient.delete(`/products/${id}${params}`);
  },

  // Admin: Update stock
  updateStock: async (id, stock) => {
    return apiClient.patch(`/products/${id}/stock`, { stock });
  },

  // Upload product image
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post('/products/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default productsApi;