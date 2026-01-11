import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { toast } from 'react-hot-toast';

// Query keys
export const authKeys = {
  profile: (userId) => ['auth', 'profile', userId],
  users: () => ['auth', 'users'],
};

// Get user profile by userId
export const useProfile = (userId) => {
  return useQuery({
    queryKey: authKeys.profile(userId),
    queryFn: () => authApi.getProfile(userId),
    enabled: !!userId,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: () => {
      // Clear user data if profile fetch fails
      localStorage.removeItem('userId');
      localStorage.removeItem('user');
    },
  });
};

// Send verification code to email
export const useSendVerificationCode = () => {
  return useMutation({
    mutationFn: (email) => authApi.sendVerificationCode(email),
    onSuccess: (data) => {
      toast.success(data.message || 'Verification code sent to your email');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to send verification code');
    },
  });
};

export const useVerifyCode = () => {
  return useMutation({
    mutationFn: ({ email, code }) => authApi.verifyCode(email, code),
    onSuccess: (data) => {
      // Store user data after successful verification
      if (data.user) {
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      toast.success(data.message || 'Email verified successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Verification failed');
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, code }) => authApi.login(email, code),
    onSuccess: (data) => {
      if (data.user) {
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        queryClient.setQueryData(authKeys.profile(data.user.id), { data: data.user });
      }
      toast.success(data.message || 'Login successful');
    },
    onError: (err) => {
      toast.error(err.message || 'Login failed');
    },
  });
};

// Logout user
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
      toast.success('Logged out successfully');
      
      window.location.href = '/';
    },
    onError: (err) => {
      // Even if logout API fails, clear local data
      localStorage.removeItem('userId');
      localStorage.removeItem('user');
      queryClient.clear();
      toast.error(err.message || 'Logout failed');
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, ...profileData }) => authApi.updateProfile(userId, profileData),
    onSuccess: (data, { userId }) => {
      queryClient.setQueryData(authKeys.profile(userId), { data });
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(data));
      
      toast.success('Profile updated successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update profile');
    },
  });
};

// Get all users (admin only)
export const useAllUsers = () => {
  return useQuery({
    queryKey: authKeys.users(),
    queryFn: authApi.getAllUsers,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Check if user is authenticated
export const useIsAuthenticated = () => {
  const userId = localStorage.getItem('userId');
  const user = localStorage.getItem('user');
  const { data: profile, isLoading } = useProfile(userId);
  
  return {
    isAuthenticated: !!userId && !!user && !!profile?.data,
    isLoading: !!userId && isLoading,
    user: profile?.data || (user ? JSON.parse(user) : null),
    userId,
  };
};

// Check if user is admin
export const useIsAdmin = () => {
  const { isAuthenticated, user, isLoading } = useIsAuthenticated();
  
  return {
    isAdmin: isAuthenticated && user?.email === 'admin@gmail.com' && user?.role === 'ADMIN',
    isLoading,
    user,
  };
};