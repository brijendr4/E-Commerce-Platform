import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart, useCartDispatch } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { ordersAPI, paymentsAPI } from '../lib/api'
import toast from 'react-hot-toast'
import {
  FaCheckCircle,
  FaLock,
  FaShoppingBag,
  FaShoppingBasket,
  FaArrowLeft,
  FaCreditCard,
  FaMoneyBillWave,
  FaInfoCircle
} from 'react-icons/fa'

export default function Checkout() {
  const { items, total } = useCart() || { items: {}, total: 0 }
  const dispatch = useCartDispatch()
  const { user } = useAuth()
  
  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    address: '',
    phone: '',
    city: ''
  })

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('cod') // 'cod' | 'card'
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    cardToken: '' // left blank by default, if set to 'fail' or card starts with 'fail', payment fails
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [order, setOrder] = useState(null)

  async function submit(e) {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to place an order.')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      let transactionId = null

      // If credit card selected, run payment simulation first
      if (paymentMethod === 'card') {
        const tokenToUse = cardForm.cardToken.trim() || cardForm.cardNumber.trim()
        if (!tokenToUse) {
          throw new Error('Please enter card details to proceed.')
        }

        toast.loading('Processing payment...', { id: 'payment-toast' })
        const payRes = await paymentsAPI.process(total, tokenToUse)
        transactionId = payRes.transactionId
        toast.success('Payment authorized!', { id: 'payment-toast' })
      }

      const orderItems = Object.values(items).map(it => ({
        product: it.product._id || it.product.id,
        name: it.product.name,
        price: it.product.price,
        size: it.size,
        qty: it.qty
      }))

      const payload = {
        items: orderItems,
        total,
        shippingAddress: form,
        paymentMethod,
        transactionId
      }

      const res = await ordersAPI.create(payload)
      setOrder(res)
      dispatch({ type: 'CLEAR' })
      toast.success('Order placed successfully!')
    } catch (err) {
      setError(err.message || 'Failed to complete order. Please try again.')
      toast.error(err.message || 'Transaction failed.', { id: 'payment-toast' })
    } finally {
      setLoading(false)
    }
  }

  if (order) return (
    <div className="container-main py-16">
      <div className="shadow-soft p-12 text-center max-w-md mx-auto bg-primary">
        <div className="w-16 h-16 rounded-2xl shadow-inset flex items-center justify-center mx-auto mb-6 text-emerald-600 border border-white/50 bg-primary">
          <FaCheckCircle className="text-2xl" />
        </div>
        <h1 className="text-3xl font-black uppercase text-zinc-950 mb-2">Order Confirmed</h1>
        <p className="text-zinc-500 text-sm mb-6 font-semibold">Thank you! Your order has been placed successfully.</p>
        
        <div className="shadow-inset p-4 mb-3 bg-primary rounded-xl text-left space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-bold text-zinc-400">Order ID:</span>
            <span className="font-mono font-bold text-zinc-700 break-all">{order._id}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-bold text-zinc-400">Payment:</span>
            <span className="font-bold text-zinc-800 uppercase">{order.paymentMethod === 'card' ? 'Credit Card (Paid)' : 'Cash on Delivery'}</span>
          </div>
          {order.transactionId && (
            <div className="flex justify-between text-xs">
              <span className="font-bold text-zinc-400">Transaction Ref:</span>
              <span className="font-mono font-bold text-zinc-650">{order.transactionId}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <Link to="/orders" className="btn btn-secondary no-underline w-full justify-center py-3 text-xs">
            View My Orders
          </Link>
          <Link to="/" className="btn btn-primary no-underline w-full justify-center py-3 text-xs">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )

  if (!user) return (
    <div className="container-main py-16">
      <div className="shadow-soft p-12 text-center max-w-md mx-auto bg-primary">
        <div className="w-16 h-16 rounded-2xl shadow-inset flex items-center justify-center mx-auto mb-6 text-zinc-500 border border-white/50 bg-primary">
          <FaLock className="text-xl" />
        </div>
        <h1 className="text-2xl font-black uppercase text-zinc-850 mb-2">Account Required</h1>
        <p className="text-zinc-500 text-sm mb-8 font-semibold">Please sign in or create an account to finalize your order.</p>
        <div className="flex flex-col gap-3">
          <Link to="/login?redirect=checkout" className="btn btn-secondary no-underline w-full justify-center text-xs py-3">Sign In</Link>
          <Link to="/signup?redirect=checkout" className="btn btn-primary no-underline w-full justify-center text-xs py-3">Create Account</Link>
        </div>
      </div>
    </div>
  )

  if (!Object.keys(items || {}).length) return (
    <div className="container-main py-16 text-center">
      <div className="shadow-soft p-8 max-w-md mx-auto bg-primary">
        <div className="w-12 h-12 rounded-xl shadow-inset flex items-center justify-center mx-auto mb-4 text-zinc-400 border border-white/40 bg-primary">
          <FaShoppingBasket className="text-base" />
        </div>
        <h1 className="text-xl font-black uppercase tracking-tight text-zinc-800 mb-4">Your Cart is Empty</h1>
        <Link to="/" className="btn btn-secondary no-underline">Start Shopping</Link>
      </div>
    </div>
  )

  return (
    <div className="container-main py-10">
      <h1 className="text-3xl font-black uppercase text-zinc-900 tracking-tight mb-8">Checkout</h1>
      
      {error && (
        <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm mb-6 max-w-5xl mx-auto font-semibold">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Shipping & Payment Method */}
        <div className="space-y-8">
          
          {/* Shipping form */}
          <div className="shadow-soft p-6 space-y-4 bg-primary rounded-2xl border border-white/50">
            <h2 className="text-lg font-black uppercase text-zinc-800 tracking-wider mb-2">Shipping Information</h2>
            
            <div>
              <label htmlFor="checkout-fullname" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Full Name</label>
              <input 
                id="checkout-fullname"
                required 
                value={form.fullName} 
                onChange={e => setForm({ ...form, fullName: e.target.value })} 
                className="form-control" 
                placeholder="John Doe"
                autoComplete="name"
              />
            </div>
            
            <div>
              <label htmlFor="checkout-email" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Email Address</label>
              <input 
                id="checkout-email"
                required 
                type="email"
                value={form.email} 
                onChange={e => setForm({ ...form, email: e.target.value })} 
                className="form-control" 
                placeholder="john@example.com"
                autoComplete="email"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="checkout-phone" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Phone Number</label>
                <input 
                  id="checkout-phone"
                  required
                  type="tel"
                  value={form.phone} 
                  onChange={e => setForm({ ...form, phone: e.target.value })} 
                  className="form-control" 
                  placeholder="+1 (555) 000-0000"
                  autoComplete="tel"
                />
              </div>
              <div>
                <label htmlFor="checkout-city" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">City</label>
                <input 
                  id="checkout-city"
                  required
                  value={form.city} 
                  onChange={e => setForm({ ...form, city: e.target.value })} 
                  className="form-control" 
                  placeholder="New York"
                  autoComplete="address-level2"
                />
              </div>
            </div>

            <div>
              <label htmlFor="checkout-address" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Shipping Address</label>
              <textarea 
                id="checkout-address"
                required 
                value={form.address} 
                onChange={e => setForm({ ...form, address: e.target.value })} 
                className="form-control h-20 resize-none" 
                placeholder="123 Main St, Apt 4B"
                autoComplete="street-address"
              />
            </div>
          </div>

          {/* Payment method selector */}
          <div className="shadow-soft p-6 space-y-4 bg-primary rounded-2xl border border-white/50">
            <h2 className="text-lg font-black uppercase text-zinc-800 tracking-wider mb-2">Payment Method</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`btn py-4 flex-col gap-2 tracking-wider ${paymentMethod === 'cod' ? 'btn-secondary' : 'btn-primary'}`}
              >
                <FaMoneyBillWave className="text-lg" />
                <span className="text-[10px] uppercase font-black">Cash on Delivery</span>
              </button>
              
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`btn py-4 flex-col gap-2 tracking-wider ${paymentMethod === 'card' ? 'btn-secondary' : 'btn-primary'}`}
              >
                <FaCreditCard className="text-lg" />
                <span className="text-[10px] uppercase font-black">Credit/Debit Card</span>
              </button>
            </div>

            {/* Credit Card Details simulation */}
            {paymentMethod === 'card' && (
              <div className="space-y-4 pt-2 border-t border-zinc-300/40 animate-fade-in">
                
                <div className="bg-zinc-350/10 border border-zinc-300/40 p-4 rounded-xl text-[11px] text-zinc-550 leading-relaxed font-semibold flex items-start gap-2">
                  <FaInfoCircle className="text-zinc-650 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Interactive Payment Simulation:</strong> You can enter any credit card details to succeed. To test credit card declines, input <strong>fail</strong> into the Card Number or Card Token field.
                  </div>
                </div>

                <div>
                  <label htmlFor="card-number" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Card Number</label>
                  <input
                    id="card-number"
                    required={paymentMethod === 'card'}
                    type="text"
                    value={cardForm.cardNumber}
                    onChange={e => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                    className="form-control font-mono"
                    placeholder="4000 1234 5678 9010"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="card-expiry" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Expiration</label>
                    <input
                      id="card-expiry"
                      required={paymentMethod === 'card'}
                      type="text"
                      maxLength={5}
                      value={cardForm.expiry}
                      onChange={e => setCardForm({ ...cardForm, expiry: e.target.value })}
                      className="form-control text-center font-mono"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label htmlFor="card-cvc" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">CVC Code</label>
                    <input
                      id="card-cvc"
                      required={paymentMethod === 'card'}
                      type="text"
                      maxLength={4}
                      value={cardForm.cvc}
                      onChange={e => setCardForm({ ...cardForm, cvc: e.target.value })}
                      className="form-control text-center font-mono"
                      placeholder="123"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="card-token" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Custom Card Token (Optional Override)</label>
                  <input
                    id="card-token"
                    type="text"
                    value={cardForm.cardToken}
                    onChange={e => setCardForm({ ...cardForm, cardToken: e.target.value })}
                    className="form-control"
                    placeholder="Enter 'fail' here to test decline"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order summary review */}
        <div className="shadow-soft p-6 space-y-4 bg-primary rounded-2xl border border-white/50">
          <h2 className="text-lg font-black uppercase text-zinc-800 tracking-wider mb-2">Order Review</h2>
          
          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 divide-y divide-zinc-300/40 scrollbar-none">
            {Object.values(items || {}).map((it, idx) => (
              <div key={(it.product._id || it.product.id) + it.size} className={`flex gap-4 ${idx > 0 ? 'pt-4' : ''}`}>
                <div className="w-16 h-16 rounded-xl shadow-inset p-1 border border-white/40 flex-shrink-0 bg-primary">
                  <img src={it.product.image} alt={it.product.name} className="w-full h-full object-cover rounded-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-zinc-850 text-sm uppercase tracking-tight truncate">{it.product.name}</h4>
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Qty: {it.qty} • Size: {it.size || '—'}</div>
                </div>
                <div className="text-right font-black text-sm text-zinc-900">
                  ${(it.product.price * it.qty).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-300/40 pt-4 mt-4 space-y-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-zinc-800 font-extrabold">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-emerald-600 font-extrabold">FREE</span>
            </div>
            <div className="flex justify-between font-black text-zinc-900 text-base pt-3 border-t border-zinc-300/40">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-secondary w-full py-3.5 mt-4 text-xs font-black tracking-wider justify-center"
          >
            <FaShoppingBag className="text-xs mr-2" />
            {loading ? 'Processing...' : `Place Order • $${total.toFixed(2)}`}
          </button>

          <div className="text-center pt-2">
            <Link to="/cart" className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-600 no-underline flex items-center justify-center gap-1.5">
              <FaArrowLeft className="text-[10px]" /> Modify Cart
            </Link>
          </div>
        </div>

      </form>
    </div>
  )
}
