import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from './models/Product.js'
import User from './models/User.js'
import { cache } from './lib/redis.js'

dotenv.config()

const products = [
  {
    name: 'Liberty Linen Shirt',
    price: 49.99,
    description: 'Lightweight linen shirt for everyday freedom and style. Breathable fabric with a relaxed fit perfect for warm weather.',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop',
    category: 'shirts',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 45,
    featured: true,
    rating: 4.7
  },
  {
    name: 'Freedom Denim Jacket',
    price: 119.99,
    description: 'Classic denim jacket with a modern fit. Crafted from premium selvedge denim with antique brass buttons.',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop',
    category: 'jackets',
    sizes: ['M', 'L', 'XL'],
    stock: 30,
    featured: true,
    rating: 4.8
  },
  {
    name: 'Roam Chino Pants',
    price: 69.99,
    description: 'Comfortable chinos for daily exploration. Stretch fabric with a tailored slim fit.',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
    category: 'pants',
    sizes: ['30', '32', '34', '36'],
    stock: 60,
    featured: false,
    rating: 4.5
  },
  {
    name: 'Urban Runner Sneakers',
    price: 89.99,
    description: 'Sleek minimalist sneakers with cloud-like cushioning. Designed for all-day comfort on city streets.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
    category: 'shoes',
    sizes: ['8', '9', '10', '11', '12'],
    stock: 40,
    featured: true,
    rating: 4.9
  },
  {
    name: 'Classic Oxford Shirt',
    price: 59.99,
    description: 'Timeless button-down oxford in premium cotton. The essential shirt every wardrobe needs.',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop',
    category: 'shirts',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 55,
    featured: false,
    rating: 4.6
  },
  {
    name: 'Leather Crossbody Bag',
    price: 79.99,
    description: 'Handcrafted leather crossbody bag with adjustable strap. Perfectly sized for daily essentials.',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
    category: 'accessories',
    sizes: ['One Size'],
    stock: 25,
    featured: true,
    rating: 4.7
  },
  {
    name: 'Bomber Jacket',
    price: 139.99,
    description: 'Modern bomber jacket in water-resistant nylon. Ribbed cuffs and hem with satin lining.',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop',
    category: 'jackets',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 20,
    featured: false,
    rating: 4.4
  },
  {
    name: 'Slim Fit Joggers',
    price: 54.99,
    description: 'Athletic joggers that transition from gym to street. Tapered fit with zippered pockets.',
    image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?q=80&w=800&auto=format&fit=crop',
    category: 'pants',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 70,
    featured: true,
    rating: 4.6
  }
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log(' Connected to MongoDB')

    await Product.deleteMany({})
    console.log('  Cleared existing products')

    await Product.insertMany(products)
    console.log(` Seeded ${products.length} products`)

    await User.deleteMany({})
    console.log('  Cleared existing users')

    await User.create({
      name: 'Admin User',
      email: 'baghelbrijendra7@gmail.com',
      password: 'brijendra7',
      role: 'admin'
    })
    console.log('🌱 Seeded 1 Admin User (baghelbrijendra7@gmail.com / brijendra7)')

    // Clear redis cache
    try {
      await cache.clearPattern('products:*')
      console.log(' Cleared Redis products cache')
    } catch (cErr) {
      console.log(' Redis cache clear skipped:', cErr.message)
    }

    await mongoose.disconnect()
    console.log(' Done. Disconnected.')
    process.exit(0)
  } catch (err) {
    console.error(' Seed error:', err.message)
    console.error('\n TIPS FOR SETUP:')
    console.error('1. Make sure MongoDB is installed and running locally on port 27017.')
    console.error('2. Alternatively, create a free MongoDB Atlas cluster at https://mongodb.com/atlas')
    console.error('3. Update MONGODB_URI in backend/.env with your connection string.\n')
    process.exit(1)
  }
}

seed()
