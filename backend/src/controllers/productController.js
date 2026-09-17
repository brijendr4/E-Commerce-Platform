import jwt from 'jsonwebtoken'
import Product from '../models/Product.js'
import { cache } from '../lib/redis.js'

// Escape special regex characters to prevent MongoDB regex injection
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// GET /api/products
export async function getProducts(req, res, next) {
  try {
    const { category, search, featured, admin } = req.query

    // Check if user is admin to decide if we show inactive products
    let showAll = false
    if (admin === 'true') {
      const header = req.headers.authorization
      if (header && header.startsWith('Bearer ')) {
        try {
          const token = header.split(' ')[1]
          const decoded = jwt.verify(token, process.env.JWT_SECRET)
          const User = (await import('../models/User.js')).default
          const user = await User.findById(decoded.userId)
          if (user && user.role === 'admin') {
            showAll = true
          }
        } catch (err) {
          // Token invalid, fall back to standard filtering
        }
      }
    }

    // Build a stable cache key including the admin bypass state
    const cacheKey = `products:cat:${category || 'all'}:search:${search || 'none'}:feat:${featured || 'all'}:admin:${showAll}`

    const cachedProducts = await cache.get(cacheKey)
    if (cachedProducts) {
      return res.json(cachedProducts)
    }

    const filter = {}
    
    // If not admin, only show active products
    if (!showAll) {
      filter.isActive = true
    }

    if (category && category !== 'all') {
      // Validate against allowed categories to prevent unexpected queries
      const allowed = ['shirts', 'jackets', 'pants', 'shoes', 'accessories']
      if (!allowed.includes(category)) {
        return res.status(400).json({ error: 'Invalid category.' })
      }
      filter.category = category
    }

    if (search) {
      // Escape user input to prevent MongoDB regex injection attack
      const safeSearch = escapeRegex(search.trim().slice(0, 100)) // max 100 chars
      filter.name = { $regex: safeSearch, $options: 'i' }
    }

    if (featured === 'true') {
      filter.featured = true
    }

    const products = await Product.find(filter).sort({ createdAt: -1 })

    // Cache for 10 minutes
    await cache.set(cacheKey, products, 600)

    res.json(products)
  } catch (err) {
    next(err)
  }
}

// GET /api/products/:id
export async function getProductById(req, res, next) {
  try {
    const cacheKey = `products:id:${req.params.id}`

    const cachedProduct = await cache.get(cacheKey)
    if (cachedProduct) {
      return res.json(cachedProduct)
    }

    const product = await Product.findById(req.params.id)
    if (!product || (!product.isActive && req.user?.role !== 'admin')) {
      return res.status(404).json({ error: 'Product not found.' })
    }

    // Cache single product for 1 hour
    await cache.set(cacheKey, product, 3600)

    res.json(product)
  } catch (err) {
    next(err)
  }
}

// POST /api/products — Admin only
export async function createProduct(req, res, next) {
  try {
    const { name, price, description, image, category, sizes, stock, featured } = req.body

    if (!name || !price || !description || !image || !category) {
      return res.status(400).json({ error: 'Name, price, description, image, and category are required.' })
    }

    const product = await Product.create({
      name: name.trim(),
      price,
      description: description.trim(),
      image: image.trim(),
      category,
      sizes: sizes || [],
      stock: stock !== undefined ? stock : 50,
      featured: !!featured,
      isActive: true
    })

    // Clear all products cache
    await cache.clearPattern('products:*')

    res.status(201).json(product)
  } catch (err) {
    next(err)
  }
}

// PUT /api/products/:id — Admin only
export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params
    const { name, price, description, image, category, sizes, stock, featured, isActive } = req.body

    const product = await Product.findById(id)
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' })
    }

    if (name) product.name = name.trim()
    if (price !== undefined) product.price = price
    if (description) product.description = description.trim()
    if (image) product.image = image.trim()
    if (category) product.category = category
    if (sizes) product.sizes = sizes
    if (stock !== undefined) product.stock = stock
    if (featured !== undefined) product.featured = !!featured
    if (isActive !== undefined) product.isActive = !!isActive

    await product.save()

    // Clear cache
    await cache.clearPattern('products:*')

    res.json(product)
  } catch (err) {
    next(err)
  }
}

// DELETE /api/products/:id — Admin only
export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params

    const product = await Product.findById(id)
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' })
    }

    // Soft delete if product has orders, else hard delete
    const Order = (await import('../models/Order.js')).default
    const hasOrders = await Order.findOne({ 'items.product': id })

    if (hasOrders) {
      product.isActive = false
      await product.save()
      res.json({ message: 'Product has orders. Successfully soft-deleted (deactivated).', product })
    } else {
      await Product.findByIdAndDelete(id)
      res.json({ message: 'Product successfully deleted from system.', product })
    }

    // Clear cache
    await cache.clearPattern('products:*')
  } catch (err) {
    next(err)
  }
}
