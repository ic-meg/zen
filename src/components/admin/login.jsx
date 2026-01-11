import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSendVerificationCode, useLogin } from '../../hooks/useAuth'
import { useUser } from '../../context/UserContext'
import { useCart } from '../../context/CartContext'

const Login = () => {
  const navigate = useNavigate()
  const { login: setUserLoggedIn } = useUser()
  const { migrateAnonymousCart } = useCart()
  const sendCodeMutation = useSendVerificationCode()
  const loginMutation = useLogin()
  
  const [step, setStep] = useState(1) // 1 = email, 2 = code
  const [formData, setFormData] = useState({
    email: '',
    code: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (formData.email) {
      if (formData.email === 'admin@gmail.com') {
        setUserLoggedIn(formData.email)
        
        // Migrate cart
        migrateAnonymousCart()
        
        navigate('/admin/products')
        return
      }
      
      try {
        await sendCodeMutation.mutateAsync(formData.email)
        setStep(2) // Move to code verification step
      } catch (error) {
      }
    }
  }

  const handleCodeSubmit = async (e) => {
    e.preventDefault()
    if (formData.email && formData.code) {
      try {
        const result = await loginMutation.mutateAsync({
          email: formData.email,
          code: formData.code
        })
        
        setUserLoggedIn(formData.email)
        
        migrateAnonymousCart()
        
        // Redirect based on user type
        if (result.user?.role === 'ADMIN' || result.user?.email === 'admin@gmail.com') {
          navigate('/admin/products')
        } else {
          navigate('/')
        }
      } catch (error) {
      }
    }
  }

  const handleBackToEmail = () => {
    setStep(1)
    setFormData(prev => ({ ...prev, code: '' }))
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
          {step === 1 ? (
            /* Step 1: Email Entry */
            <>
              <h2 className="text-2xl playfair matcha text-center mb-6">Sign In</h2>
              <p className="text-sm text-gray-600 inter text-center mb-6">
                Enter your email to receive a verification code
              </p>
              
              <form onSubmit={handleEmailSubmit} className="space-y-6">
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
                    placeholder="Enter your email address"
                    disabled={sendCodeMutation.isLoading}
                  />
                  {/* <p className="text-xs text-gray-500 inter mt-1">
                    Use admin@gmail.com for admin access
                  </p> */}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={sendCodeMutation.isLoading}
                  className="w-full bg-matcha text-white py-3 px-4 rounded-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-matcha transition-colors inter font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendCodeMutation.isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Code...
                    </span>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Step 2: Code Verification */
            <>
              <h2 className="text-2xl playfair matcha text-center mb-6">Verify Your Email</h2>
              <p className="text-sm text-gray-600 inter text-center mb-2">
                We've sent a 4-digit code to:
              </p>
              <p className="text-sm font-medium text-matcha inter text-center mb-6">
                {formData.email}
              </p>
              
              <form onSubmit={handleCodeSubmit} className="space-y-6">
                {/* Code Field */}
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 inter mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    maxLength="4"
                    pattern="[0-9]{4}"
                    className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm inter focus:outline-none focus:ring-2 focus:ring-matcha focus:border-matcha text-center text-2xl tracking-widest"
                    placeholder="0000"
                    disabled={loginMutation.isLoading}
                    autoComplete="one-time-code"
                  />
                  <p className="text-xs text-gray-500 inter mt-1 text-center">
                    Enter the 4-digit code from your email
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loginMutation.isLoading || formData.code.length !== 4}
                  className="w-full bg-matcha text-white py-3 px-4 rounded-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-matcha transition-colors inter font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loginMutation.isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Verify & Sign In'
                  )}
                </button>

                {/* Back Button */}
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  disabled={loginMutation.isLoading}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors inter font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Change Email Address
                </button>

                {/* Resend Code */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => sendCodeMutation.mutate(formData.email)}
                    disabled={sendCodeMutation.isLoading}
                    className="text-sm text-matcha hover:text-green-800 inter font-medium disabled:opacity-50"
                  >
                    Didn't receive the code? Resend
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 inter">
              {step === 1 
                ? "We'll send a 4-digit verification code to your email" 
                : "Code expires in 10 minutes"
              }
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
