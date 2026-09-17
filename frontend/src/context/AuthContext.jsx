import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [wishlist, setWishlist] = useState([]) // array of product objects
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('ff_token')
    if (token) {
      authAPI.me()
        .then(data => {
          setUser(data.user)
          setWishlist(data.user.wishlist || [])
        })
        .catch(() => {
          localStorage.removeItem('ff_token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  async function login(email, password) {
    const data = await authAPI.login(email, password)
    localStorage.setItem('ff_token', data.token)
    setUser(data.user)
    setWishlist(data.user.wishlist || [])
    return data.user
  }

  async function signup(name, email, password) {
    const data = await authAPI.signup(name, email, password)
    localStorage.setItem('ff_token', data.token)
    setUser(data.user)
    setWishlist(data.user.wishlist || [])
    return data.user
  }

  async function socialLogin(socialData) {
    const data = await authAPI.socialLogin(socialData)
    localStorage.setItem('ff_token', data.token)
    setUser(data.user)
    setWishlist(data.user.wishlist || [])
    return data.user
  }

  function logout() {
    localStorage.removeItem('ff_token')
    setUser(null)
    setWishlist([])
  }

  // Toggle wishlist item – optimistic update then sync
  async function toggleWishlistItem(product) {
    if (!user) return false

    const productId = product._id || product.id
    const isInWishlist = wishlist.some(w => (w._id || w.id || w) === productId || w === productId)

    // Optimistic update
    if (isInWishlist) {
      setWishlist(prev => prev.filter(w => (w._id || w.id || w) !== productId))
    } else {
      setWishlist(prev => [...prev, product])
    }

    try {
      const data = await authAPI.toggleWishlist(productId)
      setWishlist(data.wishlist)
      return !isInWishlist
    } catch (err) {
      // Revert on error
      if (isInWishlist) {
        setWishlist(prev => [...prev, product])
      } else {
        setWishlist(prev => prev.filter(w => (w._id || w.id || w) !== productId))
      }
      throw err
    }
  }

  function isWishlisted(productId) {
    return wishlist.some(w => {
      const wId = w._id || w.id || w
      return wId === productId || wId?.toString() === productId?.toString()
    })
  }

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      wishlist,
      setWishlist,
      loading,
      login,
      signup,
      socialLogin,
      logout,
      toggleWishlistItem,
      isWishlisted
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
