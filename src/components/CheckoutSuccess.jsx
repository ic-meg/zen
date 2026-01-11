import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const CheckoutSuccess = () => {
  const { clearCart } = useCart()
  const navigate = useNavigate()
  const [orderDetails, setOrderDetails] = useState(null)

  useEffect(() => {
    clearCart()
    
    const storedOrderDetails = sessionStorage.getItem('orderDetails')
    if (storedOrderDetails) {
      setOrderDetails(JSON.parse(storedOrderDetails))
      // Clear the stored details after using them
      sessionStorage.removeItem('orderDetails')
    }
  }, []) 

  const handleContinueShopping = () => {
    navigate('/')
  }

  return (
    <div className="cream min-h-screen">
      {/* Header */}
      <div className="text-center py-8">
        <Link to="/">
          <h1 className="text-4xl playfair matcha cursor-pointer hover:opacity-75 transition-opacity">ZEN</h1>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h2 className="text-3xl playfair mb-4">
          {orderDetails?.paymentMethod === 'Cash on Delivery' 
            ? 'Order Placed Successfully!' 
            : 'Payment Successful!'
          }
        </h2>
        <p className="text-gray-600 inter mb-8 text-lg">
          {orderDetails 
            ? orderDetails.paymentMethod === 'Cash on Delivery' 
              ? `Thank you for your order! Your order has been placed successfully and will be processed for delivery. Payment will be collected upon delivery.`
              : `Thank you for your order! Your payment has been processed successfully and your order is now being prepared.`
            : 'Thank you for your order. Your payment has been processed successfully and your order is now being prepared.'
          }
        </p>

        {/* Order Details */}
        {orderDetails && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-xl playfair mb-4">Order Details</h3>
            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span className="inter text-gray-600">Order Number:</span>
                <span className="inter font-medium">{orderDetails.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="inter text-gray-600">Customer:</span>
                <span className="inter font-medium">{orderDetails.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="inter text-gray-600">Payment Method:</span>
                <span className="inter font-medium">{orderDetails.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="inter text-gray-600">Total Amount:</span>
                <span className="inter font-medium">PHP {orderDetails.total?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              {orderDetails.items && orderDetails.items.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <span className="inter text-gray-600">Items Ordered:</span>
                  <div className="mt-2 space-y-2">
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="inter">{item.title} x{item.quantity}</span>
                        <span className="inter">PHP {(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* What happens next */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-xl playfair mb-4">What happens next?</h3>
          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-matcha rounded-full"></div>
              <span className="inter">You will receive an order confirmation email shortly</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-matcha rounded-full"></div>
              <span className="inter">Your order will be processed and prepared for shipping</span>
            </div>
            {orderDetails?.paymentMethod === 'Cash on Delivery' && (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-matcha rounded-full"></div>
                <span className="inter">Payment will be collected upon delivery</span>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-matcha rounded-full"></div>
              <span className="inter">You will receive tracking information once your order ships</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-matcha rounded-full"></div>
              <span className="inter">Delivery typically takes 3-5 business days</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button 
            onClick={handleContinueShopping}
            className="block w-full py-3 px-6 bg-black text-white rounded-full hover:bg-gray-800 transition-colors inter font-medium tracking-wider cursor-pointer"
          >
            CONTINUE SHOPPING
          </button>
          <p className="text-sm text-gray-500 inter">
            Need help? Contact us at{' '}
            <a href="mailto:support@zentea.com" className="text-matcha hover:underline">
              support@zentea.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default CheckoutSuccess