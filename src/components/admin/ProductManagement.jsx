import React, { useState, useCallback, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { 
  useProducts, 
  useCreateProduct, 
  useUpdateProduct, 
  useDeleteProduct,
  useUpdateStock,
  useUploadImage
} from '../../hooks/useProducts'
import { toast } from 'react-hot-toast'

const ProductManagement = () => {
  const { logout } = useUser()
  const navigate = useNavigate()
  
  // API hooks
  const { data: productsResponse, isLoading, error, refetch } = useProducts(1, 50) // Get more products for admin
  const createProductMutation = useCreateProduct()
  const updateProductMutation = useUpdateProduct()
  const deleteProductMutation = useDeleteProduct()
  const updateStockMutation = useUpdateStock()
  const uploadImageMutation = useUploadImage()
  
  const products = (productsResponse?.data || []).filter(product => 
    !product.title.startsWith('[DELETED]')
  )

  
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [originalProductData, setOriginalProductData] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image: ''
  })
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // Add local loading state

  //  duplicate checking function
  const checkDuplicateName = useCallback((title) => {
    if (!title.trim()) return
    
    setIsCheckingDuplicate(true)
    
      setTimeout(() => {
      const trimmedTitle = title.trim().toLowerCase()
      
      // Debug logging
  
      const isDuplicate = products.some(product => {
        // Skip the current product when editing
        if (editingProduct && product.id === editingProduct) {
          return false
        }
        const productTitleLower = product.title.toLowerCase()
        const isMatch = productTitleLower === trimmedTitle
        return isMatch
      })
      
      
      if (isDuplicate) {
        setFormErrors(prev => ({
          ...prev,
          title: 'A product with this name already exists'
        }))
      } else {
        // Clear title error if it was a duplicate error
        setFormErrors(prev => {
          if (prev.title === 'A product with this name already exists') {
            const { title, ...rest } = prev
            return rest
          }
          return prev
        })
      }
      
      setIsCheckingDuplicate(false)
    }, 500) // 500ms delay
  }, [products, editingProduct])

  // Effect to trigger duplicate checking when title changes
  useEffect(() => {
    // Only check if products are loaded and title has value
    if (formData.title.trim() && products.length > 0 && !isLoading) {
      const timeoutId = setTimeout(() => {
        checkDuplicateName(formData.title)
      }, 300)
      
      return () => clearTimeout(timeoutId)
    } else {
      setIsCheckingDuplicate(false)
    }
  }, [formData.title, checkDuplicateName, products.length, isLoading])

  const validateForm = () => {
    const errors = {}
    
    if (!formData.title.trim()) {
      errors.title = 'Product title is required'
    } else {
      // Check for duplicate product names
      const trimmedTitle = formData.title.trim().toLowerCase()
      
  
      const isDuplicate = products.some(product => {
        if (editingProduct && product.id === editingProduct) {
          return false
        }
        return product.title.toLowerCase() === trimmedTitle
      })
      
      
      if (isDuplicate) {
        errors.title = 'A product with this name already exists'
      }
    }
    
    if (!formData.subtitle.trim()) {
      errors.subtitle = 'Product subtitle is required'
    } else if (formData.subtitle.length > 100) {
      errors.subtitle = 'Subtitle must be 100 characters or less'
    }
    
    if (formData.description && formData.description.length > 1000) {
      errors.description = 'Description must be 1000 characters or less'
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = 'Valid price is required'
    }
    
    if (!formData.stock || parseInt(formData.stock) < 0) {
      errors.stock = 'Valid stock quantity is required'
    }
    
    if (!formData.category) {
      errors.category = 'Category is required'
    }

    if (!selectedImage && !formData.image && !editingProduct) {
      errors.image = 'Product image is required'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      })
    }
    
    // Show checking indicator for title field
    if (name === 'title' && value.trim()) {
      setIsCheckingDuplicate(true)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only image files (JPEG, PNG, WebP) are allowed')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }

      setSelectedImage(file)
      
      // Clear image error when user selects an image
      if (formErrors.image) {
        setFormErrors({
          ...formErrors,
          image: undefined
        })
      }
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async () => {
    if (!selectedImage) return null
    
    try {
      const result = await uploadImageMutation.mutateAsync(selectedImage)
      return result.data.imageUrl
    } catch (error) {
      toast.error('Failed to upload image')
      throw error
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    
   
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields')
      return
    }
    
    setIsSubmitting(true) // Set loading state
  
    
    try {
      // Add artificial delay to see loading state better
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Upload image first if selected
      let imageUrl = ''
      if (selectedImage) {
     
        imageUrl = await uploadImage()
    
      }

      const productData = {
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        image: imageUrl
      }

      
      await createProductMutation.mutateAsync(productData)

      toast.success('Product created successfully!')
      
      // Trigger manual refetch to ensure the list updates
      refetch()
      resetForm()
    } catch (error) {
      console.error('Error in add product:', error)
      toast.error('Failed to create product')
    } finally {
      setIsSubmitting(false)
   
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product.id)
    const productData = {
      title: product.title,
      subtitle: product.subtitle || '',
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      image: product.image || ''
    }
    
    setFormData(productData)
    setOriginalProductData(productData)
    setImagePreview(product.image || '')
    setSelectedImage(null)
    setFormErrors({}) // Clear any existing errors
    setShowAddForm(true)
  }

  const hasChanges = () => {
    if (!originalProductData) return true // If no original data, allow update
    
    // Check form data changes
    const formChanged = Object.keys(formData).some(key => {
      return formData[key] !== originalProductData[key]
    })
    
    // Check if new image is selected
    const imageChanged = selectedImage !== null
    
    return formChanged || imageChanged
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields')
      return
    }
    
    // Check if there are any changes
    if (!hasChanges()) {
      toast.info('No changes detected')
      return
    }
    
    try {
      // Upload new image if selected
      let imageUrl = formData.image // Keep existing image by default
      if (selectedImage) {
        imageUrl = await uploadImage()
      }

      await updateProductMutation.mutateAsync({
        id: editingProduct,
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        image: imageUrl
      })
      toast.success('Product updated successfully!')
      
      // Trigger manual refetch to ensure the list updates
      refetch()
      resetForm()
    } catch (error) {
      toast.error('Failed to update product')
    }
  }

  const handleDeleteProduct = async (id, force = false) => {
    const confirmMessage = force 
      ? 'This will force remove the product from the system. Products in orders will be marked as deleted but preserved for order history. Are you sure?' 
      : 'Are you sure you want to delete this product?';
      
    if (window.confirm(confirmMessage)) {
      try {
        await deleteProductMutation.mutateAsync({ id, force })
        toast.success('Product deleted successfully!')
        
        // Trigger manual refetch to ensure the list updates
        refetch()
      } catch (error) {
        console.error('Delete error:', error)
        const errorMessage = error.message || 'Failed to delete product'
        
        // Check if it's a "product in use" error and offer force delete
        if (errorMessage.includes('Use force delete') && !force) {
          const forceDelete = window.confirm(
            `${errorMessage}\n\nWould you like to force remove this product? If it's in orders, it will be marked as deleted but preserved for order history.`
          )
          if (forceDelete) {
            handleDeleteProduct(id, true)
          }
        } else {
          toast.error(errorMessage)
        }
      }
    }
  }

  const handleSignOut = () => {
    logout()
    navigate('/')
  }

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      image: ''
    })
    setSelectedImage(null)
    setImagePreview('')
    setFormErrors({})
    setIsCheckingDuplicate(false)
    setIsSubmitting(false) // Reset local loading state
    setShowAddForm(false)
    setEditingProduct(null)
    setOriginalProductData(null)
  }

  const getStockStatus = (stock) => {
    if (stock <= 5) return { text: 'Low Stock', color: 'text-red-600 bg-red-100' }
    if (stock <= 15) return { text: 'Medium Stock', color: 'text-yellow-600 bg-yellow-100' }
    return { text: 'In Stock', color: 'text-green-600 bg-green-100' }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-matcha mx-auto"></div>
          <p className="mt-4 text-gray-600 inter">Loading products...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 inter mb-4">Failed to load products</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-matcha text-white px-4 py-2 rounded-md hover:bg-green-800"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-3xl playfair matcha">ZEN</Link>
            <nav className="flex space-x-6">
              <Link 
                to="/admin/products" 
                className="text-gray-900 border-b-2 border-matcha inter font-medium"
              >
                Products
              </Link>
              <Link 
                to="/admin/orders" 
                className="text-gray-600 hover:text-gray-900 inter font-medium"
              >
                Orders
              </Link>
            </nav>
          </div>
          <button 
            onClick={handleSignOut}
            className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors"
            title="Sign Out"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
              />
            </svg>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl playfair matcha">Products Overview</h2>
            <p className="inter text-gray-600 mt-1">Manage your ZEN product inventory</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-matcha text-white px-6 py-3 rounded-md hover:bg-green-800 transition-colors inter font-medium"
            >
              {showAddForm ? 'Cancel' : '+ Add Product'}
            </button>
          </div>
        </div>

        {/* Add/Edit Product Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-xl playfair matcha mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 inter mb-2">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    maxLength="100"
                    className={`w-full px-3 py-3 border rounded-md inter focus:outline-none focus:ring-2 focus:ring-matcha focus:border-matcha ${
                      formErrors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Product name"
                  />
                  <p className="text-xs text-gray-500 mt-1 inter">
                    {formData.title.length}/100 characters
                  </p>
                  {isCheckingDuplicate && formData.title.trim() && (
                    <div className="flex items-center mt-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-2"></div>
                      <span className="text-xs text-blue-600 inter">Checking availability...</span>
                    </div>
                  )}
                  {formErrors.title && (
                    <p className="text-red-500 text-xs mt-1 inter">{formErrors.title}</p>
                  )}
                  {!formErrors.title && !isCheckingDuplicate && formData.title.trim() && (
                    <p className="text-green-600 text-xs mt-1 inter">✓ Product name is available</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 inter mb-2">
                    Product Subtitle <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    maxLength="100"
                    className={`w-full px-3 py-3 border rounded-md inter focus:outline-none focus:ring-2 focus:ring-matcha focus:border-matcha ${
                      formErrors.subtitle ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Short product subtitle"
                  />
                  <p className="text-xs text-gray-500 mt-1 inter">
                    {formData.subtitle.length}/100 characters
                  </p>
                  {formErrors.subtitle && (
                    <p className="text-red-500 text-xs mt-1 inter">{formErrors.subtitle}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 inter mb-2">
                    Product Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    maxLength="1000"
                    rows="3"
                    className={`w-full px-3 py-3 border rounded-md inter focus:outline-none focus:ring-2 focus:ring-matcha focus:border-matcha ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Detailed product description (optional)"
                  />
                  <p className="text-xs text-gray-500 mt-1 inter">
                    {formData.description.length}/1000 characters
                  </p>
                  {formErrors.description && (
                    <p className="text-red-500 text-xs mt-1 inter">{formErrors.description}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 inter mb-2">
                    Price (PHP) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-3 py-3 border rounded-md inter focus:outline-none focus:ring-2 focus:ring-matcha focus:border-matcha ${
                      formErrors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {formErrors.price && (
                    <p className="text-red-500 text-xs mt-1 inter">{formErrors.price}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 inter mb-2">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-3 border rounded-md inter focus:outline-none focus:ring-2 focus:ring-matcha focus:border-matcha ${
                      formErrors.stock ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {formErrors.stock && (
                    <p className="text-red-500 text-xs mt-1 inter">{formErrors.stock}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 inter mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 border rounded-md inter focus:outline-none focus:ring-2 focus:ring-matcha focus:border-matcha ${
                      formErrors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Category</option>
                    <option value="Tools">Tools</option>
                    <option value="Bowls">Bowls</option>
                    <option value="Sets">Sets</option>
                    <option value="Matcha">Matcha</option>
                  </select>
                  {formErrors.category && (
                    <p className="text-red-500 text-xs mt-1 inter">{formErrors.category}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 inter mb-2">
                    Product Image <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-3 py-3 border border-gray-300 rounded-md inter focus:outline-none focus:ring-2 focus:ring-matcha focus:border-matcha"
                      />
                      <p className="text-xs text-gray-500 mt-1 inter">
                        Supported formats: JPEG, PNG, WebP. Max size: 5MB
                      </p>
                      {formErrors.image && (
                        <p className="text-red-500 text-xs mt-1 inter">{formErrors.image}</p>
                      )}
                      {uploadImageMutation.isLoading && (
                        <div className="flex items-center mt-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-matcha mr-2"></div>
                          <span className="text-sm text-gray-600 inter">Uploading image...</span>
                        </div>
                      )}
                    </div>
                    {imagePreview && (
                      <div className="shrink-0">
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="w-20 h-20 object-cover rounded-md border border-gray-300"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting || createProductMutation.isLoading || updateProductMutation.isLoading || (editingProduct && !hasChanges())}
                  className={`px-6 py-3 rounded-md transition-colors inter font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
                    editingProduct && !hasChanges() 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-matcha text-white hover:bg-green-800'
                  }`}
                  // onClick={() => {
                  //   console.log('Button clicked')
                  //   console.log('Is submitting:', isSubmitting)
                  //   console.log('Create loading:', createProductMutation.isLoading)
                  //   console.log('Update loading:', updateProductMutation.isLoading)
                  //   console.log('Upload loading:', uploadImageMutation.isLoading)
                  // }}
                >
                  {(isSubmitting || createProductMutation.isLoading || updateProductMutation.isLoading || uploadImageMutation.isLoading) && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  {isSubmitting || createProductMutation.isLoading || updateProductMutation.isLoading || uploadImageMutation.isLoading 
                    ? (editingProduct ? 'Updating...' : 'Adding...')
                    : (editingProduct ? (hasChanges() ? 'Update Product' : 'No Changes') : 'Add Product')
                  }
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 transition-colors inter font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg playfair matcha">Product Inventory</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-2/5" />
                <col className="w-20" />
                <col className="w-24" />
                <col className="w-28" />
                <col className="w-20" />
                <col className="w-28" />
                <col className="w-32" />
              </colgroup>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider inter">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider inter">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider inter">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider inter">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider inter">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider inter">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider inter">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => {
                  const stockStatus = getStockStatus(product.stock)
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-gray-900 playfair truncate">
                            {product.title}
                          </div>
                          <div className="text-sm text-gray-500 inter truncate">{product.subtitle}</div>
                          {product.description && (
                            <div className="text-xs text-gray-400 inter mt-1 truncate" title={product.description}>
                              {product.description.length > 50 ? `${product.description.substring(0, 50)}...` : product.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-10 h-10 object-cover rounded border border-gray-300 mx-auto"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded border border-gray-300 flex items-center justify-center mx-auto">
                            <span className="text-gray-400 text-xs">No img</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 inter truncate">
                        {product.category}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 playfair">
                        ₱{product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 inter text-center">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium inter ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            disabled={updateProductMutation.isLoading}
                            className="text-matcha hover:text-green-800 inter disabled:opacity-50 text-xs px-2 py-1 border border-matcha rounded hover:bg-green-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deleteProductMutation.isLoading}
                            className="text-red-600 hover:text-red-800 inter disabled:opacity-50 text-xs px-2 py-1 border border-red-600 rounded hover:bg-red-50 flex items-center"
                          >
                            {deleteProductMutation.isLoading ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                            ) : null}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl playfair matcha">{products.length}</div>
            <div className="text-sm text-gray-500 inter">Total Products</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl playfair text-green-600">
              {products.filter(p => p.stock > 15).length}
            </div>
            <div className="text-sm text-gray-500 inter">In Stock</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl playfair text-yellow-600">
              {products.filter(p => p.stock <= 15 && p.stock > 5).length}
            </div>
            <div className="text-sm text-gray-500 inter">Low Stock</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl playfair text-red-600">
              {products.filter(p => p.stock <= 5).length}
            </div>
            <div className="text-sm text-gray-500 inter">Critical Stock</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductManagement
