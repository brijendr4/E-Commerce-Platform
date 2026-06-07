import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { FaSearch, FaShoppingBag, FaUser, FaSignOutAlt, FaBars, FaTimes, FaPlus, FaClipboardList, FaHeart } from 'react-icons/fa'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { count } = useCart() || { count: 0 }
  const { user, logout, wishlist } = useAuth()
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setSearchOpen(false)
    }
  }

  return (
    <header className="header-global bg-primary">
      <nav id="navbar-main" aria-label="Primary navigation" className="navbar navbar-main navbar-expand-lg navbar-theme-primary navbar-light py-4">
        <div className="container-main flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="navbar-brand shadow-soft py-2 px-3 sm:py-2.5 sm:px-4 rounded border border-light mr-lg-4 no-underline inline-flex items-center gap-2 bg-primary">
            <span className="font-black text-xs sm:text-sm uppercase tracking-widest text-zinc-800 font-mono">
              FASHION<span className="text-zinc-500 font-normal">&FREEDOM</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/" className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-650 hover:text-zinc-900 no-underline transition-colors">
              Home
            </Link>
            <Link to="/products" className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-650 hover:text-zinc-900 no-underline transition-colors">
              Collections
            </Link>
            <Link to="/products?featured=true" className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-650 hover:text-zinc-900 no-underline transition-colors">
              Trending
            </Link>
            {user && (
              <Link to="/orders" className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-650 hover:text-zinc-900 no-underline transition-colors flex items-center gap-1.5">
                <FaClipboardList className="text-[10px]" /> My Orders
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 no-underline transition-colors flex items-center gap-1.5 font-extrabold">
                Admin Panel
              </Link>
            )}
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Search */}
            <button 
              onClick={() => setSearchOpen(!searchOpen)}
              className="btn btn-icon-only btn-primary"
              aria-label="Toggle search"
            >
              <FaSearch className="text-xs" />
            </button>

            {/* Wishlist */}
            {user && (
              <Link
                to="/wishlist"
                className="btn btn-icon-only btn-primary relative no-underline"
                aria-label={`Wishlist — ${wishlist?.length || 0} item${wishlist?.length !== 1 ? 's' : ''}`}
              >
                <FaHeart className="text-xs" />
                {wishlist?.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center text-[9px] font-black text-white rounded-full bg-red-500 border border-[#e6e8ec] shadow">
                    {wishlist.length > 99 ? '99+' : wishlist.length}
                  </span>
                )}
              </Link>
            )}

            {/* Cart */}
            <Link 
              to="/cart" 
              className="btn btn-icon-only btn-primary relative no-underline"
              aria-label={`Cart — ${count} item${count !== 1 ? 's' : ''}`}
            >
              <FaShoppingBag className="text-xs" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center text-[9px] font-black text-white rounded-full bg-zinc-800 border border-[#e6e8ec] shadow">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>

            {/* User section (desktop) */}
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                {/* User avatar */}
                <Link
                  to="/profile"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-zinc-800 shadow-soft border border-white/50 bg-primary font-mono no-underline overflow-hidden"
                  title={`${user.name} — View Profile`}
                >
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    user.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </Link>
                <button 
                  onClick={logout}
                  className="btn btn-icon-only btn-primary text-red-500 hover:text-red-600"
                  aria-label="Logout"
                  title="Logout"
                >
                  <FaSignOutAlt className="text-xs" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn btn-primary text-secondary mr-2 py-2 px-4 no-underline text-xs">
                  <FaUser className="mr-1.5 text-[10px]" /> Sign In
                </Link>
                <Link to="/signup" className="btn btn-primary py-2 px-4 no-underline text-xs">
                  <FaPlus className="mr-1.5 text-[10px]" /> Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button 
              onClick={() => setOpen(!open)}
              className="btn btn-icon-only btn-primary md:hidden ml-2"
              aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={open}
            >
              {open ? <FaTimes className="text-xs" /> : <FaBars className="text-xs" />}
            </button>

          </div>
        </div>

        {/* Search bar dropdown */}
        {searchOpen && (
          <div className="container-main mt-4 animate-fade-in">
            <div className="shadow-inset p-4 rounded-2xl bg-primary">
              <form onSubmit={handleSearch} className="flex gap-3" role="search">
                <label htmlFor="navbar-search" className="sr-only">Search products</label>
                <input
                  id="navbar-search"
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search collections (e.g. Linen, Joggers)..."
                  className="form-control flex-1"
                  autoFocus
                />
                <button type="submit" className="btn btn-secondary px-6 py-3">Search</button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile drawer */}
        {open && (
          <div className="container-main mt-4 md:hidden animate-fade-in">
            <div className="shadow-soft p-4 flex flex-col gap-2 bg-primary rounded-2xl border border-white/50">
              {[
                { label: 'Home', to: '/' },
                { label: 'Collections', to: '/products' },
                { label: 'Trending', to: '/products?featured=true' },
                ...(user ? [
                  { label: 'Profile', to: '/profile' },
                  { label: 'My Orders', to: '/orders' },
                  { label: 'My Wishlist', to: '/wishlist' }
                ] : []),
                ...(user?.role === 'admin' ? [{ label: 'Admin Panel', to: '/admin' }] : [])
              ].map(link => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-550 hover:text-zinc-900 rounded-xl no-underline"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-zinc-300 mt-2 pt-3">
                {user ? (
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-xs font-bold text-zinc-800 uppercase truncate max-w-[160px]">
                      {user.name}
                    </span>
                    <button
                      onClick={() => { logout(); setOpen(false) }}
                      className="text-xs font-black uppercase text-red-500 bg-transparent border-none cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link 
                      to="/login" 
                      className="btn btn-primary text-center no-underline text-xs py-2.5" 
                      onClick={() => setOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/signup" 
                      className="btn btn-secondary text-center no-underline text-xs py-2.5" 
                      onClick={() => setOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
