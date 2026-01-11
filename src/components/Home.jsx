
import React, { useState } from 'react'
import Header from './Header.jsx'
import Cart from './Cart.jsx'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useProducts } from '../hooks/useProducts'
import hero from '../assets/images/hero.png'
import cartIcon from '../assets/icons/cart.png'
import Description from './Description.jsx'

const Home = () => {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { addToCart } = useCart()
  
  // Fetch products from database
  const { data: productsResponse, isLoading, error } = useProducts(1, 20) // Get first 20 products
  const products = (productsResponse?.data || []).filter(product => 
    !product.title.startsWith('[DELETED]')
  )
  
  const handleCartClick = () => {
    setIsCartOpen(true)
  }
  
  const handleCartClose = () => {
    setIsCartOpen(false)
  }

  const handleAddToCart = (product, e) => {
    e.preventDefault() // Prevent navigation when clicking add to cart
    e.stopPropagation()
    addToCart({
      id: product.id,
      title: product.title,
      subtitle: product.subtitle,
      price: product.price,
      image: product.image
    })
  }
  
  return (
    <div>
      <Header onCartClick={handleCartClick} />

      <main>
        <section className="relative w-full h-[70vh] sm:h-[80vh]">
          <img src={hero} alt="hero" className="w-full h-full object-cover" />

          {/* Overlay text */}
          <div className="absolute inset-0 flex items-start">
            <div className="max-w-3xl px-8 md:px-16 lg:px-24 mt-80 text-white">
              <p className="text-lg tracking-wider mb-6 inter">SHOP ALL</p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl playfair leading-tight">EMBRACE THE
                <br />
                ZEN LIFESTYLE
              </h1>
            </div>
          </div>
        </section>

        {/* Products section */}
        <section className="max-w-6xl mx-auto px-6 py-12">
          <p className="text-xs mb-6 text-[#7C7C7C] opacity-70 inter">CATEGORY: MATCHA</p>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-matcha"></div>
              <p className="ml-4 text-gray-600 inter">Loading products...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-600 inter mb-4">Failed to load products</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-matcha text-white px-4 py-2 rounded-md hover:bg-green-800 inter"
              >
                Retry
              </button>
            </div>
          )}

          {/* Products grid */}
          {!isLoading && !error && (
            <>
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 inter">No products available at the moment</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  {products.map((p) => (
                    <div key={p.id}>
                      <div className="relative group">
                        <Link to={`/product/${p.id}`}>
                          <img 
                            src={p.image || '/placeholder-image.png'} 
                            alt={p.title} 
                            className="w-full h-100 object-cover mb-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group-hover:blur-sm" 
                            onError={(e) => {
                              e.target.src = '/placeholder-image.png' // Fallback for broken images
                            }}
                          />
                        </Link>
                        
                        {/* Cart and Description icons overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-4">
                          <div className="flex space-x-4">
                            {/* Description/View icon */}
                            <Link to={`/product/${p.id}`}>
                              <button className="bg-white cursor-pointer rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                                <svg 
                                  className="w-6 h-6 text-gray-700" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                                  />
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                                  />
                                </svg>
                              </button>
                            </Link>
                            
                            {/* Add to cart icon */}
                            <button 
                              onClick={(e) => handleAddToCart(p, e)}
                              className="bg-white cursor-pointer rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                            >
                              <img src={cartIcon} alt="Add to cart" className="w-6 h-6" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <div>
                          <Link to={`/product/${p.id}`} className="hover:underline">
                            <div className="playfair text-lg">{p.title}</div>
                          </Link>
                          <div className="inter text-xs text-gray-500">{p.subtitle}</div>
                        </div>
                        <div className="text-sm playfair">₱{p.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>
      
      {/* Cart Component */}
      <Cart isOpen={isCartOpen} onClose={handleCartClose} />
    </div>
  )
}

export default Home
