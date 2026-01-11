import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { useAllOrders, useUpdateOrderStatus } from '../../hooks/useOrders'

const OrderManagement = () => {
  const { logout } = useUser()
  const navigate = useNavigate()
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  
  // Fetch all orders from backend (without status filter for better performance)
  const { data: ordersResponse, isLoading, error, refetch } = useAllOrders(1, 100, '') // Fetch more orders at once
  
  const allOrders = ordersResponse?.data || []
  
  const filteredOrders = statusFilter === 'all' 
    ? allOrders 
    : allOrders.filter(order => order.status?.toLowerCase() === statusFilter.toLowerCase())
  
  // Update order status mutation
  const updateOrderStatusMutation = useUpdateOrderStatus()

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase()
    switch (normalizedStatus) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatusMutation.mutateAsync({ orderId, status: newStatus.toUpperCase() })
      // Update selected order if it's the one being updated
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus.toUpperCase() }))
      }
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
  }

  const getAvailableStatuses = (currentStatus) => {
    const status = currentStatus?.toUpperCase()
    
    switch (status) {
      case 'PENDING':
        return [
          { value: 'pending', label: 'Pending', disabled: true }, // Current status (disabled)
          { value: 'processing', label: 'Processing' },
          { value: 'cancelled', label: 'Cancelled' }
        ]
      case 'PROCESSING':
        return [
          { value: 'processing', label: 'Processing', disabled: true }, // Current status (disabled)
          { value: 'shipped', label: 'Shipped' }
        ]
      case 'SHIPPED':
        return [
          { value: 'shipped', label: 'Shipped', disabled: true }, // Current status (disabled)
          { value: 'delivered', label: 'Delivered' }
        ]
      case 'DELIVERED':
        return [
          { value: 'delivered', label: 'Delivered', disabled: true } // Final status
        ]
      case 'CANCELLED':
        return [
          { value: 'cancelled', label: 'Cancelled', disabled: true } // Final status
        ]
      default:
        // Fallback - show all statuses
        return [
          { value: 'pending', label: 'Pending' },
          { value: 'processing', label: 'Processing' },
          { value: 'shipped', label: 'Shipped' },
          { value: 'delivered', label: 'Delivered' },
          { value: 'cancelled', label: 'Cancelled' }
        ]
    }
  }
  
  const getOrderCountByStatus = (status) => {
    if (status === 'all') return allOrders.length
    return allOrders.filter(order => order.status?.toLowerCase() === status.toLowerCase()).length
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status)
    setSelectedOrder(null) 
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen cream">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl playfair matcha">ZEN</Link>
              <nav className="flex space-x-6">
                <Link 
                  to="/admin/products" 
                  className="text-gray-600 hover:text-gray-900 inter font-medium"
                >
                  Products
                </Link>
                <Link 
                  to="/admin/orders" 
                  className="text-gray-900 border-b-2 border-matcha inter font-medium"
                >
                  Orders
                </Link>
              </nav>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-matcha mx-auto mb-4"></div>
            <p className="text-gray-600 inter">Loading orders...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen cream">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl playfair matcha">ZEN</Link>
              <nav className="flex space-x-6">
                <Link 
                  to="/admin/products" 
                  className="text-gray-600 hover:text-gray-900 inter font-medium"
                >
                  Products
                </Link>
                <Link 
                  to="/admin/orders" 
                  className="text-gray-900 border-b-2 border-matcha inter font-medium"
                >
                  Orders
                </Link>
              </nav>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <p className="text-red-600 inter mb-4">Failed to load orders</p>
            <button 
              onClick={() => refetch()}
              className="bg-matcha text-white px-4 py-2 rounded-md hover:bg-green-800 inter"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen cream">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl playfair matcha">ZEN</Link>
            <nav className="flex space-x-6">
              <Link 
                to="/admin/products" 
                className="text-gray-600 hover:text-gray-900 inter font-medium"
              >
                Products
              </Link>
              <Link 
                to="/admin/orders" 
                className="text-gray-900 border-b-2 border-matcha inter font-medium"
              >
                Orders
              </Link>
            </nav>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors"
            title="Logout"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" 
              />
            </svg>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl playfair matcha mb-2">Order Management</h1>
              <p className="text-gray-600 inter">Manage customer orders and track shipments</p>
            </div>
            <button 
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 inter font-medium disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              {['all', 'pending', 'processing', 'shipped', 'delivered'].map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusFilterChange(status)}
                  className={`px-4 py-2 rounded-md inter font-medium capitalize transition-colors ${
                    statusFilter === status
                      ? 'bg-matcha text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {status === 'all' ? 'All Orders' : status}
                  <span className="ml-2 text-sm">
                    ({getOrderCountByStatus(status)})
                  </span>
                </button>
              ))}
            </div>
            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-500 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-matcha"></div>
                <span>Updating...</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold inter">Orders ({filteredOrders.length})</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredOrders.map(order => (
                  <div
                    key={order.id}
                    className={`p-6 cursor-pointer hover:bg-gray-50 ${
                      selectedOrder?.id === order.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold inter text-gray-900">{order.orderNumber}</h3>
                        <p className="text-sm text-gray-600 inter">{order.customer?.firstName} {order.customer?.lastName}</p>
                        <p className="text-sm text-gray-500 inter">{order.customer?.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold inter">₱{order.total?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        <p className="text-sm text-gray-500 inter">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium inter ${getStatusColor(order.status)}`}>
                          {order.status?.toUpperCase()}
                        </span>
                        {order.paymentMethod && (
                          <span className={`px-2 py-1 rounded text-xs font-medium inter ${order.paymentMethod === 'COD' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                            {order.paymentMethod}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 inter">
                        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                ))}
                {filteredOrders.length === 0 && (
                  <div className="p-6 text-center text-gray-500 inter">
                    No orders found for the selected filter.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold inter">Order Details</h2>
              </div>
              {selectedOrder ? (
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="font-semibold inter text-gray-900 mb-2">{selectedOrder.orderNumber}</h3>
                    <div className="space-y-2 text-sm inter">
                      <p><span className="text-gray-500">Customer:</span> {selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}</p>
                      <p><span className="text-gray-500">Email:</span> {selectedOrder.customer?.email}</p>
                      <p><span className="text-gray-500">Phone:</span> {selectedOrder.customer?.phone || 'N/A'}</p>
                      <p><span className="text-gray-500">Date:</span> {formatDate(selectedOrder.createdAt)}</p>
                      <p><span className="text-gray-500">Subtotal:</span> ₱{selectedOrder.subtotal?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      <p><span className="text-gray-500">Shipping:</span> ₱{selectedOrder.shipping?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      <p><span className="text-gray-500">Total:</span> ₱{selectedOrder.total?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      <p><span className="text-gray-500">Payment Status:</span> <span className={`font-medium ${selectedOrder.paymentStatus === 'COMPLETED' ? 'text-green-600' : 'text-orange-600'}`}>{selectedOrder.paymentStatus || 'N/A'}</span></p>
                      <p><span className="text-gray-500">Payment Method:</span> <span className={`font-medium px-2 py-1 rounded text-xs ${selectedOrder.paymentMethod === 'COD' ? 'bg-blue-100 text-blue-800' : selectedOrder.paymentMethod === 'PAYMONGO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{selectedOrder.paymentMethod || 'N/A'}</span></p>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 inter mb-2">
                      Update Status
                    </label>
                    <select
                      value={selectedOrder.status?.toLowerCase() || 'pending'}
                      onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                      disabled={updateOrderStatusMutation.isLoading}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 inter disabled:bg-gray-100"
                    >
                      {getAvailableStatuses(selectedOrder.status).map(status => (
                        <option 
                          key={status.value} 
                          value={status.value}
                          disabled={status.disabled}
                          className={status.disabled ? 'text-gray-400 bg-gray-50' : ''}
                        >
                          {status.label}
                          {status.disabled ? ' (Current)' : ''}
                        </option>
                      ))}
                    </select>
                    {updateOrderStatusMutation.isLoading && (
                      <p className="text-sm text-gray-500 mt-1">Updating...</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedOrder.status === 'PENDING' && 'Next: Mark as Processing or Cancel'}
                      {selectedOrder.status === 'PROCESSING' && 'Next: Mark as Shipped'}
                      {selectedOrder.status === 'SHIPPED' && 'Next: Mark as Delivered'}
                      {(selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'CANCELLED') && 'Order is complete - no further updates allowed'}
                    </p>
                  </div>

                  {/* Shipping Address */}
                  <div className="mb-6">
                    <h4 className="font-semibold inter text-gray-900 mb-3">Shipping Address</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm inter">{selectedOrder.address?.street}</p>
                      <p className="text-sm inter">{selectedOrder.address?.barangay}, {selectedOrder.address?.city}</p>
                      {selectedOrder.address?.province && (
                        <p className="text-sm inter">{selectedOrder.address?.province}</p>
                      )}
                      <p className="text-sm inter">{selectedOrder.address?.region} {selectedOrder.address?.zipCode}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold inter text-gray-900 mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                          <div>
                            <p className="font-medium inter">{item.product?.title || item.title}</p>
                            {(item.product?.subtitle || item.subtitle) && (
                              <p className="text-sm text-gray-500 inter">{item.product?.subtitle || item.subtitle}</p>
                            )}
                            <p className="text-sm text-gray-600 inter">Qty: {item.quantity}</p>
                            <p className="text-sm text-gray-500 inter">Unit Price: ₱{item.price?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                          </div>
                          <p className="font-medium inter">₱{(item.price * item.quantity)?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        </div>
                      )) || (
                        <p className="text-gray-500 inter">No items found</p>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold inter">Total:</span>
                        <span className="font-bold inter text-lg">₱{selectedOrder.total?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500 inter">
                  Select an order to view details
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderManagement