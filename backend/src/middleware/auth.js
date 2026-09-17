import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function authenticate(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' })
  }

  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    const user = await User.findById(decoded.userId)
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' })
    }
    
    if (user.isBlocked) {
      return res.status(403).json({ error: 'Your account has been blocked. Please contact support.' })
    }

    req.userId = decoded.userId
    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }
}

export function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' })
  }
  next()
}
