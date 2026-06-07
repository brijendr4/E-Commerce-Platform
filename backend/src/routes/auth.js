import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import {
  signup,
  login,
  me,
  updateProfile,
  requestPasswordResetOtp,
  verifyOtpAndChangePassword,
  forgotPassword,
  resetPassword,
  socialLogin,
  toggleWishlist,
  getWishlist
} from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
})

// ─── Public Routes ────────────────────────────────────────────────────────────
router.post('/signup', authLimiter, signup)
router.post('/login', authLimiter, login)
router.post('/social-login', authLimiter, socialLogin)
router.post('/forgot-password', authLimiter, forgotPassword)
router.post('/reset-password', authLimiter, resetPassword)

// ─── Protected Routes ─────────────────────────────────────────────────────────
router.get('/me', authenticate, me)
router.put('/profile', authenticate, updateProfile)
router.post('/profile/request-otp', authenticate, requestPasswordResetOtp)
router.post('/profile/change-password', authenticate, verifyOtpAndChangePassword)

// Wishlist
router.get('/wishlist', authenticate, getWishlist)
router.post('/wishlist/toggle', authenticate, toggleWishlist)

export default router
