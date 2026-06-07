import { Router } from 'express'
import { handlePaymentProcess } from '../controllers/paymentController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// POST /api/payments/process — protected route
router.post('/process', authenticate, handlePaymentProcess)

export default router
