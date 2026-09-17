import User from '../models/User.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'

/**
 * GET /api/admin/stats
 * Get overview stats for admin dashboard
 */
export async function getAdminStats(req, res, next) {
  try {
    const totalUsers = await User.countDocuments()
    const totalProducts = await Product.countDocuments({ isActive: true })
    const totalOrders = await Order.countDocuments()

    // Calculate revenue (excluding cancelled orders)
    const revenueAggregation = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ])

    const revenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      revenue: Math.round(revenue * 100) / 100
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/admin/users
 * View all users in system
 */
export async function getAdminUsers(req, res, next) {
  try {
    // Return all users, sorting by newest first
    const users = await User.find().sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/admin/users/:id/block
 * Toggle block/unblock user status
 */
export async function toggleBlockUser(req, res, next) {
  try {
    const { id } = req.params

    if (req.userId === id) {
      return res.status(400).json({ error: 'You cannot block your own admin account.' })
    }

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }

    user.isBlocked = !user.isBlocked
    await user.save()

    res.json({
      message: `User has been successfully ${user.isBlocked ? 'blocked' : 'unblocked'}.`,
      user
    })
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/admin/users/:id/role
 * Update user role (admin/user)
 */
export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params
    const { role } = req.body

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role value.' })
    }

    if (req.userId === id) {
      return res.status(400).json({ error: 'You cannot change your own admin role.' })
    }

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }

    user.role = role
    await user.save()

    res.json({
      message: `User role has been updated to ${role}.`,
      user
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/admin/orders
 * View all orders in system populated with user info
 */
export async function getAdminOrders(req, res, next) {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })

    res.json(orders)
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/admin/orders/:id/status
 * Update status of an order
 */
export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params
    const { status } = req.body

    const allowedStatus = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!status || !allowedStatus.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status.' })
    }

    const order = await Order.findById(id).populate('user', 'name email')
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' })
    }

    order.status = status
    await order.save()

    res.json({
      message: `Order status has been updated to ${status}.`,
      order
    })
  } catch (err) {
    next(err)
  }
}
