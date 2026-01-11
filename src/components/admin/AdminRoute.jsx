import React from 'react'
import { Navigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'

const AdminRoute = ({ children }) => {
  const { user, isLoggedIn } = useUser()
  
  // Check if user is admin
  const isAdmin = isLoggedIn && user && user.isAdmin
  
  if (!isAdmin) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

export default AdminRoute