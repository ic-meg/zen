
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const Cart = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart()
  const navigate = useNavigate()

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else {
      updateQuantity(productId, newQuantity)
    }
  }

  const handleCheckout = () => {
    onClose() 
    navigate('/checkout') 
  }
  return (
    <>
      {/* Backdrop with blur effect */}
      {isOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Cart Panel */}
      <div className={`fixed top-0 right-0 h-full w-1/2 cream z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6 h-full flex flex-col">
          {/* Cart Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl playfair">Shopping Cart</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 inter text-lg">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-200">
                    <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <h3 className="playfair">{item.title}</h3>
                      <p className="text-gray-600 inter text-sm">{item.subtitle}</p>
                      <p className="playfair text-sm">
                        PHP {typeof item.price === 'number' 
                          ? item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })
                          : item.price
                        }
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="inter w-8 text-center">{item.quantity}</span>
                      <button 
                        className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button 
                      className="text-red-500 hover:text-red-700 text-sm inter"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Cart Footer */}
          <div className="border-t border-gray-200 pt-6">
            {items.length > 0 && (
              <>
                <div className="flex justify-between mb-4">
                  <span className="playfair text-lg">Total:</span>
                  <span className="playfair text-lg font-semibold">PHP {getCartTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="space-y-3">
                  <button 
                    className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors playfair text-xl"
                    disabled={items.length === 0}
                    onClick={handleCheckout}
                  >
                    Checkout
                  </button>
                  <button 
                    className="w-full border border-gray-300 text-gray-700 py-2 rounded-full hover:bg-gray-100 transition-colors playfair text-xl"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Cart
