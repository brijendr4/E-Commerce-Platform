import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ordersAPI } from '../lib/api'
import { FaBox, FaArrowLeft, FaLock, FaChevronDown, FaChevronUp } from 'react-icons/fa'

const STATUS_STYLES = {
  pending:    'bg-amber-100 text-amber-700 border-amber-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  shipped:    'bg-purple-100 text-purple-700 border-purple-200',
  delivered:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled:  'bg-red-100 text-red-600 border-red-200'
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false)
  const date = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })

  return (
    <div className="shadow-soft p-5 bg-primary rounded-2xl border border-white/50">
      
      {/* Order header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Order ID</div>
          <div className="text-xs font-mono font-bold text-zinc-700">{order._id}</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-zinc-400">{date}</span>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${STATUS_STYLES[order.status] || 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Order summary row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-300/40 pt-4">
        <div className="flex items-center gap-3">
          {/* Thumbnails of first 3 items */}
          <div className="flex -space-x-2">
            {order.items.slice(0, 3).map((it, i) => (
              <div key={i} className="w-10 h-10 rounded-lg shadow-inset p-0.5 border border-white/40 bg-primary overflow-hidden flex-shrink-0">
                {it.product?.image ? (
                  <img src={it.product.image} alt={it.name} className="w-full h-full object-cover rounded-md" />
                ) : (
                  <div className="w-full h-full bg-zinc-200 rounded-md" />
                )}
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="w-10 h-10 rounded-lg shadow-soft flex items-center justify-center text-[10px] font-black text-zinc-500 bg-primary border border-white/40">
                +{order.items.length - 3}
              </div>
            )}
          </div>
          <span className="text-xs font-bold text-zinc-500">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-base font-black text-zinc-900">${order.total.toFixed(2)}</span>
          <button
            onClick={() => setExpanded(e => !e)}
            className="btn btn-icon-only btn-primary w-8 h-8 rounded-lg cursor-pointer"
            aria-label={expanded ? 'Collapse order details' : 'Expand order details'}
          >
            {expanded ? <FaChevronUp className="text-[10px]" /> : <FaChevronDown className="text-[10px]" />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-zinc-300/40 space-y-3 animate-fade-in">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Items</h4>
          {order.items.map((it, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg shadow-inset p-0.5 border border-white/40 bg-primary overflow-hidden flex-shrink-0">
                {it.product?.image ? (
                  <img src={it.product.image} alt={it.name} className="w-full h-full object-cover rounded-md" />
                ) : (
                  <div className="w-full h-full bg-zinc-200 rounded-md" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-xs text-zinc-800 uppercase tracking-tight truncate">{it.name}</div>
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
                  Size: {it.size || '—'} &bull; Qty: {it.qty}
                </div>
              </div>
              <div className="font-black text-xs text-zinc-900">${(it.price * it.qty).toFixed(2)}</div>
            </div>
          ))}

          <div className="mt-3 pt-3 border-t border-zinc-300/40">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Shipping To</h4>
            <div className="text-xs font-semibold text-zinc-600 leading-relaxed">
              {order.shippingAddress.fullName}<br />
              {order.shippingAddress.address}{order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ''}<br />
              {order.shippingAddress.phone}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/login?redirect=orders')
      return
    }

    async function fetchOrders() {
      try {
        const data = await ordersAPI.getMyOrders()
        setOrders(data)
      } catch (err) {
        setError(err.message || 'Failed to load orders.')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [user, authLoading, navigate])

  // Still authenticating
  if (authLoading || (loading && user)) {
    return (
      <div className="container-main py-10">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="nm-skeleton h-24 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!user) return null  // redirect handled in useEffect

  return (
    <div className="container-main py-10">
      
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="btn btn-primary py-2 px-4 text-xs no-underline inline-flex items-center gap-2">
          <FaArrowLeft className="text-xs" /> Home
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900">My Orders</h1>
          <p className="text-zinc-500 text-xs mt-1">Order history for {user.name}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm mb-6 font-semibold">
          {error}
        </div>
      )}

      {orders.length === 0 && !error ? (
        <div className="shadow-soft p-12 text-center max-w-md mx-auto bg-primary rounded-3xl">
          <div className="w-16 h-16 rounded-2xl shadow-inset flex items-center justify-center mx-auto mb-6 text-zinc-400 border border-white/50 bg-primary">
            <FaBox className="text-xl" />
          </div>
          <h2 className="text-2xl font-black uppercase text-zinc-800 tracking-tight mb-2">No Orders Yet</h2>
          <p className="text-zinc-500 text-sm mb-8 font-semibold">
            You haven&apos;t placed any orders yet. Start shopping to see your order history here.
          </p>
          <Link to="/products" className="btn btn-secondary no-underline w-full justify-center py-3 text-xs">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}

    </div>
  )
}
