import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useUser()
  const [formData, setFormData] = useState({
    email: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.email) {
      const userData = login(formData.email)
      
      // Redirect based on user type
      if (userData.isAdmin) {
        navigate('/admin/products')
      } else {
        navigate('/')
      }
    }
  }

  return (
    <div className="min-h-screen cream flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="cursor-pointer">
            <span className="text-5xl playfair matcha">ZEN</span>
          </Link>
          <p className="inter text-gray-600 mt-2">Welcome back to your zen space</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl playfair matcha text-center mb-6">Sign In</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 inter mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm inter focus:outline-none focus:ring-2 focus:ring-matcha focus:border-matcha"
                placeholder="Enter your email to continue"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-matcha text-white py-3 px-4 rounded-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-matcha transition-colors inter font-medium"
            >
              Continue
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 inter">
              Don't have an account?{' '}
              <a href="#" className="font-medium text-matcha hover:text-green-800">
                Sign up
              </a>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="inter text-sm text-gray-600 hover:text-matcha">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
