import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'

// Sample product data
const initialProducts = [
  { id: 1, title: 'Bamboo Whisk', subtitle: 'Natural Bamboo', price: 490.00, stock: 25, category: 'Tools' },
  { id: 2, title: 'Chawan', subtitle: 'Natural Bamboo', price: 2800, stock: 12, category: 'Bowls' },
  { id: 3, title: 'Chashaku', subtitle: 'Natural Bamboo', price: 430.00, stock: 30, category: 'Tools' },
  { id: 4, title: 'Set', subtitle: 'Ceramic Set', price: 3200, stock: 8, category: 'Sets' },
  { id: 5, title: 'Fine Sieve', subtitle: 'Stainless', price: 350.00, stock: 20, category: 'Tools' },
  { id: 6, title: 'Ceremonial', subtitle: 'Special', price: 4500, stock: 5, category: 'Matcha' },
]

const ProductManagement = () => {
  const { logout } = useUser()
  const navigate = useNavigate()
  const [products, setProducts] = useState(initialProducts)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    price: '',
    stock: '',
    category: ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAddProduct = (e) => {
    e.preventDefault()
    const newProduct = {
      id: Date.now(),
      title: formData.title,
      subtitle: formData.subtitle,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category
    }
    setProducts([...products, newProduct])
    resetForm()
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product.id)
    setFormData({
      title: product.title,
      subtitle: product.subtitle,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category
    })
    setShowAddForm(true)
  }

  const handleUpdateProduct = (e) => {
    e.preventDefault()
    setProducts(products.map(product => 
      product.id === editingProduct
        ? {
            ...product,
            title: formData.title,
            subtitle: formData.subtitle,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            category: formData.category
          }
        : product
    ))
    resetForm()
  }

  const handleDeleteProduct = (id) => {
    setProducts(products.filter(product => product.id !== id))
  }

  const handleSignOut = () => {
    logout()
    navigate('/')
  }

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      price: '',
      stock: '',
      category: ''
    })
    setShowAddForm(false)
    setEditingProduct(null)
  }

  const getStockStatus = (stock) => {
    if (stock <= 5) return { text: 'Low Stock', color: 'text-red-600 bg-red-100' }
    if (stock <= 15) return { text: 'Medium Stock', color: 'text-yellow-600 bg-yellow-100' }
    return { text: 'In Stock', color: 'text-green-600 bg-green-100' }
  }

  return (
    <div className="min-h-screen cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-3xl playfair matcha cursor-default">ZEN</span>
            <span className="text-gray-300">|</span>
            <h1 className="text-xl playfair text-gray-700">Product Management</h1>
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
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-matcha text-white px-6 py-3 rounded-md hover:bg-green-800 transition-colors inter font-medium"
          >
            {showAddForm ? 'Cancel' : '+ Add Product'}
          </button>
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
                    Product Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded-md inter focus:outline-none focus:ring-2 focus:ring-matcha focus:border-matcha"
                    placeholder="Product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 inter mb-2">
                    Subtitle/Description
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded-md inter focus:outline-none focus:ring-2 focus:ring-matcha focus:border-matcha"
                    placeholder="Product description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 inter mb-2">
                    Price (PHP)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    className="w-full px-3 py-3 border border-gray-300 rounded-md inter focus:outline-none focus:ring-2 focus:ring-matcha focus:border-matcha"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 inter mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded-md inter focus:outline-none focus:ring-2 focus:ring-matcha focus:border-matcha"
                    placeholder="0"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 inter mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded-md inter focus:outline-none focus:ring-2 focus:ring-matcha focus:border-matcha"
                  >
                    <option value="">Select Category</option>
                    <option value="Tools">Tools</option>
                    <option value="Bowls">Bowls</option>
                    <option value="Sets">Sets</option>
                    <option value="Matcha">Matcha</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="bg-matcha text-white px-6 py-3 rounded-md hover:bg-green-800 transition-colors inter font-medium"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
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
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider inter">
                    Product
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
                        <div>
                          <div className="text-sm font-medium text-gray-900 playfair">{product.title}</div>
                          <div className="text-sm text-gray-500 inter">{product.subtitle}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 inter">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 playfair">
                        PHP {product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 inter">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium inter ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-matcha hover:text-green-800 mr-3 inter"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-800 inter"
                        >
                          Delete
                        </button>
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
