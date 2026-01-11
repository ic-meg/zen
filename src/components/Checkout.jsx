import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { fetchRegions, fetchProvinces, fetchCities, fetchCitiesByRegion, fetchBarangays, getFullAddressDetails, getPostalCodeForCity, searchPostalCodeByMunicipality } from '../services/psgc'
import { toast } from 'react-hot-toast'
import { API_URLS } from '../config/api'

const Checkout = () => {
  const { items, getCartTotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    region: '',
    province: '',
    city: '',
    barangay: '',
    zipCode: '',
    phone: ''
  })

  const [errors, setErrors] = useState({})
  const [showErrors, setShowErrors] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('paymongo') // Default to PayMongo
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const [locationData, setLocationData] = useState({
    regions: [],
    provinces: [],
    cities: [],
    barangays: [],
    loading: {
      regions: false,
      provinces: false,
      cities: false,
      barangays: false
    }
  })


  useEffect(() => {
    loadRegions()
    
    // Redirect if cart is empty
    if (!items || items.length === 0) {
      navigate('/')
    }
  }, [items, navigate])

  const loadRegions = async () => {
    setLocationData(prev => ({ ...prev, loading: { ...prev.loading, regions: true } }))
    const regions = await fetchRegions()
    setLocationData(prev => ({ 
      ...prev, 
      regions,
      loading: { ...prev.loading, regions: false }
    }))
  }

  const handleRegionChange = async (e) => {
    const regionCode = e.target.value
    setFormData({
      ...formData,
      region: regionCode,
      province: '',
      city: '',
      barangay: '',
      zipCode: ''
    })

    if (regionCode) {
      const isNCR = regionCode === '130000000' || regionCode === '13'
      
      if (isNCR) {
        // For NCR, skip provinces and directly load cities
        setLocationData(prev => ({ 
          ...prev, 
          provinces: [],
          cities: [],
          barangays: [],
          loading: { ...prev.loading, cities: true }
        }))
        
        const cities = await fetchCitiesByRegion(regionCode)
        setLocationData(prev => ({ 
          ...prev, 
          cities,
          loading: { ...prev.loading, cities: false }
        }))
      } else {
        // For other regions, load provinces first
        setLocationData(prev => ({ 
          ...prev, 
          provinces: [],
          cities: [],
          barangays: [],
          loading: { ...prev.loading, provinces: true }
        }))
        
        const provinces = await fetchProvinces(regionCode)
        setLocationData(prev => ({ 
          ...prev, 
          provinces,
          loading: { ...prev.loading, provinces: false }
        }))
      }
    } else {
      setLocationData(prev => ({ 
        ...prev, 
        provinces: [],
        cities: [],
        barangays: []
      }))
    }
  }

  const handleProvinceChange = async (e) => {
    const provinceCode = e.target.value
    setFormData({
      ...formData,
      province: provinceCode,
      city: '',
      barangay: '',
      zipCode: ''
    })

    if (provinceCode) {
      setLocationData(prev => ({ 
        ...prev, 
        cities: [],
        barangays: [],
        loading: { ...prev.loading, cities: true }
      }))
      
      const cities = await fetchCities(provinceCode)
      setLocationData(prev => ({ 
        ...prev, 
        cities,
        loading: { ...prev.loading, cities: false }
      }))
    } else {
      setLocationData(prev => ({ 
        ...prev, 
        cities: [],
        barangays: []
      }))
    }
  }

  const handleCityChange = async (e) => {
    const cityCode = e.target.value
    
    let cityName = '';
    if (cityCode) {
      const selectedCity = locationData.cities.find(city => city.code === cityCode);
      cityName = selectedCity ? selectedCity.name : '';
    }
    
    setFormData({
      ...formData,
      city: cityCode,
      barangay: '',
      zipCode: ''
    })

    if (cityCode && cityName) {
      try {
        // Auto-fill postal code using use-postal-ph
        const postalCode = getPostalCodeForCity(cityName);
        
        if (postalCode) {
          setFormData(prev => ({
            ...prev,
            city: cityCode,
            barangay: '',
            zipCode: postalCode
          }));
        }
      } catch (error) {
        console.error('Error getting postal code:', error);
      }

      setLocationData(prev => ({ 
        ...prev, 
        barangays: [],
        loading: { ...prev.loading, barangays: true }
      }))
      
      const barangays = await fetchBarangays(cityCode)
      setLocationData(prev => ({ 
        ...prev, 
        barangays,
        loading: { ...prev.loading, barangays: false }
      }))
    } else {
      setLocationData(prev => ({ 
        ...prev, 
        barangays: []
      }))
    }
  }

  const handleBarangayChange = async (e) => {
    const barangayCode = e.target.value
    setFormData({
      ...formData,
      barangay: barangayCode
    })

    // Auto-fill zip code when barangay is selected
    if (barangayCode) {
      const addressDetails = await getFullAddressDetails(barangayCode)
      if (addressDetails && addressDetails.zipCode) {
        setFormData(prev => ({
          ...prev,
          barangay: barangayCode,
          zipCode: addressDetails.zipCode
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        zipCode: ''
      }))
    }
  }

  const handleInputChange = (e) => {
    let value = e.target.value
    
    // Special handling for phone number
    if (e.target.name === 'phone') {
      // Remove all non-digits
      value = value.replace(/\D/g, '')
      
      // Limit to 11 digits
      if (value.length > 11) {
        value = value.slice(0, 11)
      }
    }
    
    setFormData({
      ...formData,
      [e.target.name]: value
    })
    
    if (errors[e.target.name]) {
      setErrors(prev => ({
        ...prev,
        [e.target.name]: ''
      }))
    }
  }

  // Validation function
  const validateForm = () => {
    const newErrors = {}

    // Required fields validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    if (!formData.region) {
      newErrors.region = 'Please select a region'
    }

    // Province is only required for non-NCR regions
    const isNCR = formData.region === '130000000' || formData.region === '13'
    if (!isNCR && !formData.province) {
      newErrors.province = 'Please select a province'
    }

    if (!formData.city) {
      newErrors.city = 'Please select a city'
    }

    if (!formData.barangay) {
      newErrors.barangay = 'Please select a barangay'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\d{11}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 11 digits'
    } else if (!formData.phone.startsWith('09')) {
      newErrors.phone = 'Phone number must start with 09'
    }

    return newErrors
  }

  // Handle payment button click
  const handlePayment = async (e) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setShowErrors(true)
      
      const firstErrorField = Object.keys(validationErrors)[0]
      const element = document.querySelector(`[name="${firstErrorField}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.focus()
      }
      
      return
    }

    setErrors({})
    setShowErrors(false)
    
    // Handle different payment methods
    if (paymentMethod === 'cod') {
      // Handle Cash on Delivery
      const orderData = {
        customerInfo: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone
        },
        shippingAddress: {
          street: formData.address,
          region: formData.region,
          province: formData.province,
          city: formData.city,
          barangay: formData.barangay,
          zipCode: formData.zipCode
        },
        items: items.map(item => ({
          productId: item.id,
          name: item.title,
          quantity: item.quantity,
          amount: Math.round(item.price * 100), // Convert to centavos
          currency: 'PHP',
          description: item.subtitle || item.title
        })),
        subtotal: subtotal,
        shipping: shipping,
        total: total,
        amount: Math.round(total * 100), // Convert total to centavos
        currency: 'PHP',
        description: `ZEN Tea Order - ${items.length} item(s)`,
        paymentMethod: 'COD'
      }
      
      toast.loading('Processing your order...')
      
      try {
        const response = await fetch(API_URLS.CREATE_CHECKOUT_SESSION, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create order');
        }

        const result = await response.json();
        toast.dismiss();
        
        
        // Store order details in session storage for success page
        sessionStorage.setItem('orderDetails', JSON.stringify({
          orderNumber: result.data?.order?.orderNumber || 'N/A',
          total: total,
          paymentMethod: 'Cash on Delivery',
          customerName: `${formData.firstName} ${formData.lastName}`,
          items: items
        }));
        
        // Clear cart
        clearCart();
        
        // Show success message and redirect
        toast.success('Cash on Delivery order placed successfully!');
        
        // Redirect to success page after a short delay
        setTimeout(() => {
          navigate('/checkout/success');
        }, 1500);
        
      } catch (error) {
        console.error('COD order error:', error);
        toast.dismiss();
        toast.error(`Order Error: ${error.message}`);
      }
      
    } else {
      // Handle PayMongo payment
      setIsProcessingPayment(true)
      
      try {
        const orderData = {
          customerInfo: {
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone
          },
          shippingAddress: {
            street: formData.address,
            region: formData.region,
            province: formData.province,
            city: formData.city,
            barangay: formData.barangay,
            zipCode: formData.zipCode
          },
          items: items.map(item => ({
            productId: item.id, // Include the actual product ID
            name: item.title,
            quantity: item.quantity,
            amount: Math.round(item.price * 100), // Convert to centavos
            currency: 'PHP',
            description: item.subtitle || item.title
          })),
          amount: Math.round(total * 100), // Convert total to centavos
          currency: 'PHP',
          description: `ZEN Tea Order - ${items.length} item(s)`,
          success_url: `${window.location.origin}/checkout/success`,
          cancel_url: `${window.location.origin}/checkout/cancel`,
          paymentMethod: 'paymongo'
        }
        
        toast.loading('Creating secure checkout session...')
        
        const response = await fetch(API_URLS.CREATE_CHECKOUT_SESSION, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create checkout session');
        }

        const result = await response.json();
        
        toast.dismiss() // Remove loading toast
        
        if (result.data && result.data.checkoutSession && result.data.checkoutSession.checkout_url) {
          toast.success('Redirecting to secure payment...')
          
          // Redirect to PayMongo checkout page
          window.location.href = result.data.checkoutSession.checkout_url
        } else {
          throw new Error('Invalid checkout session response')
        }
        
      } catch (error) {
        console.error('PayMongo checkout error:', error)
        toast.dismiss()
        toast.error(`Payment Error: ${error.message}`)
      } finally {
        setIsProcessingPayment(false)
      }
    }
  }

  const subtotal = getCartTotal()
  const shipping = 50.00
  const total = subtotal + shipping

  return (
    <div className="cream min-h-screen">
      {/* Header */}
      <div className="text-center py-8">
        <Link to="/">
          <h1 className="text-4xl playfair matcha cursor-pointer hover:opacity-75 transition-opacity">ZEN</h1>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Required fields note */}
        <div className="mb-8 text-center">
          <p className="text-sm text-gray-600 inter">
            Fields marked with an asterisk (*) are required
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column - Forms */}
          <div className="space-y-8">
            {/* Contact Section */}
            <div>
              <h2 className="text-2xl playfair mb-6">Contact</h2>
              <div>
                <label className="block text-sm text-gray-600 mb-2 inter">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@gmail.com"
                  className={`w-full px-4 py-3 border rounded focus:outline-none inter ${
                    errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-500'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 inter">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Delivery Section */}
            <div>
              <h2 className="text-2xl playfair mb-6">Delivery</h2>
              <div className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2 inter">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Jane"
                      className={`w-full px-4 py-3 border rounded focus:outline-none inter ${
                        errors.firstName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-500'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600 inter">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2 inter">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      className={`w-full px-4 py-3 border rounded focus:outline-none inter ${
                        errors.lastName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-500'
                      }`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600 inter">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2 inter">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="1234 Stranger Things ST"
                    className={`w-full px-4 py-3 border rounded focus:outline-none inter ${
                      errors.address ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-500'
                    }`}
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600 inter">{errors.address}</p>
                  )}
                </div>

                {/* Region */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2 inter">
                    Region <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleRegionChange}
                    className={`w-full px-4 py-3 border rounded focus:outline-none inter ${
                      errors.region ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-500'
                    }`}
                    disabled={locationData.loading.regions}
                  >
                    <option value="">Select Region</option>
                    {locationData.regions.map((region) => (
                      <option key={region.code} value={region.code}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                  {errors.region && (
                    <p className="mt-1 text-sm text-red-600 inter">{errors.region}</p>
                  )}
                </div>

                {/* Province - Hidden for NCR */}
                {!(formData.region === '130000000' || formData.region === '13') && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-2 inter">
                      Province <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleProvinceChange}
                      className={`w-full px-4 py-3 border rounded focus:outline-none inter ${
                        errors.province ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-500'
                      }`}
                      disabled={!formData.region || locationData.loading.provinces}
                    >
                      <option value="">Select Province</option>
                      {locationData.provinces.map((province) => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                    {errors.province && (
                      <p className="mt-1 text-sm text-red-600 inter">{errors.province}</p>
                    )}
                  </div>
                )}

                {/* City, Barangay, ZIP */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2 inter">
                      City <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleCityChange}
                      className={`w-full px-4 py-3 border rounded focus:outline-none inter ${
                        errors.city ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-500'
                      }`}
                      disabled={
                        locationData.loading.cities || 
                        (!formData.province && !(formData.region === '130000000' || formData.region === '13'))
                      }
                    >
                      <option value="">Select City</option>
                      {locationData.cities.map((city) => (
                        <option key={city.code} value={city.code}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600 inter">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2 inter">
                      Barangay <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="barangay"
                      value={formData.barangay}
                      onChange={handleBarangayChange}
                      className={`w-full px-4 py-3 border rounded focus:outline-none inter ${
                        errors.barangay ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-500'
                      }`}
                      disabled={!formData.city || locationData.loading.barangays}
                    >
                      <option value="">Select Barangay</option>
                      {locationData.barangays.map((barangay) => (
                        <option key={barangay.code} value={barangay.code}>
                          {barangay.name}
                        </option>
                      ))}
                    </select>
                    {errors.barangay && (
                      <p className="mt-1 text-sm text-red-600 inter">{errors.barangay}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2 inter">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="Auto-detected"
                      className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-gray-500 inter bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2 inter">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="09171234567"
                    maxLength="11"
                    className={`w-full px-4 py-3 border rounded focus:outline-none inter ${
                      errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-500'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 inter">{errors.phone}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 inter">
                    Enter 11-digit Philippine mobile number (e.g., 09171234567)
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <h2 className="text-2xl playfair mb-6">Payment Method</h2>
              <div className="space-y-4">
                {/* PayMongo Option */}
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'paymongo' 
                      ? 'border-matcha bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setPaymentMethod('paymongo')}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'paymongo' 
                        ? 'border-matcha bg-matcha' 
                        : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'paymongo' && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium inter">Online Payment</h3>
                      <p className="text-sm text-gray-600 inter mt-1">
                        Pay securely with credit card, debit card, or digital wallets via PayMongo
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded inter">Visa</span>
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded inter">MasterCard</span>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded inter">GCash</span>
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded inter">PayMaya</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cash on Delivery Option */}
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'cod' 
                      ? 'border-matcha bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'cod' 
                        ? 'border-matcha bg-matcha' 
                        : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'cod' && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium inter">Cash on Delivery (COD)</h3>
                      <p className="text-sm text-gray-600 inter mt-1">
                        Pay in cash when your order is delivered to your doorstep
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded inter">✓ No online payment needed</span>
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded inter">📦 Pay upon delivery</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button 
              onClick={handlePayment}
              disabled={isProcessingPayment}
              className={`w-full py-4 rounded-full transition-colors inter font-medium tracking-wider flex items-center justify-center ${
                isProcessingPayment 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isProcessingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  {paymentMethod === 'cod' ? 'PROCESSING ORDER...' : 'CREATING SECURE CHECKOUT...'}
                </>
              ) : (
                <>
                  {paymentMethod === 'cod' ? 'PLACE ORDER (COD)' : 'PAY WITH PAYMONGO'}
                </>
              )}
            </button>
            

          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:pl-8">
            <div className="space-y-6">
              {/* Order Items */}
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                  <div className="relative">
                    <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded" />
                    <span className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="playfair font-medium">{item.title.toUpperCase()}</h3>
                    <p className="text-gray-600 inter text-sm">{item.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="playfair">{item.price}</p>
                  </div>
                </div>
              ))}

              {/* Order Totals */}
              <div className="space-y-3 pt-4">
                <div className="flex justify-between inter">
                  <span>Subtotal</span>
                  <span>PHP {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between inter">
                  <span>Shipping</span>
                  <span>PHP {shipping.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between inter text-sm text-gray-600">
                  <span>Payment Method</span>
                  <span>{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between playfair text-lg font-medium">
                  <span>Total</span>
                  <span>PHP {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
