import React from 'react'
import { Link } from 'react-router-dom'

const CheckoutCancel = () => {
  return (
    <div className="cream min-h-screen">
      {/* Header */}
      <div className="text-center py-8">
        <Link to="/">
          <h1 className="text-4xl playfair matcha cursor-pointer hover:opacity-75 transition-opacity">ZEN</h1>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        {/* Cancel Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-100 rounded-full mb-6">
            <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.856-.833-2.5 0L4.732 13.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>

        {/* Cancel Message */}
        <h2 className="text-3xl playfair mb-4">Payment Cancelled</h2>
        <p className="text-gray-600 inter mb-8 text-lg">
          Your payment was cancelled and no charge has been made to your account. Your items are still in your cart.
        </p>

        {/* Information Box */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-xl playfair mb-4">What would you like to do?</h3>
          <div className="space-y-4">
            <p className="inter text-gray-600">
              You can return to checkout to complete your purchase, or continue shopping to add more items to your cart.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link 
            to="/checkout" 
            className="block w-full py-3 px-6 bg-black text-white rounded-full hover:bg-gray-800 transition-colors inter font-medium tracking-wider"
          >
            RETURN TO CHECKOUT
          </Link>
          <Link 
            to="/" 
            className="block w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-full hover:border-gray-400 hover:bg-gray-50 transition-colors inter font-medium tracking-wider"
          >
            CONTINUE SHOPPING
          </Link>
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

export default CheckoutCancel