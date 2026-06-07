import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { adminAPI, productsAPI } from '../lib/api'
import toast from 'react-hot-toast'
import {
  FaChartBar,
  FaBoxOpen,
  FaClipboardList,
  FaUsers,
  FaUserShield,
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaArrowLeft,
  FaSave,
  FaTimes
} from 'react-icons/fa'

const STATUS_STYLES = {
  pending:    'bg-amber-100 text-amber-700 border-amber-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  shipped:    'bg-purple-100 text-purple-700 border-purple-200',
  delivered:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled:  'bg-red-100 text-red-600 border-red-200'
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Navigation Tabs: 'stats' | 'products' | 'orders' | 'users'
  const [activeTab, setActiveTab] = useState('stats')

  // Data States
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])

  // UI States
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Product Form Modal State
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null) // null = create mode, else product object
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: 'shirts',
    sizes: '',
    stock: 50,
    featured: false
  })

  // Authorization check
  useEffect(() => {
    if (authLoading) return
    if (!user || user.role !== 'admin') {
      toast.error('Access Denied. Administrator role required.')
      navigate('/')
    }
  }, [user, authLoading, navigate])

  // Fetch data depending on active tab
  useEffect(() => {
    if (!user || user.role !== 'admin') return

    async function loadData() {
      setLoading(true)
      try {
        if (activeTab === 'stats') {
          const statsRes = await adminAPI.getStats()
          setStats(statsRes)
        } else if (activeTab === 'products') {
          const prodRes = await productsAPI.getAll({ admin: true })
          setProducts(prodRes)
        } else if (activeTab === 'orders') {
          const ordRes = await adminAPI.getOrders()
          setOrders(ordRes)
        } else if (activeTab === 'users') {
          const usrRes = await adminAPI.getUsers()
          setUsers(usrRes)
        }
      } catch (err) {
        toast.error(err.message || 'Failed to fetch dashboard data.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [activeTab, user])

  // Product actions
  function openAddProduct() {
    setEditingProduct(null)
    setProductForm({
      name: '',
      price: '',
      description: '',
      image: '',
      category: 'shirts',
      sizes: 'S, M, L, XL',
      stock: 50,
      featured: false
    })
    setShowProductModal(true)
  }

  function openEditProduct(prod) {
    setEditingProduct(prod)
    setProductForm({
      name: prod.name || '',
      price: prod.price || '',
      description: prod.description || '',
      image: prod.image || '',
      category: prod.category || 'shirts',
      sizes: prod.sizes ? prod.sizes.join(', ') : '',
      stock: prod.stock !== undefined ? prod.stock : 50,
      featured: !!prod.featured
    })
    setShowProductModal(true)
  }

  async function handleProductSubmit(e) {
    e.preventDefault()
    setSubmitting(true)

    // Parse comma-separated sizes into array
    const sizeArray = productForm.sizes
      ? productForm.sizes.split(',').map(s => s.trim()).filter(Boolean)
      : []

    const payload = {
      ...productForm,
      price: parseFloat(productForm.price),
      stock: parseInt(productForm.stock),
      sizes: sizeArray
    }

    try {
      if (editingProduct) {
        await productsAPI.update(editingProduct._id, payload)
        toast.success('Product updated successfully!')
      } else {
        await productsAPI.create(payload)
        toast.success('Product created successfully!')
      }
      
      // Reload product list
      const prodRes = await productsAPI.getAll({ admin: true })
      setProducts(prodRes)
      setShowProductModal(false)
    } catch (err) {
      toast.error(err.message || 'Failed to save product.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleProductDelete(id) {
    if (!window.confirm('Are you sure you want to delete/deactivate this product?')) return
    try {
      const res = await productsAPI.delete(id)
      toast.success(res.message || 'Product deleted.')
      const prodRes = await productsAPI.getAll({ admin: true })
      setProducts(prodRes)
    } catch (err) {
      toast.error(err.message || 'Failed to delete product.')
    }
  }

  // Order status actions
  async function handleOrderStatusChange(id, newStatus) {
    try {
      await adminAPI.updateOrderStatus(id, newStatus)
      toast.success(`Order status updated to ${newStatus}`)
      
      // Reload order list
      const ordRes = await adminAPI.getOrders()
      setOrders(ordRes)
    } catch (err) {
      toast.error(err.message || 'Failed to update order status.')
    }
  }

  // User list actions
  async function handleToggleUserBlock(id) {
    try {
      const res = await adminAPI.toggleBlockUser(id)
      toast.success(res.message || 'User block status updated.')
      
      // Reload user list
      const usrRes = await adminAPI.getUsers()
      setUsers(usrRes)
    } catch (err) {
      toast.error(err.message || 'Failed to update user block status.')
    }
  }

  async function handleUserRoleChange(id, newRole) {
    try {
      const res = await adminAPI.updateUserRole(id, newRole)
      toast.success(`User role updated to ${newRole}`)
      
      // Reload user list
      const usrRes = await adminAPI.getUsers()
      setUsers(usrRes)
    } catch (err) {
      toast.error(err.message || 'Failed to update user role.')
    }
  }

  // Auth checking indicator
  if (authLoading || !user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="container-main py-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase text-zinc-950 tracking-tight">Admin Dashboard</h1>
          <p className="text-zinc-500 text-xs mt-1 font-semibold">Logged in as {user.name} (Administrator)</p>
        </div>
        <div>
          <button 
            onClick={() => navigate('/')} 
            className="btn btn-primary text-xs py-2 px-4 no-underline inline-flex items-center gap-1.5"
          >
            <FaArrowLeft className="text-[10px]" /> Back to Store
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex flex-wrap gap-3 mb-8">
        {[
          { id: 'stats', name: 'Overview', icon: FaChartBar },
          { id: 'products', name: 'Products', icon: FaBoxOpen },
          { id: 'orders', name: 'Orders', icon: FaClipboardList },
          { id: 'users', name: 'Users', icon: FaUsers }
        ].map(tab => {
          const IconComp = tab.icon
          const isSelected = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn py-3 px-5 text-xs font-black tracking-wider inline-flex items-center gap-2 transition-all cursor-pointer ${
                isSelected
                  ? 'btn-secondary'
                  : 'btn-primary'
              }`}
            >
              <IconComp className="text-xs" />
              {tab.name}
            </button>
          )
        })}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="nm-skeleton h-28 w-full rounded-2xl" />
            ))}
          </div>
          <div className="nm-skeleton h-60 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="animate-fade-in">
          
          {/* Tab 1: Stats Overview */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Total Users', value: stats.totalUsers, label: 'Customers', color: 'text-zinc-800' },
                  { title: 'Active Products', value: stats.totalProducts, label: 'In Catalog', color: 'text-blue-600' },
                  { title: 'Total Orders', value: stats.totalOrders, label: 'All Time', color: 'text-purple-600' },
                  { title: 'Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, label: 'Non-cancelled orders', color: 'text-emerald-600' }
                ].map((stat, idx) => (
                  <div key={idx} className="shadow-soft p-6 bg-primary rounded-2xl border border-white/50">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">{stat.title}</div>
                    <div className={`text-2xl sm:text-3xl font-black ${stat.color} mb-1`}>{stat.value}</div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Notice Area */}
              <div className="shadow-inset p-6 bg-primary rounded-2xl border border-white/20">
                <h3 className="text-base font-black uppercase text-zinc-800 mb-2">Welcome to Admin Dashboard</h3>
                <p className="text-xs text-zinc-550 leading-relaxed font-semibold">
                  Here you have complete administrative power. You can manage products (Add new items, Edit attributes, or toggle active status), update order fulfillment progress from Pending down to Shipped/Delivered, and audit user permissions including toggling administrator roles or blocking accounts.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Products CRUD */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-black uppercase text-zinc-800 tracking-wider">Product Inventory</h2>
                <button onClick={openAddProduct} className="btn btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5">
                  <FaPlus className="text-[10px]" /> Add Product
                </button>
              </div>

              <div className="shadow-soft bg-primary rounded-2xl overflow-hidden border border-white/50">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-semibold text-zinc-650">
                    <thead>
                      <tr className="border-b border-zinc-300 bg-zinc-200/50 text-[10px] uppercase font-black tracking-widest text-zinc-500">
                        <th className="p-4 w-16 text-center">Image</th>
                        <th className="p-4">Name</th>
                        <th className="p-4 w-28">Category</th>
                        <th className="p-4 w-24">Price</th>
                        <th className="p-4 w-20">Stock</th>
                        <th className="p-4 w-24">Featured</th>
                        <th className="p-4 w-20">Status</th>
                        <th className="p-4 w-24 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-300/40">
                      {products.map(prod => (
                        <tr key={prod._id} className="hover:bg-zinc-200/10">
                          <td className="p-3 text-center">
                            <div className="w-10 h-10 rounded-lg shadow-inset p-0.5 border border-white/40 bg-primary mx-auto overflow-hidden">
                              <img src={prod.image} alt={prod.name} className="w-full h-full object-cover rounded-md" />
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-extrabold text-zinc-800 uppercase tracking-tight truncate max-w-xs">{prod.name}</div>
                            <div className="text-[10px] text-zinc-400 mt-0.5">ID: {prod._id}</div>
                          </td>
                          <td className="p-4 uppercase font-bold tracking-wider text-[10px]">{prod.category}</td>
                          <td className="p-4 font-extrabold text-zinc-900">${prod.price.toFixed(2)}</td>
                          <td className="p-4 font-bold">{prod.stock}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${prod.featured ? 'bg-indigo-150 text-indigo-700 border border-indigo-250' : 'bg-zinc-150 text-zinc-400'}`}>
                              {prod.featured ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${prod.isActive ? 'bg-emerald-155 text-emerald-700' : 'bg-red-155 text-red-500'}`}>
                              {prod.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="inline-flex gap-2">
                              <button 
                                onClick={() => openEditProduct(prod)}
                                className="btn btn-icon-only btn-primary w-8 h-8 rounded-lg text-blue-600 border border-white/40"
                                title="Edit Product"
                              >
                                <FaEdit className="text-[10px]" />
                              </button>
                              <button 
                                onClick={() => handleProductDelete(prod._id)}
                                className="btn btn-icon-only btn-primary w-8 h-8 rounded-lg text-red-500 border border-white/40"
                                title="Delete Product"
                              >
                                <FaTrash className="text-[10px]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Order Management */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-lg font-black uppercase text-zinc-800 tracking-wider">All System Orders</h2>

              <div className="shadow-soft bg-primary rounded-2xl overflow-hidden border border-white/50">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-semibold text-zinc-650">
                    <thead>
                      <tr className="border-b border-zinc-300 bg-zinc-200/50 text-[10px] uppercase font-black tracking-widest text-zinc-500">
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Items count</th>
                        <th className="p-4 w-28">Total Price</th>
                        <th className="p-4 w-40">Date</th>
                        <th className="p-4 w-36">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-300/40">
                      {orders.map(order => {
                        const date = new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })
                        return (
                          <tr key={order._id} className="hover:bg-zinc-200/10">
                            <td className="p-4 font-mono font-bold text-zinc-800 break-all">{order._id}</td>
                            <td className="p-4">
                              <div className="font-bold text-zinc-850">{order.user?.name || order.shippingAddress?.fullName}</div>
                              <div className="text-[10px] text-zinc-400">{order.user?.email || order.shippingAddress?.email}</div>
                            </td>
                            <td className="p-4 font-bold">
                              {order.items.reduce((s, it) => s + it.qty, 0)} items
                            </td>
                            <td className="p-4 font-black text-zinc-900">${order.total.toFixed(2)}</td>
                            <td className="p-4 text-zinc-500 font-bold">{date}</td>
                            <td className="p-4">
                              <select
                                value={order.status}
                                onChange={e => handleOrderStatusChange(order._id, e.target.value)}
                                className="w-full p-2 bg-[#e6e8ec] border border-zinc-300 rounded-lg text-xs font-black uppercase shadow-inset text-zinc-700 outline-none"
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: User Management */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-lg font-black uppercase text-zinc-800 tracking-wider">User Account Management</h2>

              <div className="shadow-soft bg-primary rounded-2xl overflow-hidden border border-white/50">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-semibold text-zinc-650">
                    <thead>
                      <tr className="border-b border-zinc-300 bg-zinc-200/50 text-[10px] uppercase font-black tracking-widest text-zinc-500">
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4 w-28 text-center">Role</th>
                        <th className="p-4 w-40">Registered Date</th>
                        <th className="p-4 w-32 text-center">Blocked Status</th>
                        <th className="p-4 w-36 text-center">Update Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-300/40">
                      {users.map(u => {
                        const date = new Date(u.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })
                        const isSelf = u._id === user._id
                        return (
                          <tr key={u._id} className="hover:bg-zinc-200/10">
                            <td className="p-4">
                              <div className="font-extrabold text-zinc-850 uppercase tracking-tight">{u.name}</div>
                              <div className="text-[10px] text-zinc-400">ID: {u._id}</div>
                            </td>
                            <td className="p-4 text-zinc-800 font-bold">{u.email}</td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                u.role === 'admin' 
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                  : 'bg-zinc-200 text-zinc-500'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="p-4 text-zinc-500 font-bold">{date}</td>
                            <td className="p-4 text-center">
                              <button
                                disabled={isSelf}
                                onClick={() => handleToggleUserBlock(u._id)}
                                className={`btn py-1 px-3 text-[10px] tracking-wider rounded-lg justify-center border border-white/40 ${
                                  u.isBlocked 
                                    ? 'btn-secondary text-red-500' 
                                    : 'btn-primary text-zinc-600'
                                }`}
                                title={isSelf ? 'Cannot block yourself' : ''}
                              >
                                {u.isBlocked ? (
                                  <span className="flex items-center gap-1.5"><FaToggleOn /> Blocked</span>
                                ) : (
                                  <span className="flex items-center gap-1.5"><FaToggleOff /> Active</span>
                                )}
                              </button>
                            </td>
                            <td className="p-4 text-center">
                              <select
                                disabled={isSelf}
                                value={u.role}
                                onChange={e => handleUserRoleChange(u._id, e.target.value)}
                                className="p-1.5 bg-[#e6e8ec] border border-zinc-300 rounded-lg text-[10px] font-black uppercase text-zinc-700 outline-none cursor-pointer"
                                title={isSelf ? 'Cannot change your own role' : ''}
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Product Add/Edit Modal Overlay */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="shadow-soft bg-primary border border-white/50 p-6 rounded-2xl w-full max-w-lg mx-auto relative animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-zinc-300/40">
              <h3 className="text-lg font-black uppercase text-zinc-800 tracking-wider">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              <button 
                onClick={() => setShowProductModal(false)}
                className="btn btn-icon-only btn-primary w-8 h-8 rounded-full border border-white/40"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label htmlFor="prod-name" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Product Name</label>
                <input
                  id="prod-name"
                  required
                  type="text"
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  className="form-control"
                  placeholder="e.g. Linen Summer Dress"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prod-price" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Price ($)</label>
                  <input
                    id="prod-price"
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                    className="form-control"
                    placeholder="49.99"
                  />
                </div>
                <div>
                  <label htmlFor="prod-stock" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Stock count</label>
                  <input
                    id="prod-stock"
                    required
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
                    className="form-control"
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prod-cat" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Category</label>
                  <select
                    id="prod-cat"
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full p-3 bg-[#e6e8ec] border border-zinc-300 rounded-xl text-xs font-black uppercase shadow-inset text-zinc-700 outline-none cursor-pointer"
                  >
                    <option value="shirts">Shirts</option>
                    <option value="jackets">Jackets</option>
                    <option value="pants">Pants</option>
                    <option value="shoes">Shoes</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="prod-sizes" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Sizes (comma-separated)</label>
                  <input
                    id="prod-sizes"
                    type="text"
                    value={productForm.sizes}
                    onChange={e => setProductForm({ ...productForm, sizes: e.target.value })}
                    className="form-control"
                    placeholder="S, M, L, XL"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="prod-image" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Image URL</label>
                <input
                  id="prod-image"
                  required
                  type="url"
                  value={productForm.image}
                  onChange={e => setProductForm({ ...productForm, image: e.target.value })}
                  className="form-control"
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>

              <div>
                <label htmlFor="prod-desc" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Description</label>
                <textarea
                  id="prod-desc"
                  required
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="form-control h-20 resize-none"
                  placeholder="Detailed description of product fit and material..."
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  id="prod-featured"
                  type="checkbox"
                  checked={productForm.featured}
                  onChange={e => setProductForm({ ...productForm, featured: e.target.checked })}
                  className="w-4 h-4 border border-zinc-300 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="prod-featured" className="text-xs font-black uppercase tracking-wider text-zinc-600 select-none cursor-pointer">
                  Featured Product (Show on homepage slider)
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4 border-t border-zinc-300/40">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="btn btn-primary flex-1 py-3 text-xs tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-secondary flex-1 py-3 text-xs tracking-wider justify-center"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
