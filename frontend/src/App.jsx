import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './components/Home'
import ProductsPage from './components/ProductsPage'
import ProductDetail from './components/ProductDetail'
import CartPage from './components/CartPage'
import Checkout from './components/Checkout'
import Login from './components/Login'
import Signup from './components/Signup'
import OrdersPage from './components/OrdersPage'
import NotFound from './components/NotFound'
import Profile from './components/Profile'
import AdminDashboard from './components/AdminDashboard'
import WishlistPage from './components/WishlistPage'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          {/* Toast notification system */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#e6e8ec',
                color: '#313435',
                border: '1px solid rgba(255,255,255,0.6)',
                boxShadow: '3px 3px 6px #b8b9be, -3px -3px 6px #ffffff',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '600',
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#e6e8ec' }
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#e6e8ec' }
              }
            }}
          />

          <div className="min-h-screen flex flex-col bg-[#e6e8ec]">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/"            element={<Home />} />
                <Route path="/products"    element={<ProductsPage />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/login"       element={<Login />} />
                <Route path="/signup"      element={<Signup />} />
                <Route path="/cart"        element={<CartPage />} />
                <Route path="/checkout"    element={<Checkout />} />
                <Route path="/orders"      element={<OrdersPage />} />
                <Route path="/profile"     element={<Profile />} />
                <Route path="/admin"       element={<AdminDashboard />} />
                <Route path="/wishlist"    element={<WishlistPage />} />
                {/* 404 catch-all — must be last */}
                <Route path="*"            element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
