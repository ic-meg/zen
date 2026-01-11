import apiClient from './axiosConfig';

export const ordersApi = {
  // Create order from cart
  createFromCart: async (userId, orderData) => {
    return apiClient.post(`/orders/from-cart/${userId}`, orderData);
  },

  // Get user's orders
  getUserOrders: async (userId) => {
    return apiClient.get(`/orders/user/${userId}`);
  },

  // Get single order
  getOrder: async (orderId) => {
    return apiClient.get(`/orders/${orderId}`);
  },

  // Admin: Get all orders
  getAllOrders: async (page = 1, limit = 10, status = '') => {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      limit: limit.toString() 
    });
    if (status) params.append('status', status);
    return apiClient.get(`/orders?${params}`);
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    return apiClient.put(`/orders/${orderId}/status`, { status });
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    return apiClient.put(`/orders/${orderId}/cancel`);
  },

  // Track order
  trackOrder: async (orderNumber) => {
    return apiClient.get(`/orders/track/${orderNumber}`);
  },
};

export default ordersApi;