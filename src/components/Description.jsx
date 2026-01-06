import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Header from './Header.jsx'
import Cart from './Cart.jsx'
import { useCart } from '../context/CartContext'
import whisk from '../assets/images/products/bamboo-whisk.png'
import chawan from '../assets/images/products/chawan.png'
import chashaku from '../assets/images/products/chashaku.png'
import ceremonial from '../assets/images/products/ceremonial.png'
import set from '../assets/images/products/set.png'
import sieve from '../assets/images/products/fine-sieve.png'

const products = [
  { 
    id: 1, 
    title: 'Bamboo Whisk', 
    subtitle: 'Natural Bamboo', 
    price: 'PHP 490.00', 
    image: whisk,
    stock: 15,
    description: 'Handcrafted from sustainable bamboo, this traditional chasen (tea whisk) is essential for creating the perfect frothy matcha. Each whisk is carefully carved to create the ideal texture and consistency for your tea ceremony.',
    features: ['100% Natural Bamboo', 'Traditional Handcrafted Design', 'Perfect for Matcha Preparation', 'Durable and Long-lasting']
  },
  { 
    id: 2, 
    title: 'Chawan', 
    subtitle: 'Natural Bamboo', 
    price: 'PHP 2,800', 
    image: chawan,
    stock: 8,
    description: 'This beautiful ceramic tea bowl embodies the essence of Japanese tea ceremony. Crafted with attention to detail, it provides the perfect vessel for enjoying your matcha in traditional style.',
    features: ['Premium Ceramic Material', 'Traditional Japanese Design', 'Perfect Size for Tea Ceremony', 'Easy to Clean and Maintain']
  },
  { 
    id: 3, 
    title: 'Chashaku', 
    subtitle: 'Natural Bamboo', 
    price: 'PHP 430.00', 
    image: chashaku,
    stock: 23,
    description: 'The traditional bamboo tea scoop used for measuring the perfect amount of matcha powder. Each chashaku is individually crafted to ensure precision in your tea preparation.',
    features: ['Hand-carved Bamboo', 'Traditional Measurements', 'Lightweight and Durable', 'Essential Tea Ceremony Tool']
  },
  { 
    id: 4, 
    title: 'Set', 
    subtitle: 'Ceramic Set', 
    price: 'PHP 3,200', 
    image: set,
    stock: 5,
    description: 'Complete tea ceremony set including everything you need to begin your matcha journey. This comprehensive collection brings authentic Japanese tea culture to your home.',
    features: ['Complete Tea Ceremony Kit', 'Premium Quality Materials', 'Perfect for Beginners', 'Beautiful Gift Set']
  },
  { 
    id: 5, 
    title: 'Fine Sieve', 
    subtitle: 'Stainless', 
    price: 'PHP 350.00', 
    image: sieve,
    stock: 18,
    description: 'Essential for achieving silky smooth matcha, this fine mesh sieve removes any lumps from your tea powder, ensuring a perfect, frothy consistency every time.',
    features: ['Ultra-fine Mesh', 'Stainless Steel Construction', 'Easy to Clean', 'Professional Quality']
  },
  { 
    id: 6, 
    title: 'Ceremonial', 
    subtitle: 'Special', 
    price: 'PHP 4,500', 
    image: ceremonial,
    stock: 3,
    description: 'Premium ceremonial grade matcha powder sourced directly from traditional Japanese tea gardens. Experience the authentic taste and vibrant green color of this exceptional tea.',
    features: ['Ceremonial Grade Quality', 'Direct from Japan', 'Vibrant Green Color', 'Rich, Complex Flavor']
  },
]

const Description = () => {
  const { id } = useParams()
  const product = products.find(p => p.id === parseInt(id))
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { addToCart } = useCart()
  
  const handleCartClick = () => {
    setIsCartOpen(true)
  }
  
  const handleCartClose = () => {
    setIsCartOpen(false)
  }

  const handleAddToCart = () => {
    addToCart(product)
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

  if (!product) {
    return (
      <div>
        <Header onCartClick={handleCartClick} />
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl mb-4">Product not found</h1>
          <Link to="/" className="text-green-700 underline">Return to Home</Link>
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
              src={product.image} 
              alt={product.title} 
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Product Details */}
          <div className="cream flex flex-col justify-center px-12 py-16 h-full">
            <div className="max-w-md mb-5">
              <h1 className="text-3xl playfair mb-6 tracking-wide">{product.title.toUpperCase()}</h1>
              <p className="text-xl playfair text-gray-600 mb-4">{product.price}</p>
              
              {/* Stock Display */}
              <div className="mb-8">
                <p className={`text-sm inter font-medium ${getStockStatus(product.stock).style}`}>
                  {getStockStatus(product.stock).text}
                </p>
              </div>
              
              <div className="mb-12">
                <p className="text-gray-700 leading-relaxed playfair text-lg">{product.description}</p>
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
