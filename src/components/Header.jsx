import React, { useState } from 'react'
import cartIcon from '../assets/icons/cart.png'
import { Navigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'

const Header = ({ onCartClick }) => {
  const { getCartItemCount, items } = useCart()
  const { user, isLoggedIn, logout } = useUser()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const itemCount = getCartItemCount()

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }
  

  
  return (
    <header className="sticky top-0 z-50 w-full cream border-b border-gray-200 bg-cream">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Logooo */}
        <div className="flex items-center">
          {user && user.isAdmin ? (
            <span className="text-4xl playfair matcha cursor-default">ZEN</span>
          ) : (
            <Link to="/" className="cursor-pointer">
              <span className="text-4xl playfair matcha">ZEN</span>
            </Link>
          )}
        </div>

        {/* navvvvv */}
        {(!user || !user.isAdmin) && (
          <nav className="hidden sm:flex gap-8 text-sm text-gray-700">
            <Link to="/" className="hover:underline inter">Home</Link>
            <Link to="/" className="hover:underline inter">Shop</Link>
          </nav>
        )}

        {/*  */}
        {user && user.isAdmin && (
          <div className="flex items-center">
            <h1 className="text-xl playfair text-gray-700">Product Management</h1>
          </div>
        )}

        {/* Rightt User and Cart */}
        <div className="flex items-center space-x-4">
          {/* User Icon */}
          <div className="relative">
            {isLoggedIn ? (
              <div className="relative">
                <div 
                  className="p-1 cursor-pointer"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <svg 
                    className="w-5 h-5 text-matcha hover:text-green-800 transition-colors" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                    />
                  </svg>
                </div>
                
                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowUserMenu(false)}
                    ></div>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 inter">{user.name}</p>
                        <p className="text-xs text-gray-500 inter">
                          {user.isAdmin ? 'Administrator' : 'Customer'}
                        </p>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 inter"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="p-1">
                <svg 
                  className="w-5 h-5 text-gray-700 hover:text-gray-900 transition-colors" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  />
                </svg>
              </Link>
            )}
          </div>
          
          {/* Cart Iconn */}
          {(!user || !user.isAdmin) && (
            <button className="relative cursor-pointer" onClick={onCartClick}>
              <img src={cartIcon} alt="cart" className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-matcha  text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
