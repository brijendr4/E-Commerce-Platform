/**
 * Global error handling middleware.
 * Must be registered LAST in Express (after all routes).
 * Catches any error forwarded via next(err).
 */
export function errorHandler(err, req, res, next) {
  // Log the error internally
  console.error(`[ERROR] ${req.method} ${req.originalUrl} —`, err.message)
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack)
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({ error: messages.join('. ') })
  }

  // Mongoose cast error (e.g. invalid ObjectId in URL)
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format.' })
  }

  // MongoDB duplicate key error (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field'
    return res.status(409).json({ error: `${field} already exists.` })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }

  // Default — 500 Internal Server Error
  const statusCode = err.statusCode || err.status || 500
  // In production, hide internal error details from clients
  const message = process.env.NODE_ENV === 'production'
    ? 'An internal server error occurred.'
    : err.message

  res.status(statusCode).json({ error: message })
}
