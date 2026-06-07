/**
 * Simulates a payment processing transaction
 * @param {Object} paymentData 
 * @param {number} paymentData.amount
 * @param {string} paymentData.cardToken
 * @param {string} paymentData.email
 * @returns {Promise<Object>}
 */
export async function processPayment(paymentData) {
  const { amount, cardToken, email } = paymentData

  // Validate amount
  if (!amount || amount <= 0) {
    throw new Error('Invalid payment amount')
  }

  // Simulate network latency (800ms) to make the UX feel premium and realistic
  await new Promise(resolve => setTimeout(resolve, 800))

  // Simulate controlled credit card failures
  // If cardToken is 'fail', simulate bank decline
  if (cardToken === 'fail') {
    return {
      success: false,
      message: 'Your credit card was declined by the bank. Insufficient funds or card details incorrect.',
      transactionId: null
    }
  }

  // Generate a mock Stripe charge ID style transaction reference
  const transactionId = `ch_${Math.random().toString(36).substring(2, 12).toUpperCase()}`

  return {
    success: true,
    message: 'Payment completed successfully.',
    transactionId
  }
}
