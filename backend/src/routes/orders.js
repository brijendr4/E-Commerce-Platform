import { Router } from 'express'
import { createOrder, getMyOrders } from '../controllers/orderController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// POST /api/orders — protected
router.post('/', authenticate, createOrder)

// GET /api/orders/me — protected
router.get('/me', authenticate, getMyOrders)

export default router
