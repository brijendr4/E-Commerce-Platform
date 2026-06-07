import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productsAPI } from '../lib/api'
import ProductCard from './ProductCard'
import CategoryBar from './CategoryBar'
import { FaSearch } from 'react-icons/fa'

export default function ProductsPage() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const featured = searchParams.get('featured') || ''

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        setError(null)
        const params = {}
        if (category) params.category = category
        if (search) params.search = search
        if (featured) params.featured = featured

        const data = await productsAPI.getAll(params)
        setProducts(data)
      } catch (err) {
        setError(err.message || 'Failed to load products.')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [category, search, featured])

  let pageTitle = 'All Collections'
  if (category) {
    pageTitle = `${category}`
  } else if (search) {
    pageTitle = `Search: "${search}"`
  } else if (featured) {
    pageTitle = 'Featured Releases'
  }

  return (
    <div className="container-main py-10">
      
      {/* Category selector */}
      <div className="mb-10">
        <CategoryBar />
      </div>

      {/* Grid Headers */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-8 border-b border-zinc-300/40 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900">{pageTitle}</h1>
          <p className="text-zinc-500 text-xs mt-1">Showing {products.length} premium menswear releases</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm mb-6 max-w-xl font-semibold">
          {error}
        </div>
      )}

      {/* Product list */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="shadow-soft p-4 h-[380px] flex flex-col justify-between bg-primary">
                <div className="nm-skeleton h-56 w-full" />
                <div className="space-y-2 mt-4">
                  <div className="nm-skeleton h-4 w-3/4" />
                  <div className="nm-skeleton h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="shadow-soft p-12 text-center max-w-md mx-auto bg-primary">
            <div className="w-12 h-12 rounded-xl shadow-inset flex items-center justify-center mx-auto mb-4 text-zinc-400 border border-white/40 bg-primary">
              <FaSearch className="text-base" />
            </div>
            <h3 className="text-xl font-black uppercase text-zinc-800 mb-2">No Releases Found</h3>
            <p className="text-zinc-500 text-sm leading-relaxed font-medium">
              We couldn't find any releases matching your active search filters. Try selecting a different category or clearing search strings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
