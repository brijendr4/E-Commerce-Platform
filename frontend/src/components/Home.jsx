import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productsAPI } from '../lib/api'
import ProductCard from './ProductCard'
import CategoryBar from './CategoryBar'
import TrendsSlider from './TrendsSlider'
import { TESTIMONIALS, SERVICE_FEATURES } from '../data/constants'
import { FaArrowRight, FaQuoteLeft, FaStar, FaExclamationTriangle } from 'react-icons/fa'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const all = await productsAPI.getAll()
        setProducts(all)
      } catch (err) {
        console.error('Failed to load products:', err)
        setError('Unable to load products. Please check that the backend is running.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const featured = products.filter(p => p.featured)

  return (
    <div className="py-6 space-y-12">
      
      {/* 1. TRENDS SLIDER */}
      <section aria-label="Trending collections slider" className="container-main">
        <TrendsSlider />
      </section>

      {/* 2. HERO GRID */}
      <section aria-label="Featured hero" className="container-main">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Hero Card */}
          <div className="lg:col-span-2 shadow-soft p-8 md:p-12 rounded-3xl flex flex-col justify-between min-h-[380px] bg-primary">
            <div>
              <span className="badge badge-dark mb-4">Summer Collection</span>
              <h1 className="text-4xl sm:text-5xl font-black uppercase text-zinc-900 tracking-tight leading-none mb-6">
                ATHLETIC MOTION
                <br />
                <span className="text-zinc-500 font-normal">REDEFINED</span>
              </h1>
              <p className="text-zinc-500 text-sm max-w-md mb-8 leading-relaxed font-semibold">
                Explore lightweight structures, premium linen details, and selvedge layers built to mold uniquely to your daily active routine.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn btn-secondary px-6 py-3 no-underline text-xs flex items-center gap-2">
                Explore All <FaArrowRight className="text-[10px]" />
              </Link>
              <Link to="/products?featured=true" className="btn btn-primary px-6 py-3 no-underline text-xs">
                New Releases
              </Link>
            </div>
          </div>

          {/* Secondary Spotlight Card */}
          <div className="shadow-soft p-8 rounded-3xl flex flex-col justify-between min-h-[380px] bg-primary">
            <div>
              <span className="badge mb-4">Limited Edition</span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-900 leading-tight">
                THE RUNNER<br />SNEAKERS
              </h2>
              <p className="text-zinc-500 text-xs mt-3 leading-relaxed font-semibold">
                Sleek minimalist silhouettes with high-cushion response tech. Engineered for streets.
              </p>
            </div>

            {loading ? (
              <div className="nm-skeleton h-32 w-full mt-4" />
            ) : products.find(p => p.category === 'shoes') ? (
              <Link 
                to={`/product/${products.find(p => p.category === 'shoes')._id}`} 
                className="btn btn-primary text-xs justify-center no-underline mt-4"
              >
                View Sneaker Details
              </Link>
            ) : (
              <Link to="/products" className="btn btn-primary text-xs justify-center no-underline mt-4">
                Browse Footwear
              </Link>
            )}
          </div>

        </div>
      </section>

      {/* 3. CATEGORIES */}
      <section aria-label="Category filter" className="container-main">
        <CategoryBar />
      </section>

      {/* 4. DEALS BANNER */}
      <section aria-label="Weekly promotion" className="container-main">
        <div className="shadow-soft p-6 md:p-10 rounded-3xl flex flex-col lg:flex-row items-center gap-8 bg-primary">
          <div className="w-full lg:w-1/3">
            <div className="shadow-inset p-3 rounded-2xl bg-primary">
              <div className="rounded-xl overflow-hidden aspect-[4/5] bg-zinc-200 shadow-inner">
                <img 
                  src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop" 
                  alt="Leather Crossbody Bag — Promotion of the Week" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 text-center lg:text-left">
            <span className="badge badge-dark">Promotion of the Week</span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-zinc-900 tracking-tight leading-none">
              SAVE UP TO 30% ON ACCESSORIES
            </h2>
            <p className="text-zinc-500 text-xs sm:text-sm font-semibold max-w-xl leading-relaxed">
              Complete your look with handcrafted leather crossover bags. Discount automatically applied at checkout.
            </p>
            <div className="pt-2 flex justify-center lg:justify-start">
              <Link to="/products?category=accessories" className="btn btn-secondary px-6 py-3 no-underline text-xs flex items-center gap-2">
                Browse Accessories <FaArrowRight className="text-[10px]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS GRID */}
      <section aria-label="New arrivals" className="container-main">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900">New Arrivals</h2>
            <p className="text-zinc-500 text-xs mt-1">Premium materials meeting functional details</p>
          </div>
          <Link to="/products" className="text-xs font-bold text-zinc-800 uppercase tracking-wider no-underline flex items-center gap-1 hover:text-zinc-500 transition-colors">
            View All <FaArrowRight className="ml-1 text-[10px]" />
          </Link>
        </div>

        {/* Error state */}
        {error && (
          <div className="shadow-soft p-8 text-center max-w-md mx-auto bg-primary rounded-3xl mb-6">
            <div className="w-12 h-12 rounded-xl shadow-inset flex items-center justify-center mx-auto mb-4 text-red-400 border border-white/40 bg-primary">
              <FaExclamationTriangle className="text-base" />
            </div>
            <h3 className="text-base font-black uppercase text-zinc-800 mb-2">Unable to Load Products</h3>
            <p className="text-zinc-500 text-xs font-semibold">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="shadow-soft p-4 h-[380px] flex flex-col justify-between bg-primary">
                <div className="nm-skeleton h-56 w-full" />
                <div className="space-y-2 mt-4">
                  <div className="nm-skeleton h-4 w-3/4" />
                  <div className="nm-skeleton h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map(product => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 6. SERVICE FEATURES */}
      <section aria-label="Service features" className="container-main">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICE_FEATURES.map(f => {
            const Icon = f.icon
            return (
              <div key={f.title} className="shadow-soft p-5 text-center bg-primary">
                <div className="w-10 h-10 mx-auto rounded-xl shadow-inset flex items-center justify-center text-zinc-650 mb-3 border border-white/50 bg-primary">
                  <Icon className="text-sm" />
                </div>
                <h3 className="font-extrabold text-xs text-zinc-800 uppercase tracking-wider mb-1">{f.title}</h3>
                <p className="text-zinc-500 text-[10px] leading-relaxed font-semibold">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section aria-label="Customer testimonials" className="container-main py-4">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900">What Our Clients Say</h2>
          <p className="text-zinc-500 text-xs mt-1">Direct feedback from verified members</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="shadow-soft p-6 flex flex-col justify-between bg-primary">
              <div>
                <div className="flex gap-1.5 mb-3 text-amber-500" aria-label={`${t.rating} out of 5 stars`}>
                  {[...Array(t.rating)].map((_, i) => <FaStar key={i} className="text-xs" />)}
                </div>
                <FaQuoteLeft className="text-zinc-350 text-xl mb-2" />
                <p className="text-zinc-650 text-xs italic leading-relaxed font-semibold">
                  {t.quote}
                </p>
              </div>
              <div className="border-t border-zinc-300/40 mt-4 pt-3 flex items-center justify-between text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                <span>{t.author}</span>
                <span className="text-emerald-600">✓ Verified Buyer</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
