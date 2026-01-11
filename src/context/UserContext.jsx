import React, { createContext, useContext, useState, useEffect } from 'react'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Check localStorage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('zenUser')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      
      // Fix existing user data that might not have proper name
      if (userData.email && (!userData.name || userData.name === 'User')) {
        const getDisplayName = (email) => {
          if (email === 'admin@gmail.com') {
            return 'Admin'
          }
          
          const namePart = email.split('@')[0]
          
          if (namePart.includes('.')) {
            const firstName = namePart.split('.')[0]
            return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
          }
          
          return namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase()
        }
        
        userData.name = getDisplayName(userData.email)
        localStorage.setItem('zenUser', JSON.stringify(userData))
      }
      
      setUser(userData)
      setIsLoggedIn(true)
    }
  }, [])

  const login = (email) => {
    // Create a user-friendly name from email
    const getDisplayName = (email) => {
      if (email === 'admin@gmail.com') {
        return 'Admin'
      }
      
      // Extract name part before @ symbol
      const namePart = email.split('@')[0]
      
      // If it contains dots, take the first part and capitalize
      if (namePart.includes('.')) {
        const firstName = namePart.split('.')[0]
        return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
      }
      
      // Otherwise, capitalize the whole name part
      return namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase()
    }

    const userData = {
      email: email,
      isAdmin: email === 'admin@gmail.com',
      name: getDisplayName(email)
    }
    
    setUser(userData)
    setIsLoggedIn(true)
    localStorage.setItem('zenUser', JSON.stringify(userData))
    
    return userData
  }

  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem('zenUser')
  }

  const value = {
    user,
    isLoggedIn,
    login,
    logout
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}