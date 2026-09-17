import { FaTruck, FaSyncAlt, FaShieldAlt, FaAward } from 'react-icons/fa'

// Testimonials — move to DB/CMS when review system is implemented
export const TESTIMONIALS = [
  {
    quote: 'The Liberty Linen shirts are incredibly light and comfortable. Easily my favorite release of the year.',
    author: 'Alex M.',
    rating: 5
  },
  {
    quote: 'Excellent customer service. The return process on joggers was completely smooth and fast.',
    author: 'Markus D.',
    rating: 5
  },
  {
    quote: 'Selvedge Denim Jacket fits perfectly. Antique details and heavy brass buttons are top notch.',
    author: 'Steven K.',
    rating: 4
  }
]

// Service features — displayed on the homepage
export const SERVICE_FEATURES = [
  { icon: FaTruck,    title: 'Free Shipping',   desc: 'On orders over $50' },
  { icon: FaSyncAlt,  title: 'Easy Returns',    desc: '30-day return policy' },
  { icon: FaShieldAlt, title: 'Secure Checkout', desc: 'SSL payment protection' },
  { icon: FaAward,    title: 'Premium Fiber',   desc: 'Strict quality materials' }
]

// Allowed product categories (keep in sync with backend model enum)
export const CATEGORIES = ['shirts', 'jackets', 'pants', 'shoes', 'accessories']

// JWT token localStorage key
export const TOKEN_KEY = 'ff_token'

// Cart localStorage key
export const CART_KEY = 'ff_cart'
