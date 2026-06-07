import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import helmet from 'helmet'

import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
import adminRoutes from './routes/admin.js'
import paymentRoutes from './routes/payments.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// ─── Security Middleware ──────────────────────────────────────────────────────
// Helmet sets secure HTTP response headers (XSS protection, HSTS, etc.)
app.use(helmet())

// CORS — read allowed origin from environment variable, never hardcode in production
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173'
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true)
    
    // In development, allow any localhost port
    if (process.env.NODE_ENV !== 'production' && /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true)
    }
    
    if (origin === allowedOrigin) {
      return callback(null, true)
    }
    
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// ─── General Middleware ───────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })) // Limit body size to prevent large payload attacks
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/payments', paymentRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV || 'development' })
})

// General 404 handler for any route not matched above
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found.' })
  }
  res.status(404).json({ error: 'Not found.' })
})

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler)

// ─── Connect to MongoDB and Start Server ─────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB')
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
      console.log(`🌐 Accepting requests from: ${allowedOrigin}`)
    })

    // Graceful shutdown on SIGTERM (e.g. from hosting providers like Render/Railway)
    process.on('SIGTERM', () => {
      console.log('⏳ SIGTERM received. Shutting down gracefully...')
      server.close(() => {
        mongoose.connection.close()
        console.log('✅ Server closed.')
        process.exit(0)
      })
    })
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message)
    console.error('\n👉 TIPS FOR SETUP:')
    console.error('1. Make sure MongoDB is installed and running locally on port 27017.')
    console.error('2. Alternatively, create a free MongoDB Atlas cluster at https://mongodb.com/atlas')
    console.error('3. Update MONGODB_URI in backend/.env with your connection string.\n')
    process.exit(1)
  })
