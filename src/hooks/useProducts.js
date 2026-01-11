import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/productsApi';

// Query keys 
export const productKeys = {
  all: ['products'],
  lists: () => [...productKeys.all, 'list'],
  list: (filters) => [...productKeys.lists(), { filters }],
  details: () => [...productKeys.all, 'detail'],
  detail: (id) => [...productKeys.details(), id],
  featured: () => [...productKeys.all, 'featured'],
  search: (query) => [...productKeys.all, 'search', query],
};

// Get all products with pagination
export const useProducts = (page = 1, limit = 10, category = '') => {
  return useQuery({
    queryKey: productKeys.list({ page, limit, category }),
    queryFn: () => productsApi.getProducts(page, limit, category),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single product
export const useProduct = (id) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getProduct(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get featured products
export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: productsApi.getFeaturedProducts,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Search products
export const useSearchProducts = (query, page = 1, limit = 10) => {
  return useQuery({
    queryKey: productKeys.search(query),
    queryFn: () => productsApi.searchProducts(query, page, limit),
    enabled: !!query && query.length > 2,
    keepPreviousData: true,
  });
};

// Admin: Create product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      console.log('Product created successfully, refreshing product list...');
    },
    onError: (error) => {
      console.error('Error creating product:', error);
    },
  });
};

// Admin: Update product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...productData }) => productsApi.updateProduct(id, productData),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      console.log('Product updated successfully, refreshing product list...');
    },
  });
};

// Admin: Delete product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, force = false }) => productsApi.deleteProduct(id, force),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      console.log('Product deleted successfully, refreshing product list...');
    },
  });
};

// Admin: Update stock
export const useUpdateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stock }) => productsApi.updateStock(id, stock),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

// Upload product image
export const useUploadImage = () => {
  return useMutation({
    mutationFn: productsApi.uploadImage,
    onError: (error) => {
      console.error('Error uploading image:', error);
    },
  });
};