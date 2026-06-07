import Order from '../models/Order.js'
import Product from '../models/Product.js'

// POST /api/orders — create order (protected)
export async function createOrder(req, res, next) {
  try {
    const { items, shippingAddress } = req.body

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one item.' })
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || !shippingAddress.email) {
      return res.status(400).json({ error: 'Full name, email, and address are required.' })
    }

    // ✅ SERVER-SIDE PRICE VERIFICATION — never trust the client's price
    // Fetch all products from DB and compute the real total
    const productIds = items.map(it => it.product)
    const dbProducts = await Product.find({ _id: { $in: productIds } }).lean()

    // Build a lookup map for fast access
    const productMap = {}
    dbProducts.forEach(p => { productMap[p._id.toString()] = p })

    let serverTotal = 0
    const verifiedItems = []

    for (const item of items) {
      const dbProduct = productMap[item.product?.toString()]
      if (!dbProduct) {
        return res.status(400).json({ error: `Product not found: ${item.product}` })
      }
      if (!item.qty || item.qty < 1 || !Number.isInteger(item.qty)) {
        return res.status(400).json({ error: 'Item quantity must be a positive integer.' })
      }
      if (item.qty > 50) {
        return res.status(400).json({ error: 'Maximum 50 units per item allowed.' })
      }

      const lineTotal = dbProduct.price * item.qty
      serverTotal += lineTotal

      verifiedItems.push({
        product: dbProduct._id,
        name: dbProduct.name,         // Always use server-side name
        price: dbProduct.price,       // Always use server-side price
        size: item.size || '',
        qty: item.qty
      })
    }

    // Round to 2 decimal places to avoid floating-point drift
    serverTotal = Math.round(serverTotal * 100) / 100

    const { paymentMethod, transactionId } = req.body

    const order = await Order.create({
      user: req.userId,
      items: verifiedItems,
      total: serverTotal,            // Use SERVER-computed total, not client's
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'card' ? 'paid' : 'pending',
      transactionId: paymentMethod === 'card' ? transactionId : null
    })

    res.status(201).json(order)
  } catch (err) {
    next(err)
  }
}

// GET /api/orders/me — get current user's orders (protected)
export async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name image price category')

    res.json(orders)
  } catch (err) {
    next(err)
  }
}
