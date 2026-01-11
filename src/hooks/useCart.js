import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api/cartApi';
import { toast } from 'react-hot-toast';

// Query keys
export const cartKeys = {
  all: ['cart'],
  detail: (userId) => [...cartKeys.all, userId],
  summary: (userId) => [...cartKeys.all, userId, 'summary'],
};

// Get user's cart
export const useCart = (userId) => {
  return useQuery({
    queryKey: cartKeys.detail(userId),
    queryFn: () => cartApi.getCart(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get cart summary
export const useCartSummary = (userId) => {
  return useQuery({
    queryKey: cartKeys.summary(userId),
    queryFn: () => cartApi.getCartSummary(userId),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Add item to cart
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, productData }) => cartApi.addItem(userId, productData),
    onMutate: async ({ userId, productData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: cartKeys.detail(userId) });
      
      const previousCart = queryClient.getQueryData(cartKeys.detail(userId));
      
      // refreshingly update cart
      if (previousCart?.data) {
        const existingItem = previousCart.data.items?.find(
          item => item.productId === productData.productId
        );
        
        let updatedItems;
        if (existingItem) {
          updatedItems = previousCart.data.items.map(item =>
            item.productId === productData.productId
              ? { ...item, quantity: item.quantity + productData.quantity }
              : item
          );
        } else {
          updatedItems = [
            ...(previousCart.data.items || []),
            { ...productData, id: 'temp-' + Date.now() }
          ];
        }
        
        queryClient.setQueryData(cartKeys.detail(userId), {
          ...previousCart,
          data: {
            ...previousCart.data,
            items: updatedItems,
            totalItems: (previousCart.data.totalItems || 0) + productData.quantity,
          }
        });
      }
      
      return { previousCart };
    },
    onError: (err, { userId }, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.detail(userId), context.previousCart);
      }
      toast.error(err.message || 'Failed to add item to cart');
    },
    onSuccess: (data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: cartKeys.summary(userId) });
      toast.success(data.message || 'Item added to cart');
    },
  });
};

// Update item quantity
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, productId, quantity }) => 
      cartApi.updateItem(userId, productId, quantity),
    onMutate: async ({ userId, productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.detail(userId) });
      
      const previousCart = queryClient.getQueryData(cartKeys.detail(userId));
      
      if (previousCart?.data) {
        const updatedItems = previousCart.data.items?.map(item =>
          item.productId === productId
            ? { ...item, quantity, subtotal: item.price * quantity }
            : item
        );
        
        queryClient.setQueryData(cartKeys.detail(userId), {
          ...previousCart,
          data: {
            ...previousCart.data,
            items: updatedItems,
          }
        });
      }
      
      return { previousCart };
    },
    onError: (err, { userId }, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.detail(userId), context.previousCart);
      }
      toast.error(err.message || 'Failed to update item');
    },
    onSuccess: (data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: cartKeys.summary(userId) });
    },
  });
};

// Remove item from cart
export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, productId }) => cartApi.removeItem(userId, productId),
    onMutate: async ({ userId, productId }) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.detail(userId) });
      
      const previousCart = queryClient.getQueryData(cartKeys.detail(userId));
      
      if (previousCart?.data) {
        const updatedItems = previousCart.data.items?.filter(
          item => item.productId !== productId
        );
        
        queryClient.setQueryData(cartKeys.detail(userId), {
          ...previousCart,
          data: {
            ...previousCart.data,
            items: updatedItems,
          }
        });
      }
      
      return { previousCart };
    },
    onError: (err, { userId }, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.detail(userId), context.previousCart);
      }
      toast.error(err.message || 'Failed to remove item');
    },
    onSuccess: (data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: cartKeys.summary(userId) });
      toast.success(data.message || 'Item removed from cart');
    },
  });
};

// Clear entire cart
export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => cartApi.clearCart(userId),
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: cartKeys.summary(userId) });
      toast.success(data.message || 'Cart cleared');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to clear cart');
    },
  });
};