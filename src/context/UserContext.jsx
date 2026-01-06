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
      setUser(userData)
      setIsLoggedIn(true)
    }
  }, [])

  const login = (email) => {
    const userData = {
      email: email,
      isAdmin: email === 'admin@gmail.com',
      name: email === 'admin@gmail.com' ? 'Admin' : 'User'
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