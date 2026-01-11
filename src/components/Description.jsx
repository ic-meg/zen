import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Header from './Header.jsx'
import Cart from './Cart.jsx'
import { useCart } from '../context/CartContext'
import { useProduct } from '../hooks/useProducts'

const Description = () => {
  const { id } = useParams()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { addToCart } = useCart()
  
  // Fetch product from database
  const { data: productResponse, isLoading, error } = useProduct(id)
  const product = productResponse?.data
  
  const handleCartClick = () => {
    setIsCartOpen(true)
  }
  
  const handleCartClose = () => {
    setIsCartOpen(false)
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      subtitle: product.subtitle,
      price: product.price,
      image: product.image
    })
    setIsCartOpen(true) // Open cart after adding item
  }

  // Function to get stock status and styling
  const getStockStatus = (stock) => {
    if (stock === 0) {
      return { text: 'Out of Stock', style: 'text-red-600', available: false }
    } else if (stock <= 5) {
      return { text: `Only ${stock} left in stock`, style: 'text-orange-600', available: true }
    } else if (stock <= 10) {
      return { text: `${stock} in stock`, style: 'text-yellow-600', available: true }
    } else {
      return { text: `${stock} in stock`, style: 'text-green-600', available: true }
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen">
        <Header onCartClick={handleCartClick} />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-matcha mx-auto mb-4"></div>
            <p className="text-gray-600 inter">Loading product...</p>
          </div>
        </div>
        <Cart isOpen={isCartOpen} onClose={handleCartClose} />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen">
        <Header onCartClick={handleCartClick} />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <p className="text-red-600 inter mb-4">Failed to load product</p>
            <Link to="/" className="bg-matcha text-white px-4 py-2 rounded-md hover:bg-green-800 inter">
              Return to Home
            </Link>
          </div>
        </div>
        <Cart isOpen={isCartOpen} onClose={handleCartClose} />
      </div>
    )
  }

  // Product not found
  if (!product) {
    return (
      <div className="h-screen">
        <Header onCartClick={handleCartClick} />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <h1 className="text-2xl mb-4 playfair">Product not found</h1>
            <Link to="/" className="bg-matcha text-white px-4 py-2 rounded-md hover:bg-green-800 inter">
              Return to Home
            </Link>
          </div>
        </div>
        <Cart isOpen={isCartOpen} onClose={handleCartClose} />
      </div>
    )
  }

  return (
    <div className="h-screen ">
      <Header onCartClick={handleCartClick} />
      
      <main className="h-[calc(120vh-80px)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* Product Image */}
          <div className="relative h-full cream flex items-center justify-center">
            <img 
              src={product.image || '/placeholder-image.png'} 
              alt={product.title} 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.src = '/placeholder-image.png' // Fallback for broken images
              }}
            />
          </div>
          
          {/* Product Details */}
          <div className="cream flex flex-col justify-center px-12 py-16 h-full">
            <div className="max-w-md mb-5">
              <h1 className="text-3xl playfair mb-6 tracking-wide">{product.title.toUpperCase()}</h1>
              <p className="text-xl playfair text-gray-600 mb-4">
                ₱{product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              
              {/* Stock Display */}
              <div className="mb-8">
                <p className={`text-sm inter font-medium ${getStockStatus(product.stock).style}`}>
                  {getStockStatus(product.stock).text}
                </p>
              </div>
              
              <div className="mb-12">
                <h3 className="text-lg playfair mb-3 text-gray-800">{product.subtitle}</h3>
                {product.description && (
                  <p className="text-gray-700 leading-relaxed inter text-base mb-6">
                    {product.description}
                  </p>
                )}
                <p className="text-gray-600 leading-relaxed playfair text-lg">
                  Experience authentic Japanese tea culture with this premium product, carefully crafted to bring the zen lifestyle to your daily routine.
                </p>
              </div>
              
              <button 
                className={`px-8 py-4 rounded-full transition-colors inter font-medium tracking-wider ${
                  getStockStatus(product.stock).available 
                    ? 'bg-black text-white hover:bg-gray-800' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={getStockStatus(product.stock).available ? handleAddToCart : undefined}
                disabled={!getStockStatus(product.stock).available}
              >
                {getStockStatus(product.stock).available ? 'ADD TO CART' : 'OUT OF STOCK'}
              </button>
            </div>
          </div>
        </div>
      </main>
      
      {/* Cart Component */}
      <Cart isOpen={isCartOpen} onClose={handleCartClose} />
    </div>
  )
}

export default Description
