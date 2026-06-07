import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FaThLarge, FaTshirt, FaShoePrints, FaGlasses, FaTree, FaRunning } from 'react-icons/fa'

// Semantically correct icon choices for each category
const categories = [
  { id: 'all',         name: 'All Products', icon: FaThLarge },
  { id: 'shirts',      name: 'Shirts',       icon: FaTshirt },
  { id: 'jackets',     name: 'Jackets',      icon: FaTree },       // closest to outerwear
  { id: 'pants',       name: 'Pants',        icon: FaRunning },
  { id: 'shoes',       name: 'Shoes',        icon: FaShoePrints },  // correct shoe icon
  { id: 'accessories', name: 'Accessories',  icon: FaGlasses }
]

export default function CategoryBar() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const currentCategory = searchParams.get('category') || 'all'

  function select(catId) {
    if (catId === 'all') {
      navigate('/products')
    } else {
      navigate(`/products?category=${catId}`)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-800">Shop by Category</h2>
        <p className="text-zinc-500 text-xs mt-1">Select a category to view premium menswear</p>
      </div>

      <div
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
        role="navigation"
        aria-label="Product categories"
      >
        {categories.map(cat => {
          const Icon = cat.icon
          const active = currentCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => select(cat.id)}
              aria-pressed={active}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap cursor-pointer border border-white/50 ${
                active
                  ? 'shadow-inset text-zinc-900 font-extrabold border-zinc-300 bg-primary'
                  : 'shadow-soft text-zinc-500 hover:text-zinc-950 bg-primary'
              }`}
            >
              <Icon className={`text-base ${active ? 'text-zinc-800' : 'text-zinc-400'}`} />
              <span>{cat.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
