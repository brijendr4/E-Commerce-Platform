import React from 'react'
import { Link } from 'react-router-dom'
import { useCart, useCartDispatch } from '../context/CartContext'
import { FaTrash, FaPlus, FaMinus, FaShoppingBag, FaArrowRight, FaArrowLeft } from 'react-icons/fa'

export default function CartPage() {
  const { items, total } = useCart() || { items: {}, total: 0 }
  const dispatch = useCartDispatch()
  const entries = Object.entries(items || {})

  if (!entries.length) return (
    <div className="container-main py-16">
      <div className="shadow-soft p-12 text-center max-w-md mx-auto bg-primary">
        <div className="w-16 h-16 rounded-2xl shadow-inset flex items-center justify-center mx-auto mb-6 text-zinc-500 border border-white/50 bg-primary">
          <FaShoppingBag className="text-xl" />
        </div>
        <h2 className="text-2xl font-black uppercase text-zinc-800 tracking-tight mb-2">Your Cart is Empty</h2>
        <p className="text-zinc-500 text-sm mb-8 font-semibold">Browse our premium athletic menswear to fill your bag.</p>
        <Link to="/products" className="btn btn-secondary no-underline w-full justify-center text-xs py-3">
          Start Shopping
        </Link>
      </div>
    </div>
  )

  return (
    <div className="container-main py-10">
      <h1 className="text-3xl font-black uppercase text-zinc-900 tracking-tight mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {entries.map(([key, it]) => {
            const pid = it.product._id || it.product.id
            return (
              <div key={key} className="shadow-soft p-4 flex flex-col sm:flex-row items-center gap-5 bg-primary">
                
                {/* Product thumbnail image */}
                <Link to={`/product/${pid}`} className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden shadow-inset p-1 border border-white/40 bg-primary">
                  <img src={it.product.image} alt={it.product.name} className="w-full h-full object-cover rounded-lg" />
                </Link>
                
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-extrabold text-sm uppercase tracking-tight text-zinc-850">
                    <Link to={`/product/${pid}`} className="hover:text-zinc-500 no-underline text-inherit transition-colors">
                      {it.product.name}
                    </Link>
                  </h3>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-zinc-400 font-bold uppercase tracking-wider">
                    <span>Size: <span className="text-zinc-700">{it.size}</span></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                    <span>Price: <span className="text-zinc-700">${it.product.price.toFixed(2)}</span></span>
                  </div>
                </div>

                {/* Controls and prices */}
                <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end">
                  
                  {/* Quantity adjustments */}
                  <div className="flex items-center justify-between shadow-inset px-2 py-1 h-10 w-28 bg-primary">
                    <button 
                      onClick={() => dispatch({ type: 'SET_QTY', payload: { key, qty: Math.max(1, it.qty - 1) } })}
                      className="btn btn-icon-only btn-primary w-6 h-6 rounded-md flex items-center justify-center cursor-pointer"
                    >
                      <FaMinus className="text-[8px]" />
                    </button>
                    <span className="text-xs font-black text-zinc-850">{it.qty}</span>
                    <button 
                      onClick={() => dispatch({ type: 'SET_QTY', payload: { key, qty: it.qty + 1 } })}
                      className="btn btn-icon-only btn-primary w-6 h-6 rounded-md flex items-center justify-center cursor-pointer"
                    >
                      <FaPlus className="text-[8px]" />
                    </button>
                  </div>

                  {/* Calculations */}
                  <div className="text-right min-w-[80px]">
                    <div className="font-black text-zinc-900 text-sm">${(it.product.price * it.qty).toFixed(2)}</div>
                    
                    <button 
                      onClick={() => dispatch({ type: 'REMOVE', payload: { key } })} 
                      className="text-[10px] uppercase tracking-wider text-red-500 hover:text-red-650 bg-transparent border-none cursor-pointer mt-1.5 font-bold flex items-center gap-1 ml-auto"
                    >
                      <FaTrash className="text-[9px]" /> Remove
                    </button>
                  </div>

                </div>

              </div>
            )
          })}
        </div>

        {/* Right Side: Order summary calculator */}
        <div className="shadow-soft p-6 space-y-6 bg-primary">
          <h3 className="text-base font-black uppercase text-zinc-850 tracking-wider">Order Summary</h3>
          
          <div className="space-y-3 pb-6 border-b border-zinc-300/40 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-zinc-850 font-extrabold">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-emerald-600 font-extrabold">FREE</span>
            </div>
          </div>

          <div className="flex justify-between font-black text-zinc-900 text-base">
            <span>Total</span>
            <span className="text-lg">${total.toFixed(2)}</span>
          </div>

          <Link to="/checkout" className="btn btn-secondary w-full text-center justify-center no-underline py-3.5 text-xs">
            Proceed to Checkout <FaArrowRight className="ml-1.5 text-[10px]" />
          </Link>
          
          <div className="text-center">
            <Link to="/products" className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-600 no-underline flex items-center justify-center gap-1.5">
              <FaArrowLeft className="text-[9px]" /> Continue Shopping
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
