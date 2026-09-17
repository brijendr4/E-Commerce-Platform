import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCartDispatch } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FaHeart, FaRegHeart, FaShoppingBag, FaCheck } from 'react-icons/fa'

export default function ProductCard({ product }) {
  const dispatch = useCartDispatch()
  const { user, isWishlisted, toggleWishlistItem } = useAuth()
  const [size, setSize] = useState(product.sizes?.[0] || '')
  const [added, setAdded] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  const pid = product._id || product.id
  const inWishlist = isWishlisted(pid)

  function add(e) {
    e.preventDefault()
    dispatch({ type: 'ADD', payload: { product, size, qty: 1 } })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
    toast.success(`${product.name} added to cart!`, { duration: 2000 })
  }

  async function handleWishlist(e) {
    e.preventDefault()
    if (!user) {
      toast.error('Please sign in to save items to your wishlist.')
      return
    }
    if (wishlistLoading) return
    setWishlistLoading(true)
    try {
      const wasAdded = await toggleWishlistItem(product)
      if (wasAdded) {
        toast.success('Added to wishlist! ❤️', { duration: 1500 })
      } else {
        toast('Removed from wishlist', { icon: '💔', duration: 1500 })
      }
    } catch (err) {
      toast.error('Failed to update wishlist.')
    } finally {
      setWishlistLoading(false)
    }
  }

  return (
    <article className="shadow-soft shadow-soft-hover p-4 flex flex-col justify-between h-full bg-[#e6e8ec] border border-white/60 relative rounded-2xl group">
      
      {/* Featured badge */}
      <div className="absolute top-6 left-6 z-10">
        {product.featured && (
          <span className="badge badge-dark">Featured</span>
        )}
      </div>

      {/* Wishlist button */}
      <button
        onClick={handleWishlist}
        disabled={wishlistLoading}
        className={`absolute top-6 right-6 z-10 w-9 h-9 flex items-center justify-center transition-all duration-200 focus:outline-none ${
          inWishlist
            ? 'bg-red-500 border border-red-400 rounded-xl shadow-md cursor-pointer hover:scale-110'
            : 'bg-transparent border-none cursor-pointer hover:scale-120'
        } ${wishlistLoading ? 'opacity-60 cursor-wait' : ''}`}
        aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        aria-pressed={inWishlist}
      >
        {inWishlist ? (
          <FaHeart className="text-sm text-white transition-all animate-bounce-short" />
        ) : (
          <FaRegHeart className="text-xl text-zinc-900 transition-all hover:text-red-500 drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)] font-bold" />
        )}
      </button>

      <div>
        <Link to={`/product/${pid}`} className="no-underline block" aria-label={`View ${product.name} details`}>
          <div className="rounded-xl overflow-hidden aspect-[4/5] bg-zinc-200 shadow-inner mb-4 relative p-1.5 border border-white/40">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </Link>

        {/* Title and Price */}
        <div className="flex items-start justify-between gap-3 mb-2 px-1">
          <h3 className="font-extrabold text-sm uppercase tracking-tight text-zinc-800 line-clamp-1">
            <Link to={`/product/${pid}`} className="no-underline text-inherit hover:text-zinc-500">
              {product.name}
            </Link>
          </h3>
          <span className="font-black text-sm text-zinc-900 flex-shrink-0">${product.price.toFixed(2)}</span>
        </div>

        <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed mb-4 px-1 font-semibold">
          {product.description}
        </p>
      </div>

      {/* Size selector + Add to Cart */}
      <div className="mt-auto px-1 space-y-3">
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.sizes.map(s => (
              <button
                key={s}
                onClick={e => { e.preventDefault(); setSize(s) }}
                className={`w-9 h-9 rounded-full text-[10px] font-black border transition-all duration-150 cursor-pointer ${
                  size === s
                    ? 'shadow-inset bg-primary border-zinc-400 text-zinc-900'
                    : 'btn btn-primary border-white/50 text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={add}
          className={`w-full py-2.5 px-4 rounded-full text-[10px] font-black tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border ${
            added
              ? 'bg-emerald-500 text-white border-emerald-400 shadow-md scale-95'
              : 'btn btn-secondary rounded-full hover:scale-[1.02] active:scale-95'
          }`}
          aria-label={`Add ${product.name} in size ${size} to cart`}
        >
          {added ? (
            <><FaCheck className="text-[10px]" /> Added!</>
          ) : (
            <><FaShoppingBag className="text-[10px]" /> Add to Cart</>
          )}
        </button>
      </div>

    </article>
  )
}
