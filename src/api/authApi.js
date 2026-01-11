import apiClient from './axiosConfig';

export const authApi = {
  // Send verification code to email
  sendVerificationCode: async (email) => {
    return apiClient.post('/auth/send-verification', { email });
  },

  // Verify email with 4-digit code
  verifyCode: async (email, code) => {
    return apiClient.post('/auth/verify-code', { email, code });
  },

  // Login with email and verification code
  login: async (email, code) => {
    return apiClient.post('/auth/login', { email, code });
  },

  // Get current user profile
  getProfile: async (userId) => {
    return apiClient.get(`/auth/profile/${userId}`);
  },

  // Update user profile
  updateProfile: async (userId, userData) => {
    return apiClient.patch(`/auth/profile/${userId}`, userData);
  },

  // Admin: Get all users
  getAllUsers: async () => {
    return apiClient.get('/auth/users');
  },

  // Logout (client-side token removal)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    return Promise.resolve({ message: 'Logged out successfully' });
  },
};

export default authApi;