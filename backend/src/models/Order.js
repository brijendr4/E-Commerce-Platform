import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Item price is required'],
    min: [0, 'Price cannot be negative']
  },
  size: {
    type: String,
    default: ''
  },
  qty: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [50, 'Maximum 50 units per item']
  }
})

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true    // Efficient lookup by user
  },
  items: {
    type: [orderItemSchema],
    validate: {
      validator: v => Array.isArray(v) && v.length > 0,
      message: 'Order must contain at least one item'
    }
  },
  total: {
    type: Number,
    required: [true, 'Order total is required'],
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      message: '{VALUE} is not a valid order status'
    },
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'card'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    default: null
  },
  shippingAddress: {
    fullName: { type: String, required: [true, 'Full name is required'], trim: true },
    email:    { type: String, required: [true, 'Email is required'], trim: true },
    address:  { type: String, required: [true, 'Address is required'], trim: true },
    city:     { type: String, default: '', trim: true },
    phone:    { type: String, default: '', trim: true }
  }
}, { timestamps: true })

// Compound index: find all orders for a user, sorted by date
orderSchema.index({ user: 1, createdAt: -1 })

export default mongoose.model('Order', orderSchema)
