
import React, { useState } from 'react'
import Header from './Header.jsx'
import Cart from './Cart.jsx'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import hero from '../assets/images/hero.png'
import whisk from '../assets/images/products/bamboo-whisk.png'
import chawan from '../assets/images/products/chawan.png'
import chashaku from '../assets/images/products/chashaku.png'
import  ceremonial from '../assets/images/products/ceremonial.png'
import set from '../assets/images/products/set.png'
import sieve from '../assets/images/products/fine-sieve.png'
import cartIcon from '../assets/icons/cart.png'
import Description from './Description.jsx'

const products = [
  { id: 1, title: 'Bamboo Whisk', subtitle: 'Natural Bamboo', price: 'PHP 490.00', image: whisk },
  { id: 2, title: 'Chawan', subtitle: 'Natural Bamboo', price: 'PHP 2,800', image: chawan },
  { id: 3, title: 'Chashaku', subtitle: 'Natural Bamboo', price: 'PHP 430.00', image: chashaku },
  { id: 4, title: 'Set', subtitle: 'Ceramic Set', price: 'PHP 3,200', image: set },
  { id: 5, title: 'Fine Sieve', subtitle: 'Stainless', price: 'PHP 350.00', image: sieve },
  { id: 6, title: 'Ceremonial', subtitle: 'Special', price: 'PHP 4,500', image: ceremonial },
]

const Home = () => {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { addToCart } = useCart()
  
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
      price: parseFloat(product.price.replace('PHP ', '').replace(',', '')),
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {products.map((p) => (
              <div key={p.id}>
                <div className="relative group">
                  <Link to={`/product/${p.id}`}>
                    <img 
                      src={p.image} 
                      alt={p.title} 
                      className="w-full h-100 object-cover mb-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group-hover:blur-sm" 
                    />
                  </Link>
                  
                  {/* Cart and Description icons overlay */}
                  <div className="absolute inset-0 flex items-center  justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-4">
                    <div className="flex space-x-4">
                      {/* Description/View icon */}
                      <Link to={`/product/${p.id}`}>
                        <button className="bg-white  cursor-pointer rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
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
                  <div className="text-sm playfair">{p.price}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      
      {/* Cart Component */}
      <Cart isOpen={isCartOpen} onClose={handleCartClose} />
    </div>
  )
}

export default Home
