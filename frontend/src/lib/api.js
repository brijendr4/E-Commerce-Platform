const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('ff_token')
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: getHeaders(),
    ...options
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Something went wrong')
  return data
}

// Auth & Profile
export const authAPI = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  signup: (name, email, password) =>
    request('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  me: () => request('/auth/me'),

  updateProfile: (name, email, profilePic) =>
    request('/auth/profile', { method: 'PUT', body: JSON.stringify({ name, email, profilePic }) }),

  requestOtp: () =>
    request('/auth/profile/request-otp', { method: 'POST' }),

  changePassword: (currentPassword, newPassword, otp) =>
    request('/auth/profile/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword, otp })
    }),

  forgotPassword: (email) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (email, otp, newPassword) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, otp, newPassword }) }),

  socialLogin: (socialData) =>
    request('/auth/social-login', { method: 'POST', body: JSON.stringify(socialData) }),

  // Wishlist
  toggleWishlist: (productId) =>
    request('/auth/wishlist/toggle', { method: 'POST', body: JSON.stringify({ productId }) }),

  getWishlist: () => request('/auth/wishlist')
}

// Products
export const productsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/products${query ? `?${query}` : ''}`)
  },

  getById: (id) => request(`/products/${id}`),

  create: (productData) =>
    request('/products', { method: 'POST', body: JSON.stringify(productData) }),

  update: (id, productData) =>
    request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(productData) }),

  delete: (id) =>
    request(`/products/${id}`, { method: 'DELETE' })
}

// Orders
export const ordersAPI = {
  create: (orderData) =>
    request('/orders', { method: 'POST', body: JSON.stringify(orderData) }),

  getMyOrders: () => request('/orders/me')
}

// Payments (Simulated Gateway)
export const paymentsAPI = {
  process: (amount, cardToken) =>
    request('/payments/process', {
      method: 'POST',
      body: JSON.stringify({ amount, cardToken })
    })
}

// Admin Panel APIs
export const adminAPI = {
  getStats: () => request('/admin/stats'),
  getUsers: () => request('/admin/users'),
  toggleBlockUser: (id) => request(`/admin/users/${id}/block`, { method: 'PUT' }),
  updateUserRole: (id, role) =>
    request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  getOrders: () => request('/admin/orders'),
  updateOrderStatus: (id, status) =>
    request(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
}
