import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react'

// Get cart storage key based on user state
const getCartStorageKey = () => {
  try {
    const user = localStorage.getItem('zenUser')
    if (user) {
      const userData = JSON.parse(user)
      return `zen-cart-${userData.email}` 
    }
  } catch (error) {
    // Fallback to anonymous cart if user data is corrupted
  }
  return 'zen-cart-anonymous' 
}

const CartContext = createContext()

// Cart Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.id === action.payload.id)
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        }
      } else {
        return {
          ...state,
          items: [...state.items, { ...action.payload, quantity: 1 }]
        }
      }
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id)
      }
    
    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id)
        }
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      }
    
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload
      }
    
    default:
      return state
  }
}

const initialState = {
  items: []
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Track user state to detect changes
  const [currentUser, setCurrentUser] = React.useState(() => {
    try {
      const user = localStorage.getItem('zenUser')
      return user ? JSON.parse(user) : null
    } catch {
      return null
    }
  })

  const cartKey = useMemo(() => {
    if (currentUser?.email) {
      return `zen-cart-${currentUser.email}`
    }
    return 'zen-cart-anonymous'
  }, [currentUser?.email])

  // Listen for user changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const user = localStorage.getItem('zenUser')
        const newUser = user ? JSON.parse(user) : null
        setCurrentUser(newUser)
      } catch {
        setCurrentUser(null)
      }
    }

    // Listen for storage events from other tabs
    window.addEventListener('storage', handleStorageChange)
    
    // Also check periodically in case of same-tab changes
    const interval = setInterval(handleStorageChange, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(cartKey)
      if (savedCart && savedCart !== 'undefined') {
        const parsedCart = JSON.parse(savedCart)
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          dispatch({ type: 'LOAD_CART', payload: parsedCart })
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
      localStorage.removeItem(cartKey) 
    }
  }, [cartKey])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(cartKey, JSON.stringify(state.items))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  }, [state.items, cartKey])

  const addToCart = useCallback((product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product })
  }, [])

  const removeFromCart = useCallback((productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { id: productId } })
  }, [])

  const updateQuantity = useCallback((productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [])

  // Function to migrate cart when user logs in
  const migrateAnonymousCart = useCallback(() => {
    try {
      const anonymousCart = localStorage.getItem('zen-cart-anonymous')
      if (anonymousCart && anonymousCart !== 'undefined') {
        const parsedCart = JSON.parse(anonymousCart)
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          if (state.items.length === 0) {
            dispatch({ type: 'LOAD_CART', payload: parsedCart })
          } else {
            parsedCart.forEach(anonymousItem => {
              const existingItem = state.items.find(item => item.id === anonymousItem.id)
              if (!existingItem) {
                dispatch({ type: 'ADD_TO_CART', payload: { ...anonymousItem, quantity: anonymousItem.quantity } })
              }
            })
          }
          // Clear anonymous cart after migration
          localStorage.removeItem('zen-cart-anonymous')
        }
      }
    } catch (error) {
      console.error('Error migrating anonymous cart:', error)
    }
  }, [state.items])

  const getCartTotal = useCallback(() => {
    return state.items.reduce((total, item) => {
      let price;
      if (typeof item.price === 'string') {
        price = parseFloat(item.price.replace('PHP ', '').replace(',', ''))
      } else {
        price = parseFloat(item.price)
      }
      return total + (price * item.quantity)
    }, 0)
  }, [state.items])

  const getCartItemCount = useCallback(() => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }, [state.items])

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    migrateAnonymousCart,
    getCartTotal,
    getCartItemCount
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}