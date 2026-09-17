import { processPayment } from '../services/paymentService.js'

/**
 * POST /api/payments/process
 * Processes simulated card payments
 */
export async function handlePaymentProcess(req, res, next) {
  try {
    const { amount, cardToken } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required.' })
    }
    if (!cardToken) {
      return res.status(400).json({ error: 'Credit card payment details are required.' })
    }

    const email = req.user?.email || 'unknown@example.com'
    const result = await processPayment({ amount, cardToken, email })

    if (!result.success) {
      return res.status(402).json({ error: result.message }) // 402 Payment Required
    }

    res.status(200).json({
      message: result.message,
      transactionId: result.transactionId
    })
  } catch (err) {
    next(err)
  }
}
