import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { fetchRegions, fetchProvinces, fetchCities, fetchBarangays, getFullAddressDetails, getPostalCodeForCity, searchPostalCodeByMunicipality } from '../services/psgc'

const Checkout = () => {
  const { items, getCartTotal } = useCart()
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
  }, [])

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
        } else {
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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

    if (!formData.province) {
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
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    return newErrors
  }

  // Handle payment button click
  const handlePayment = (e) => {
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
    

 
    alert('Payment functionality would be implemented here!')
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

                {/* Province */}
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
                      disabled={!formData.province || locationData.loading.cities}
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
                    className={`w-full px-4 py-3 border rounded focus:outline-none inter ${
                      errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-500'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 inter">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button 
              onClick={handlePayment}
              className="w-full bg-black text-white py-4 rounded-full hover:bg-gray-800 transition-colors inter font-medium tracking-wider"
            >
              PAY WITH PAYMONGO
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
