import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/ordersApi';
import { cartKeys } from './useCart';
import { toast } from 'react-hot-toast';

// Query keys
export const orderKeys = {
  all: ['orders'],
  lists: () => [...orderKeys.all, 'list'],
  list: (filters) => [...orderKeys.lists(), { filters }],
  details: () => [...orderKeys.all, 'detail'],
  detail: (id) => [...orderKeys.details(), id],
  userOrders: (userId) => [...orderKeys.all, 'user', userId],
};

// Get user's orders
export const useUserOrders = (userId) => {
  return useQuery({
    queryKey: orderKeys.userOrders(userId),
    queryFn: () => ordersApi.getUserOrders(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single order
export const useOrder = (orderId) => {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => ordersApi.getOrder(orderId),
    enabled: !!orderId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Admin: Get all orders
export const useAllOrders = (page = 1, limit = 10, status = '') => {
  return useQuery({
    queryKey: orderKeys.list({ page, limit, status }),
    queryFn: () => ordersApi.getAllOrders(page, limit, status),
    keepPreviousData: true,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Create order from cart
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, orderData }) => ordersApi.createFromCart(userId, orderData),
    onSuccess: (data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.userOrders(userId) });
      
      // Invalidate cart since it will be cleared
      queryClient.invalidateQueries({ queryKey: cartKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: cartKeys.summary(userId) });
      
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      
      toast.success(data.message || 'Order created successfully');
      
      return data;
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create order');
    },
  });
};

// Update order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }) => ordersApi.updateOrderStatus(orderId, status),
    onSuccess: (data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      
  
      const orderData = queryClient.getQueryData(orderKeys.detail(orderId));
      if (orderData?.data?.userId) {
        queryClient.invalidateQueries({ 
          queryKey: orderKeys.userOrders(orderData.data.userId) 
        });
      }
      
      toast.success(data.message || 'Order status updated');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update order status');
    },
  });
};

// Cancel order
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId) => ordersApi.cancelOrder(orderId),
    onMutate: async (orderId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: orderKeys.detail(orderId) });
      
      // Snapshot previous value
      const previousOrder = queryClient.getQueryData(orderKeys.detail(orderId));
      
      //  update order status
      if (previousOrder?.data) {
        queryClient.setQueryData(orderKeys.detail(orderId), {
          ...previousOrder,
          data: {
            ...previousOrder.data,
            status: 'CANCELLED'
          }
        });
      }
      
      return { previousOrder };
    },
    onError: (err, orderId, context) => {
      if (context?.previousOrder) {
        queryClient.setQueryData(orderKeys.detail(orderId), context.previousOrder);
      }
      toast.error(err.message || 'Failed to cancel order');
    },
    onSuccess: (data, orderId) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      
      // Find and invalidate user orders
      const orderData = queryClient.getQueryData(orderKeys.detail(orderId));
      if (orderData?.data?.userId) {
        queryClient.invalidateQueries({ 
          queryKey: orderKeys.userOrders(orderData.data.userId) 
        });
      }
      
      toast.success(data.message || 'Order cancelled successfully');
    },
  });
};

// Track order by order number
export const useTrackOrder = (orderNumber) => {
  return useQuery({
    queryKey: ['track', orderNumber],
    queryFn: () => ordersApi.trackOrder(orderNumber),
    enabled: !!orderNumber,
    retry: false,
    staleTime: 30 * 1000, // 30 seconds
  });
};