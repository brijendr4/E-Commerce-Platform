import React, { createContext, useContext, useReducer, useEffect } from 'react'

const CartState = createContext(null)
const CartDispatch = createContext(null)

const STORAGE_KEY = 'ff_cart'

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { product, size, qty } = action.payload
      const key = `${product._id || product.id}::${size}`
      const existing = state.items[key]
      const newQty = (existing ? existing.qty : 0) + qty
      return { ...state, items: { ...state.items, [key]: { product, size, qty: newQty } } }
    }
    case 'REMOVE': {
      const { key } = action.payload
      const items = { ...state.items }
      delete items[key]
      return { ...state, items }
    }
    case 'SET_QTY': {
      const { key, qty } = action.payload
      if (qty < 1) {
        // Remove item if qty drops to 0
        const items = { ...state.items }
        delete items[key]
        return { ...state, items }
      }
      const items = { ...state.items }
      if (items[key]) items[key] = { ...items[key], qty }
      return { ...state, items }
    }
    case 'CLEAR':
      return { items: {} }
    case 'HYDRATE':
      return { items: action.payload }
    default:
      return state
  }
}

// Load cart from localStorage (runs once on mount)
function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { items: {} })

  // Hydrate from localStorage on first render
  useEffect(() => {
    const savedItems = loadCart()
    if (Object.keys(savedItems).length > 0) {
      dispatch({ type: 'HYDRATE', payload: savedItems })
    }
  }, [])

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
    } catch {
      // localStorage might be unavailable (private browsing, quota exceeded)
    }
  }, [state.items])

  const total = Object.values(state.items).reduce((s, it) => s + it.product.price * it.qty, 0)
  const count = Object.values(state.items).reduce((s, it) => s + it.qty, 0)

  return (
    <CartDispatch.Provider value={dispatch}>
      <CartState.Provider value={{ ...state, total, count }}>
        {children}
      </CartState.Provider>
    </CartDispatch.Provider>
  )
}

export const useCart = () => useContext(CartState)
export const useCartDispatch = () => useContext(CartDispatch)
