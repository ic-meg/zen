// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:3001',
  ENDPOINTS: {
    PRODUCTS: '/products',
    ORDERS: '/orders',
    AUTH: '/auth',
    CART: '/cart',
    UPLOADS: '/uploads'
  }
}

export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

export const API_URLS = {
  PRODUCTS: getApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS),
  ORDERS: getApiUrl(API_CONFIG.ENDPOINTS.ORDERS),
  AUTH: getApiUrl(API_CONFIG.ENDPOINTS.AUTH),
  CART: getApiUrl(API_CONFIG.ENDPOINTS.CART),
  UPLOADS: getApiUrl(API_CONFIG.ENDPOINTS.UPLOADS),
  
  // Specific endpoints
  CREATE_CHECKOUT_SESSION: getApiUrl(`${API_CONFIG.ENDPOINTS.ORDERS}/create-checkout-session`),
}

export default API_CONFIG