import { Router } from 'express'
import {
  getAdminStats,
  getAdminUsers,
  toggleBlockUser,
  updateUserRole,
  getAdminOrders,
  updateOrderStatus
} from '../controllers/adminController.js'
import { authenticate, adminOnly } from '../middleware/auth.js'

const router = Router()

// All routes here are protected and restricted to Admin accounts
router.use(authenticate, adminOnly)

// GET /api/admin/stats — dashboard overview numbers
router.get('/stats', getAdminStats)

// GET /api/admin/users — manage users list
router.get('/users', getAdminUsers)

// PUT /api/admin/users/:id/block — block/unblock a user
router.put('/users/:id/block', toggleBlockUser)

// PUT /api/admin/users/:id/role — change user role (user <-> admin)
router.put('/users/:id/role', updateUserRole)

// GET /api/admin/orders — view all orders in the system
router.get('/orders', getAdminOrders)

// PUT /api/admin/orders/:id/status — update order shipping state
router.put('/orders/:id/status', updateOrderStatus)

export default router
