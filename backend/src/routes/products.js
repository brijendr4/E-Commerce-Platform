import { Router } from 'express'
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js'
import { authenticate, adminOnly } from '../middleware/auth.js'

const router = Router()

// GET /api/products — public, with optional filters
router.get('/', getProducts)

// GET /api/products/:id — public
router.get('/:id', getProductById)

// POST /api/products — Admin only
router.post('/', authenticate, adminOnly, createProduct)

// PUT /api/products/:id — Admin only
router.put('/:id', authenticate, adminOnly, updateProduct)

// DELETE /api/products/:id — Admin only
router.delete('/:id', authenticate, adminOnly, deleteProduct)

export default router
