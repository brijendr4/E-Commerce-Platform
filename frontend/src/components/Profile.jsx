import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../lib/api'
import toast from 'react-hot-toast'
import { FaUser, FaShieldAlt, FaArrowLeft, FaCheck, FaCamera, FaLink, FaTimes } from 'react-icons/fa'

// Preset avatar options
const AVATAR_PRESETS = [
  { label: 'Pixel Avatar 1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=felix' },
  { label: 'Pixel Avatar 2', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna' },
  { label: 'Pixel Avatar 3', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jade' },
  { label: 'Pixel Avatar 4', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nova' },
  { label: 'Pixel Avatar 5', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=star' },
  { label: 'Pixel Avatar 6', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zen' },
  { label: 'Retro 1', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=alpha' },
  { label: 'Retro 2', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=omega' },
  { label: 'Bottts 1', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=flash' },
  { label: 'Bottts 2', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=bolt' },
  { label: 'Notionists 1', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=river' },
  { label: 'Notionists 2', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=ocean' }
]

function getInitials(name) {
  return (name || '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Profile() {
  const { user, setUser, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Profile Form State
  const [profileForm, setProfileForm] = useState({ name: '', email: '' })
  const [profileLoading, setProfileLoading] = useState(false)

  // Profile Pic State
  const [picModalOpen, setPicModalOpen] = useState(false)
  const [customUrl, setCustomUrl] = useState('')
  const [picPreview, setPicPreview] = useState('')

  // Security Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '', otp: ''
  })
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [securityLoading, setSecurityLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=profile')
    } else if (user) {
      setProfileForm({ name: user.name || '', email: user.email || '' })
      setPicPreview(user.profilePic || '')
    }
  }, [user, authLoading, navigate])

  async function handleProfileSubmit(e) {
    e.preventDefault()
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      toast.error('Name and email are required.')
      return
    }
    setProfileLoading(true)
    try {
      const data = await authAPI.updateProfile(profileForm.name, profileForm.email, picPreview)
      setUser(data.user)
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.')
    } finally {
      setProfileLoading(false)
    }
  }

  async function handleSelectAvatar(url) {
    setPicPreview(url)
  }

  async function handleCustomUrl() {
    if (!customUrl.trim()) return
    setPicPreview(customUrl.trim())
    setCustomUrl('')
  }

  async function handleSaveProfilePic() {
    setProfileLoading(true)
    try {
      const data = await authAPI.updateProfile(user.name, user.email, picPreview)
      setUser(data.user)
      toast.success('Profile picture updated!')
      setPicModalOpen(false)
    } catch (err) {
      toast.error(err.message || 'Failed to update profile picture.')
    } finally {
      setProfileLoading(false)
    }
  }

  async function handleSendOtp() {
    setOtpLoading(true)
    try {
      await authAPI.requestOtp()
      setOtpSent(true)
      toast.success('OTP sent to your email!')
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP code.')
    } finally {
      setOtpLoading(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    const { currentPassword, newPassword, confirmPassword, otp } = passwordForm
    if (!currentPassword || !newPassword || !otp) { toast.error('All fields including the OTP are required.'); return }
    if (newPassword !== confirmPassword) { toast.error('New passwords do not match.'); return }
    if (newPassword.length < 6) { toast.error('New password must be at least 6 characters.'); return }

    setSecurityLoading(true)
    try {
      const data = await authAPI.changePassword(currentPassword, newPassword, otp)
      toast.success(data.message || 'Password updated successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '', otp: '' })
      setOtpSent(false)
    } catch (err) {
      toast.error(err.message || 'Failed to update password.')
    } finally {
      setSecurityLoading(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="container-main py-10">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="nm-skeleton h-12 w-48 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="nm-skeleton h-80 rounded-2xl" />
            <div className="nm-skeleton h-80 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-main py-10">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="btn btn-primary py-2 px-4 text-xs no-underline inline-flex items-center gap-2">
          <FaArrowLeft className="text-xs" /> Back
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900">User Profile</h1>
          <p className="text-zinc-500 text-xs mt-1 font-semibold">Manage your account information and settings</p>
        </div>
      </div>

      {/* Profile Picture Banner */}
      <div className="shadow-soft p-6 bg-primary rounded-3xl border border-white/50 mb-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative flex-shrink-0">
          {picPreview ? (
            <img
              src={picPreview}
              alt={user.name}
              className="w-24 h-24 rounded-2xl shadow-soft border-2 border-white object-cover bg-zinc-200"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl shadow-inset flex items-center justify-center bg-primary border border-white/40">
              <span className="text-2xl font-black text-zinc-600">{getInitials(user.name)}</span>
            </div>
          )}
          <button
            onClick={() => setPicModalOpen(true)}
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full btn btn-secondary flex items-center justify-center text-[10px] border-2 border-[#e6e8ec] shadow cursor-pointer"
            title="Change profile picture"
          >
            <FaCamera />
          </button>
        </div>
        <div className="text-center sm:text-left">
          <div className="text-xl font-black uppercase text-zinc-900 tracking-tight">{user.name}</div>
          <div className="text-xs text-zinc-500 font-semibold mt-1">{user.email}</div>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${
              user.role === 'admin'
                ? 'bg-amber-50 text-amber-600 border-amber-200'
                : 'bg-zinc-100 text-zinc-500 border-zinc-200'
            }`}>{user.role}</span>
            {user.authProvider !== 'local' && (
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border bg-blue-50 text-blue-600 border-blue-200">
                via {user.authProvider}
              </span>
            )}
          </div>
        </div>
        <div className="sm:ml-auto">
          <button
            onClick={() => setPicModalOpen(true)}
            className="btn btn-primary px-4 py-2 text-xs tracking-wider cursor-pointer"
          >
            Change Avatar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-6xl mx-auto">

        {/* Column 1: Edit Profile Details */}
        <div className="shadow-soft p-6 bg-primary rounded-2xl border border-white/50 space-y-4">
          <div className="flex items-center gap-3 mb-4 pb-2 border-b border-zinc-300/40">
            <div className="w-8 h-8 rounded-lg shadow-inset flex items-center justify-center text-zinc-500 bg-primary">
              <FaUser className="text-xs" />
            </div>
            <h2 className="text-lg font-black uppercase text-zinc-800 tracking-wider">Account Details</h2>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label htmlFor="profile-name" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Full Name</label>
              <input
                id="profile-name" required type="text"
                value={profileForm.name}
                onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                className="form-control" placeholder="Your full name"
              />
            </div>
            <div>
              <label htmlFor="profile-email" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Email Address</label>
              <input
                id="profile-email" required type="email"
                value={profileForm.email}
                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                className="form-control" placeholder="your.email@example.com"
              />
            </div>
            <button
              type="submit" disabled={profileLoading}
              className="btn btn-secondary w-full py-3 mt-4 text-xs tracking-wider justify-center rounded-full"
            >
              {profileLoading ? 'Saving...' : 'Save Profile Details'}
            </button>
          </form>
        </div>

        {/* Column 2: Change Password */}
        <div className="shadow-soft p-6 bg-primary rounded-2xl border border-white/50 space-y-4">
          <div className="flex items-center gap-3 mb-4 pb-2 border-b border-zinc-300/40">
            <div className="w-8 h-8 rounded-lg shadow-inset flex items-center justify-center text-zinc-500 bg-primary">
              <FaShieldAlt className="text-xs" />
            </div>
            <h2 className="text-lg font-black uppercase text-zinc-800 tracking-wider">Change Password</h2>
          </div>

          <div className="bg-zinc-100/60 border border-zinc-300/40 p-4 rounded-xl text-xs text-zinc-500 leading-relaxed font-semibold mb-4 space-y-2">
            <p>🔒 <strong>Security Verification Required:</strong> A 6-digit OTP will be sent to your email.</p>
            {otpSent && (
              <div className="text-emerald-600 flex items-center gap-1.5 font-bold">
                <FaCheck className="text-[10px]" /> OTP code sent! Check your inbox or backend console.
              </div>
            )}
          </div>

          {!otpSent ? (
            <button
              type="button" onClick={handleSendOtp} disabled={otpLoading}
              className="btn btn-primary w-full py-3 text-xs tracking-wider justify-center"
            >
              {otpLoading ? 'Sending...' : 'Request OTP Code'}
            </button>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 animate-fade-in">
              <div>
                <label htmlFor="otp-code" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">6-Digit OTP</label>
                <input
                  id="otp-code" required type="text" maxLength={6}
                  value={passwordForm.otp}
                  onChange={e => setPasswordForm({ ...passwordForm, otp: e.target.value })}
                  className="form-control text-center text-lg tracking-[8px] font-extrabold"
                  placeholder="000000"
                />
              </div>
              <div>
                <label htmlFor="current-password" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Current Password</label>
                <input
                  id="current-password" required type="password"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="form-control" placeholder="••••••••" autoComplete="current-password"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="new-password" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">New Password</label>
                  <input
                    id="new-password" required type="password"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="form-control" placeholder="••••••••" autoComplete="new-password"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Confirm Password</label>
                  <input
                    id="confirm-password" required type="password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="form-control" placeholder="••••••••" autoComplete="new-password"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleSendOtp} disabled={otpLoading}
                  className="btn btn-primary flex-1 py-3 text-xs tracking-wider">
                  Resend OTP
                </button>
                <button type="submit" disabled={securityLoading}
                  className="btn btn-secondary flex-1 py-3 text-xs tracking-wider justify-center rounded-full">
                  {securityLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ─── Profile Pic Modal ───────────────────────────────────────────── */}
      {picModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm p-4">
          <div className="shadow-soft bg-primary border border-white/50 p-6 rounded-3xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-zinc-300/40 sticky top-0 bg-primary z-10">
              <div className="flex items-center gap-2">
                <FaCamera className="text-zinc-600 text-sm" />
                <h3 className="font-black text-zinc-900 text-sm uppercase tracking-wider">Choose Avatar</h3>
              </div>
              <button onClick={() => setPicModalOpen(false)} className="btn btn-icon-only btn-primary w-8 h-8 rounded-full border border-white/40 cursor-pointer">
                <FaTimes className="text-xs" />
              </button>
            </div>

            {/* Preview */}
            <div className="flex justify-center mb-5">
              {picPreview ? (
                <img src={picPreview} alt="Preview" className="w-20 h-20 rounded-2xl shadow-soft border-2 border-white object-cover bg-zinc-200" />
              ) : (
                <div className="w-20 h-20 rounded-2xl shadow-inset flex items-center justify-center bg-primary border border-white/40">
                  <span className="text-xl font-black text-zinc-600">{getInitials(user.name)}</span>
                </div>
              )}
            </div>

            {/* Custom URL input */}
            <div className="mb-5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Custom Image URL</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FaLink className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs" />
                  <input
                    type="url"
                    value={customUrl}
                    onChange={e => setCustomUrl(e.target.value)}
                    className="form-control pl-9"
                    placeholder="https://example.com/your-photo.jpg"
                  />
                </div>
                <button onClick={handleCustomUrl} className="btn btn-primary px-4 py-2 text-xs tracking-wider cursor-pointer flex-shrink-0">
                  Use URL
                </button>
              </div>
            </div>

            {/* Avatar Grid */}
            <div className="mb-5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Select a Preset Avatar</label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {AVATAR_PRESETS.map(preset => (
                  <button
                    key={preset.url}
                    onClick={() => handleSelectAvatar(preset.url)}
                    className={`w-full aspect-square rounded-xl border-2 overflow-hidden transition-all cursor-pointer p-1 ${
                      picPreview === preset.url
                        ? 'border-zinc-700 shadow-inset'
                        : 'border-white/50 btn btn-primary hover:border-zinc-400'
                    }`}
                    title={preset.label}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover rounded-lg bg-zinc-100" />
                  </button>
                ))}
              </div>
            </div>

            {/* Remove Avatar */}
            {picPreview && (
              <button
                onClick={() => setPicPreview('')}
                className="btn btn-primary w-full py-2 text-xs text-zinc-400 tracking-wider mb-3 cursor-pointer"
              >
                Remove Avatar (use initials)
              </button>
            )}

            {/* Save */}
            <button
              onClick={handleSaveProfilePic}
              disabled={profileLoading}
              className="btn btn-secondary w-full py-3 text-xs tracking-wider justify-center rounded-full"
            >
              {profileLoading ? 'Saving...' : 'Save Profile Picture'}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
