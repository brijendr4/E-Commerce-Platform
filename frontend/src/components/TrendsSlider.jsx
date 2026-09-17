import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaChevronLeft, FaChevronRight, FaArrowRight } from 'react-icons/fa'

const slides = [
  {
    id: 's1',
    title: 'SUMMER ESSENTIALS',
    tagline: 'BREATHABLE LINEN SHIRTS',
    description: 'Elevate your warm-weather wardrobe with relaxed fits designed for maximum airflow and effortless styling.',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop',
    link: '/products?category=shirts'
  },
  {
    id: 's2',
    title: 'URBAN RUNNER',
    tagline: 'ATHLETIC STREET MOTION',
    description: 'High-cushion sneakers and tapered joggers built for active urban transit and training.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
    link: '/products?category=shoes'
  },
  {
    id: 's3',
    title: 'SELVEDGE CLASSICS',
    tagline: 'PREMIUM DENIM LAYERS',
    description: 'Timeless indigo jackets and heavy utility shirts crafted to mold uniquely to your daily wear.',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop',
    link: '/products?category=jackets'
  }
]

export default function TrendsSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  function prev() {
    setCurrent(c => (c - 1 + slides.length) % slides.length)
  }

  function next() {
    setCurrent(c => (c + 1) % slides.length)
  }

  return (
    <div className="shadow-soft p-4 md:p-6 rounded-3xl relative overflow-hidden bg-primary border border-white/50">
      
      {/* Slides Viewport */}
      <div className="relative h-[480px] sm:h-[460px] md:h-[440px] w-full flex items-center">
        {slides.map((slide, index) => {
          const active = index === current
          return (
            <div 
              key={slide.id}
              className={`absolute inset-0 flex flex-col-reverse lg:flex-row items-center gap-6 md:gap-10 transition-all duration-700 ease-in-out ${
                active 
                  ? 'opacity-100 translate-x-0 pointer-events-auto' 
                  : 'opacity-0 translate-x-12 pointer-events-none'
              }`}
            >
              
              {/* Slide content */}
              <div className="flex-1 text-center lg:text-left z-10 px-2 sm:px-6 lg:pl-20 lg:pr-6">
                <span className="badge badge-dark mb-4 font-bold">Trending Now</span>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-zinc-900 tracking-tight leading-none mt-2">
                  {slide.title}
                  <br />
                  <span className="text-zinc-500 font-normal text-xl sm:text-2xl tracking-normal">{slide.tagline}</span>
                </h2>
                
                <p className="text-zinc-500 text-xs sm:text-sm max-w-md mx-auto lg:mx-0 mt-4 leading-relaxed font-semibold">
                  {slide.description}
                </p>

                <div className="mt-6 flex justify-center lg:justify-start">
                  <Link to={slide.link} className="btn btn-secondary px-6 py-3 no-underline flex items-center gap-2 text-xs">
                    Shop Trend <FaArrowRight className="text-[10px]" />
                  </Link>
                </div>
              </div>

              {/* Slide image */}
              <div className="flex-1 w-full h-[180px] sm:h-[240px] lg:h-full relative px-2 sm:px-6 lg:pl-6 lg:pr-20">
                <div className="shadow-inset p-3 rounded-2xl w-full h-full bg-primary">
                  <div className="rounded-xl overflow-hidden w-full h-full bg-zinc-200">
                    <img 
                      src={slide.image} 
                      alt={slide.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
              </div>

            </div>
          )
        })}
      </div>

      {/* Slide Arrow Navigation */}
      <button 
        onClick={prev}
        className="absolute left-6 bottom-6 lg:bottom-1/2 lg:translate-y-1/2 btn btn-icon-only btn-pill btn-primary z-20"
        aria-label="Previous slide"
      >
        <FaChevronLeft className="text-xs text-zinc-500" />
      </button>

      <button 
        onClick={next}
        className="absolute right-6 bottom-6 lg:bottom-1/2 lg:translate-y-1/2 btn btn-icon-only btn-pill btn-primary z-20"
        aria-label="Next slide"
      >
        <FaChevronRight className="text-xs text-zinc-500" />
      </button>

      {/* Slide Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 border border-white/50 cursor-pointer ${
              index === current 
                ? 'shadow-inset bg-zinc-700 w-6' 
                : 'shadow-soft bg-zinc-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

    </div>
  )
}
