import React from 'react';
import { useProducts, useAddToCart, useCart } from '../hooks';

const ProductsExample = () => {
  const userId = 'test_user_123'; // You'll get this from auth context
  
  // Get products
  const { 
    data: productsData, 
    isLoading: productsLoading, 
    error: productsError 
  } = useProducts(1, 10);

  // Get user's cart
  const { 
    data: cartData, 
    isLoading: cartLoading 
  } = useCart(userId);

  // Add to cart mutation
  const addToCartMutation = useAddToCart();

  const handleAddToCart = (productId) => {
    addToCartMutation.mutate({
      userId,
      productData: {
        productId,
        quantity: 1
      }
    });
  };

  if (productsLoading) return <div className="p-4">Loading products...</div>;
  if (productsError) return <div className="p-4 text-red-500">Error: {productsError.message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      
      {/* Cart Summary */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold">Cart Summary</h2>
        {cartLoading ? (
          <p>Loading cart...</p>
        ) : (
          <p>
            Items: {cartData?.data?.totalItems || 0} | 
            Total: ₱{cartData?.data?.totalAmount || 0}
          </p>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {productsData?.data?.map((product) => (
          <div key={product.id} className="border rounded p-4">
            <img 
              src={`/src/assets/images/products/${product.image}`} 
              alt={product.title}
              className="w-full h-48 object-cover mb-2"
            />
            <h3 className="font-semibold">{product.title}</h3>
            <p className="text-gray-600">{product.subtitle}</p>
            <p className="font-bold text-lg">₱{product.price}</p>
            <p className="text-sm text-gray-500">Stock: {product.stock}</p>
            
            <button
              onClick={() => handleAddToCart(product.id)}
              disabled={addToCartMutation.isLoading || product.stock === 0}
              className={`mt-2 px-4 py-2 rounded ${
                product.stock === 0 
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } ${addToCartMutation.isLoading ? 'opacity-50' : ''}`}
            >
              {addToCartMutation.isLoading ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {productsData?.pagination && (
        <div className="mt-6 flex justify-center">
          <p>
            Page {productsData.pagination.page} of {productsData.pagination.totalPages}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductsExample;