import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FaTwitter, FaInstagram, FaGithub, FaLinkedin, FaPaperPlane } from 'react-icons/fa'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubscribe(e) {
    e.preventDefault()
    if (!email.trim()) return

    setSubmitting(true)
    try {
      // TODO: Replace with real newsletter API endpoint (e.g. Mailchimp, ConvertKit)
      // await fetch('/api/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email }) })
      await new Promise(r => setTimeout(r, 600)) // Simulated delay
      toast.success('You\'re subscribed! Welcome to Fashion & Freedom.')
      setEmail('')
    } catch {
      toast.error('Subscription failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <footer className="border-t border-light bg-primary pb-8 pt-12 mt-16 relative z-10">
      <div className="container-main">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Info and Socials */}
          <div className="space-y-4">
            <h5 className="font-extrabold uppercase text-xs tracking-wider text-zinc-800">Fashion & Freedom</h5>
            <p className="text-zinc-500 text-xs leading-relaxed font-semibold">
              Premium menswear designed with high utility features, breathable fabrics, and classic cuts built for modern active motion.
            </p>
            
            <ul className="flex items-center gap-3 list-none p-0 m-0 pt-2">
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="btn btn-icon-only btn-pill btn-primary" aria-label="Twitter">
                  <FaTwitter className="text-xs text-zinc-500" />
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="btn btn-icon-only btn-pill btn-primary" aria-label="Instagram">
                  <FaInstagram className="text-xs text-zinc-500" />
                </a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn btn-icon-only btn-pill btn-primary" aria-label="GitHub">
                  <FaGithub className="text-xs text-zinc-500" />
                </a>
              </li>
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="btn btn-icon-only btn-pill btn-primary" aria-label="LinkedIn">
                  <FaLinkedin className="text-xs text-zinc-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Collections */}
          <div>
            <h5 className="font-extrabold uppercase text-xs tracking-wider text-zinc-800 mb-4">Collections</h5>
            <ul className="space-y-2.5 text-xs text-zinc-500 list-none p-0 m-0 font-bold uppercase tracking-wider">
              <li><Link to="/products" className="hover:text-zinc-900 transition-colors no-underline text-inherit">All Collections</Link></li>
              <li><Link to="/products?category=shirts" className="hover:text-zinc-900 transition-colors no-underline text-inherit">Linen Shirts</Link></li>
              <li><Link to="/products?category=jackets" className="hover:text-zinc-900 transition-colors no-underline text-inherit">Denim Jackets</Link></li>
              <li><Link to="/products?category=pants" className="hover:text-zinc-900 transition-colors no-underline text-inherit">Chino Pants</Link></li>
              <li><Link to="/products?category=shoes" className="hover:text-zinc-900 transition-colors no-underline text-inherit">Sneakers</Link></li>
              <li><Link to="/products?category=accessories" className="hover:text-zinc-900 transition-colors no-underline text-inherit">Accessories</Link></li>
            </ul>
          </div>

          {/* Column 3: Company Info */}
          <div>
            <h5 className="font-extrabold uppercase text-xs tracking-wider text-zinc-800 mb-4">Company</h5>
            <ul className="space-y-2.5 text-xs text-zinc-500 list-none p-0 m-0 font-bold uppercase tracking-wider">
              <li><a href="#" className="hover:text-zinc-900 transition-colors no-underline text-inherit">Our Story</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors no-underline text-inherit">Shipping Policies</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors no-underline text-inherit">Returns Center</a></li>
              <li><Link to="/orders" className="hover:text-zinc-900 transition-colors no-underline text-inherit">Track My Order</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-3">
            <h5 className="font-extrabold uppercase text-xs tracking-wider text-zinc-800">Subscribe</h5>
            <p className="text-zinc-500 text-xs leading-relaxed font-semibold">
              Join our mailing list for exclusive drops and early access.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <label htmlFor="footer-email" className="sr-only">Email address for newsletter</label>
              <input 
                id="footer-email"
                required 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="form-control" 
                placeholder="example@company.com" 
                disabled={submitting}
              />
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full text-xs font-black uppercase py-2.5 flex items-center justify-center gap-2"
              >
                <FaPaperPlane className="text-[10px]" />
                {submitting ? 'Subscribing...' : 'Subscribe Now'}
              </button>
            </form>
          </div>

        </div>

        <hr className="border-t border-zinc-300 my-8" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-zinc-400 font-black uppercase tracking-wider">
          <p>© {new Date().getFullYear()} Fashion & Freedom. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-zinc-650 transition-colors no-underline text-inherit">Terms</a>
            <a href="#" className="hover:text-zinc-650 transition-colors no-underline text-inherit">Privacy</a>
            <a href="#" className="hover:text-zinc-650 transition-colors no-underline text-inherit">Cookies</a>
          </div>
        </div>

      </div>
    </footer>
  )
}
