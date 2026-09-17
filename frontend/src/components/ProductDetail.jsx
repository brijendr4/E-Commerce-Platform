import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productsAPI } from '../lib/api'
import { useCartDispatch } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FaStar, FaShoppingBag, FaArrowLeft, FaPlus, FaMinus, FaHeart, FaRegHeart, FaCheck } from 'react-icons/fa'

export default function ProductDetail() {
  const { id } = useParams()
  const dispatch = useCartDispatch()
  const { user, isWishlisted, toggleWishlistItem } = useAuth()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [size, setSize] = useState('')
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const p = await productsAPI.getById(id)
        setProduct(p)
        setSize(p.sizes?.[0] || '')
      } catch (err) {
        setError(err.message || 'Product not found')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return (
    <div className="container-main py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="nm-skeleton h-[420px] w-full" />
        <div className="space-y-6">
          <div className="nm-skeleton h-10 w-3/4" />
          <div className="nm-skeleton h-6 w-1/4" />
          <div className="nm-skeleton h-24 w-full" />
          <div className="nm-skeleton h-12 w-full" />
        </div>
      </div>
    </div>
  )

  if (error || !product) return (
    <div className="container-main py-16 text-center">
      <div className="shadow-soft p-8 max-w-md mx-auto bg-primary">
        <h2 className="text-2xl font-black uppercase text-red-500 mb-4">Product Not Found</h2>
        <p className="text-zinc-500 text-sm mb-6">{error || 'The product you are looking for does not exist.'}</p>
        <Link to="/products" className="btn btn-secondary no-underline text-xs">Back to Shop</Link>
      </div>
    </div>
  )

  function add() {
    dispatch({ type: 'ADD', payload: { product, size, qty } })
    setAdded(true)
    toast.success(`${product.name} added to cart!`)
    setTimeout(() => setAdded(false), 2000)
  }

  async function handleWishlist() {
    if (!user) {
      toast.error('Please sign in to save items to your wishlist.')
      return
    }
    if (wishlistLoading) return
    setWishlistLoading(true)
    try {
      const wasAdded = await toggleWishlistItem(product)
      toast(wasAdded ? 'Added to wishlist! ❤️' : 'Removed from wishlist', {
        icon: wasAdded ? '❤️' : '💔'
      })
    } catch {
      toast.error('Failed to update wishlist.')
    } finally {
      setWishlistLoading(false)
    }
  }

  return (
    <div className="container-main py-10">
      
      {/* Back navigation */}
      <div className="mb-6">
        <Link to="/products" className="btn btn-primary py-2 px-4 text-xs font-bold no-underline inline-flex items-center gap-2">
          <FaArrowLeft className="text-xs" /> Back to Shop
        </Link>
      </div>

      <div className="shadow-soft p-6 md:p-10 rounded-3xl bg-primary grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start">
        
        {/* Left image frame */}
        <div className="shadow-inset p-4 rounded-2xl bg-[#e6e8ec]">
          <div className="rounded-xl overflow-hidden aspect-[4/5] bg-zinc-200">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>

        {/* Right product details panel */}
        <div className="space-y-8">
          <div>
            {product.featured && <span className="badge badge-dark mb-3">Exclusive Drop</span>}
            <h1 className="text-3xl font-black uppercase text-zinc-900 tracking-tight mt-1">{product.name}</h1>
            
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className="text-2xl font-black text-zinc-900">${product.price.toFixed(2)}</span>
              
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg shadow-inset text-xs font-extrabold text-amber-500 bg-primary">
                <FaStar /> <span>{product.rating || '4.5'}</span>
              </div>

              {/* Wishlist button in detail page */}
              <button
                onClick={handleWishlist}
                disabled={wishlistLoading}
                className={`w-10 h-10 flex items-center justify-center transition-all duration-200 focus:outline-none ${
                  product && isWishlisted(product._id)
                    ? 'bg-red-500 border border-red-400 rounded-xl shadow-md cursor-pointer hover:scale-110'
                    : 'bg-transparent border-none cursor-pointer hover:scale-120'
                } ${wishlistLoading ? 'opacity-60 cursor-wait' : ''}`}
                aria-label={product && isWishlisted(product._id) ? "Remove from wishlist" : "Add to wishlist"}
              >
                {product && isWishlisted(product._id) ? (
                  <FaHeart className="text-lg text-white transition-all animate-bounce-short" />
                ) : (
                  <FaRegHeart className="text-2xl text-zinc-800 transition-all hover:text-red-500 drop-shadow-[0_1.5px_2.5px_rgba(255,255,255,0.9)]" />
                )}
              </button>
            </div>
          </div>

          <div className="border-t border-b border-zinc-300/40 py-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Description</h3>
            <p className="text-zinc-650 text-sm leading-relaxed font-semibold">{product.description}</p>
          </div>

          {/* Sizing dropdown / buttons */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-3">Select Size</label>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`w-11 h-11 flex items-center justify-center text-xs font-black rounded-xl border border-white/50 transition-all duration-150 cursor-pointer ${
                      size === s
                        ? 'shadow-inset text-zinc-900 border-zinc-300 bg-primary'
                        : 'btn btn-primary shadow-soft text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector and checkout submit button */}
          <div className="flex flex-wrap items-end gap-6 pt-2">
            
            {/* Quantity Controls */}
            <div className="w-32">
              <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-3">Quantity</label>
              <div className="flex items-center justify-between shadow-inset px-2 py-1.5 h-12 bg-primary">
                <button 
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="btn btn-icon-only btn-primary w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
                >
                  <FaMinus className="text-[8px]" />
                </button>
                <span className="text-sm font-black text-zinc-900">{qty}</span>
                <button 
                  onClick={() => setQty(q => Math.min(10, q + 1))}
                  className="btn btn-icon-only btn-primary w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
                >
                  <FaPlus className="text-[8px]" />
                </button>
              </div>
            </div>

            {/* Add to Cart button */}
            <div className="flex-1 min-w-[180px]">
              <button
                onClick={add}
                disabled={!size}
                className={`w-full h-12 rounded-full uppercase font-black text-xs tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border ${
                  !size
                    ? 'btn btn-primary text-zinc-400 cursor-not-allowed opacity-60'
                    : added
                      ? 'bg-emerald-500 text-white border-emerald-400 shadow-md scale-95'
                      : 'btn btn-secondary rounded-full hover:scale-[1.02] active:scale-95'
                }`}
              >
                {!size ? (
                  'Select a Size'
                ) : added ? (
                  <><FaCheck className="text-xs" /> Added to Cart!</>
                ) : (
                  <><FaShoppingBag className="text-xs" /> Add to Cart</>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}
