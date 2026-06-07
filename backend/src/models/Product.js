import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [120, 'Name must be 120 characters or fewer']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description must be 1000 characters or fewer']
  },
  image: {
    type: String,
    required: [true, 'Image URL is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['shirts', 'jackets', 'pants', 'shoes', 'accessories'],
      message: '{VALUE} is not a supported category'
    },
    index: true    // Explicit index — category is frequently queried
  },
  sizes: [{ type: String, trim: true }],
  stock: {
    type: Number,
    default: 50,
    min: [0, 'Stock cannot be negative']
  },
  featured: {
    type: Boolean,
    default: false,
    index: true    // Explicit index — featured is frequently filtered
  },
  rating: {
    type: Number,
    default: 4.5,
    min: [0, 'Rating cannot be below 0'],
    max: [5, 'Rating cannot exceed 5']
  },
  isActive: {
    type: Boolean,
    default: true  // Soft-delete support — never hard-delete products that appear in orders
  }
}, { timestamps: true })

// Compound index for efficient user order queries
productSchema.index({ category: 1, featured: 1 })

export default mongoose.model('Product', productSchema)
