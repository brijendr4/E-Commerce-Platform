import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { generateOtp, sendOtpEmail } from '../services/otpService.js'

function signToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' })
    }
    if (name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters.' })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' })
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() })
    if (exists) {
      return res.status(409).json({ error: 'Email already registered.' })
    }

    const user = await User.create({ name: name.trim(), email, password, authProvider: 'local' })
    const token = signToken(user._id)
    res.status(201).json({ token, user })
  } catch (err) {
    next(err)
  }
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
export async function login(req, res, next) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: 'Your account has been blocked. Please contact support.' })
    }

    if (user.authProvider !== 'local') {
      return res.status(400).json({ error: `This account was created with ${user.authProvider}. Please use social login.` })
    }

    const valid = await user.comparePassword(password)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const token = signToken(user._id)
    res.json({ token, user })
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
export async function me(req, res, next) {
  try {
    const user = await User.findById(req.userId).populate('wishlist', '_id name price image category rating')
    if (!user) return res.status(404).json({ error: 'User not found.' })
    if (user.isBlocked) {
      return res.status(403).json({ error: 'Your account has been blocked.' })
    }
    res.json({ user })
  } catch (err) {
    next(err)
  }
}

// ─── PUT /api/auth/profile ────────────────────────────────────────────────────
export async function updateProfile(req, res, next) {
  try {
    const { name, email, profilePic } = req.body

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' })
    }
    if (name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters.' })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' })
    }

    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ error: 'User not found.' })

    const normalizedEmail = email.toLowerCase().trim()
    if (normalizedEmail !== user.email) {
      const emailExists = await User.findOne({ email: normalizedEmail })
      if (emailExists) {
        return res.status(409).json({ error: 'Email address is already in use.' })
      }
      user.email = normalizedEmail
    }

    user.name = name.trim()
    if (profilePic !== undefined) user.profilePic = profilePic

    await user.save()
    res.json({ message: 'Profile updated successfully.', user })
  } catch (err) {
    next(err)
  }
}

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required.' })

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    // Always return success to prevent user enumeration attacks
    if (!user || user.authProvider !== 'local') {
      return res.json({ message: 'If that email exists, an OTP has been sent.' })
    }

    const otp = generateOtp()
    user.passwordResetOtp = otp
    user.passwordResetOtpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    await user.save()

    await sendOtpEmail(user.email, otp)

    res.json({ message: 'If that email exists, an OTP has been sent.' })
  } catch (err) {
    next(err)
  }
}

// ─── POST /api/auth/reset-password ───────────────────────────────────────────
export async function resetPassword(req, res, next) {
  try {
    const { email, otp, newPassword } = req.body
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required.' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) return res.status(400).json({ error: 'Invalid OTP or email.' })

    if (!user.passwordResetOtp || user.passwordResetOtp !== otp.trim()) {
      return res.status(400).json({ error: 'Invalid OTP code.' })
    }
    if (user.passwordResetOtpExpires < new Date()) {
      return res.status(400).json({ error: 'OTP code has expired. Please request a new one.' })
    }

    user.password = newPassword
    user.passwordResetOtp = null
    user.passwordResetOtpExpires = null
    await user.save()

    res.json({ message: 'Password reset successfully. You can now log in with your new password.' })
  } catch (err) {
    next(err)
  }
}

// ─── POST /api/auth/social-login ─────────────────────────────────────────────
export async function socialLogin(req, res, next) {
  try {
    const { name, email, socialId, authProvider, profilePic } = req.body

    if (!email || !authProvider || !socialId) {
      return res.status(400).json({ error: 'Email, authProvider, and socialId are required.' })
    }
    if (!['google', 'facebook'].includes(authProvider)) {
      return res.status(400).json({ error: 'Invalid auth provider.' })
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() })

    if (user) {
      // Existing user: update their social details and profile pic if needed
      if (user.isBlocked) {
        return res.status(403).json({ error: 'Your account has been blocked. Please contact support.' })
      }
      if (user.authProvider === 'local') {
        // Link social to existing local account
        user.authProvider = authProvider
        user.socialId = socialId
      }
      if (profilePic && !user.profilePic) user.profilePic = profilePic
      await user.save()
    } else {
      // New user via social auth
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase().trim(),
        authProvider,
        socialId,
        profilePic: profilePic || '',
        role: 'user'
      })
    }

    const token = signToken(user._id)
    res.json({ token, user })
  } catch (err) {
    next(err)
  }
}

// ─── POST /api/auth/profile/request-otp ─────────────────────────────────────
export async function requestPasswordResetOtp(req, res, next) {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ error: 'User not found.' })

    const otp = generateOtp()
    user.passwordResetOtp = otp
    user.passwordResetOtpExpires = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    await sendOtpEmail(user.email, otp)

    res.json({ message: `A verification OTP code has been sent to ${user.email}.` })
  } catch (err) {
    next(err)
  }
}

// ─── POST /api/auth/profile/change-password ──────────────────────────────────
export async function verifyOtpAndChangePassword(req, res, next) {
  try {
    const { currentPassword, newPassword, otp } = req.body

    if (!currentPassword || !newPassword || !otp) {
      return res.status(400).json({ error: 'Current password, new password, and OTP code are required.' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' })
    }

    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ error: 'User not found.' })

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) return res.status(400).json({ error: 'Incorrect current password.' })

    if (!user.passwordResetOtp || user.passwordResetOtp !== otp.trim()) {
      return res.status(400).json({ error: 'Invalid OTP code.' })
    }
    if (user.passwordResetOtpExpires < new Date()) {
      return res.status(400).json({ error: 'OTP code has expired. Please request a new one.' })
    }

    user.password = newPassword
    user.passwordResetOtp = null
    user.passwordResetOtpExpires = null
    await user.save()

    res.json({ message: 'Password updated successfully.' })
  } catch (err) {
    next(err)
  }
}

// ─── POST /api/auth/wishlist/toggle ──────────────────────────────────────────
export async function toggleWishlist(req, res, next) {
  try {
    const { productId } = req.body
    if (!productId) return res.status(400).json({ error: 'productId is required.' })

    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ error: 'User not found.' })

    const idx = user.wishlist.findIndex(id => id.toString() === productId)
    let action
    if (idx === -1) {
      user.wishlist.push(productId)
      action = 'added'
    } else {
      user.wishlist.splice(idx, 1)
      action = 'removed'
    }

    await user.save()
    await user.populate('wishlist', '_id name price image category rating')

    res.json({ action, wishlist: user.wishlist })
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/auth/wishlist ───────────────────────────────────────────────────
export async function getWishlist(req, res, next) {
  try {
    const user = await User.findById(req.userId).populate('wishlist', '_id name price image category rating description sizes featured')
    if (!user) return res.status(404).json({ error: 'User not found.' })

    res.json({ wishlist: user.wishlist })
  } catch (err) {
    next(err)
  }
}
