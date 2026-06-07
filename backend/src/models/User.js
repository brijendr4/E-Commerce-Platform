import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name must be 50 characters or fewer']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
    index: true
  },
  password: {
    type: String,
    required: function () { return this.authProvider === 'local' },
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  profilePic: {
    type: String,
    default: ''
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },
  socialId: {
    type: String,
    default: null
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  passwordResetOtp: {
    type: String,
    default: null
  },
  passwordResetOtpExpires: {
    type: Date,
    default: null
  }
}, { timestamps: true })

// Hash password before saving (only for local auth)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password method
userSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false
  return bcrypt.compare(candidate, this.password)
}

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.passwordResetOtp
  delete obj.passwordResetOtpExpires
  return obj
}

export default mongoose.model('User', userSchema)
