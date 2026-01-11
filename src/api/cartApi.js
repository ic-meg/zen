import apiClient from './axiosConfig';

export const cartApi = {
  // Get user's cart
  getCart: async (userId) => {
    return apiClient.get(`/cart/${userId}`);
  },

  // Add item to cart
  addItem: async (userId, productData) => {
    return apiClient.post(`/cart/${userId}/items`, productData);
  },

  // Update item quantity
  updateItem: async (userId, productId, quantity) => {
    return apiClient.put(`/cart/${userId}/items/${productId}`, { quantity });
  },

  // Remove item from cart
  removeItem: async (userId, productId) => {
    return apiClient.delete(`/cart/${userId}/items/${productId}`);
  },

  // Clear entire cart
  clearCart: async (userId) => {
    return apiClient.delete(`/cart/${userId}`);
  },

  // Get cart summary (item count, total)
  getCartSummary: async (userId) => {
    return apiClient.get(`/cart/${userId}/summary`);
  },
};

export default cartApi;