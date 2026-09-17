import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCartDispatch } from '../context/CartContext'
import toast from 'react-hot-toast'
import { FaHeart, FaShoppingBag, FaArrowLeft, FaTrash, FaStar } from 'react-icons/fa'

export default function WishlistPage() {
  const { user, wishlist, toggleWishlistItem, loading: authLoading } = useAuth()
  const dispatch = useCartDispatch()
  const navigate = useNavigate()

  if (!authLoading && !user) {
    navigate('/login?redirect=wishlist')
    return null
  }

  if (authLoading) {
    return (
      <div className="container-main py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="nm-skeleton h-72 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  async function removeFromWishlist(product) {
    try {
      await toggleWishlistItem(product)
      toast('Removed from wishlist', { icon: '💔', duration: 1500 })
    } catch {
      toast.error('Failed to remove item.')
    }
  }

  function addToCart(product) {
    const defaultSize = product.sizes?.[0] || ''
    dispatch({ type: 'ADD', payload: { product, size: defaultSize, qty: 1 } })
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <div className="container-main py-10">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="btn btn-primary py-2 px-4 text-xs no-underline inline-flex items-center gap-2">
          <FaArrowLeft className="text-xs" /> Back
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900 flex items-center gap-3">
            My Wishlist
            <FaHeart className="text-red-500 text-xl" />
          </h1>
          <p className="text-zinc-500 text-xs mt-1 font-semibold">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
      </div>

      {/* Empty State */}
      {wishlist.length === 0 ? (
        <div className="shadow-soft p-12 text-center max-w-md mx-auto bg-primary rounded-3xl border border-white/50">
          <div className="w-16 h-16 rounded-2xl shadow-inset flex items-center justify-center mx-auto mb-6 text-zinc-400 border border-white/50 bg-primary">
            <FaHeart className="text-xl text-red-300" />
          </div>
          <h2 className="text-2xl font-black uppercase text-zinc-800 tracking-tight mb-2">No Saved Items</h2>
          <p className="text-zinc-500 text-sm mb-8 font-semibold">
            Start saving items you love by clicking the heart button on any product.
          </p>
          <Link to="/products" className="btn btn-secondary no-underline w-full justify-center py-3 text-xs">
            Browse Collections
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map(product => {
            const pid = product._id || product.id
            return (
              <article key={pid} className="shadow-soft bg-primary rounded-2xl border border-white/60 p-4 flex flex-col group relative">

                {/* Remove button */}
                <button
                  onClick={() => removeFromWishlist(product)}
                  className="absolute top-5 right-5 z-10 w-8 h-8 rounded-xl flex items-center justify-center bg-red-500/10 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 cursor-pointer"
                  title="Remove from wishlist"
                >
                  <FaTrash className="text-[9px]" />
                </button>

                {/* Image */}
                <Link to={`/product/${pid}`} className="no-underline block mb-4">
                  <div className="rounded-xl overflow-hidden aspect-[4/5] bg-zinc-200 shadow-inner p-1.5 border border-white/40">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 px-1 mb-3">
                  <h3 className="font-extrabold text-sm uppercase tracking-tight text-zinc-800 mb-1 line-clamp-1">
                    <Link to={`/product/${pid}`} className="no-underline text-inherit hover:text-zinc-500">
                      {product.name}
                    </Link>
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-zinc-900">${product.price?.toFixed(2)}</span>
                    {product.rating && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                        <FaStar className="text-[9px]" /> {product.rating}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1 block">{product.category}</span>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={() => addToCart(product)}
                  className="w-full py-2.5 rounded-full text-[10px] font-black tracking-wider uppercase btn btn-secondary rounded-full hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <FaShoppingBag className="text-[10px]" /> Add to Cart
                </button>

              </article>
            )
          })}
        </div>
      )}

    </div>
  )
}
