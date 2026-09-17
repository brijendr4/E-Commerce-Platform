import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { authAPI } from '../lib/api'
import {
  FaUser, FaLock, FaEnvelope, FaArrowRight, FaGoogle,
  FaFacebook, FaKey, FaTimes, FaCheckCircle
} from 'react-icons/fa'

// ─── Simulated social profiles for demo ──────────────────────────────────────
const MOCK_GOOGLE_USERS = [
  { name: 'Arjun Mehta', email: 'arjun.mehta@gmail.com', socialId: 'g_001', profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun' },
  { name: 'Priya Sharma', email: 'priya.sharma@gmail.com', socialId: 'g_002', profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya' },
  { name: 'Rohan Gupta', email: 'rohan.gupta@gmail.com', socialId: 'g_003', profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rohan' }
]
const MOCK_FB_USERS = [
  { name: 'Sneha Patel', email: 'sneha.patel@facebook.com', socialId: 'fb_001', profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sneha' },
  { name: 'Kabir Singh', email: 'kabir.singh@facebook.com', socialId: 'fb_002', profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kabir' },
  { name: 'Anika Joshi', email: 'anika.joshi@facebook.com', socialId: 'fb_003', profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anika' }
]

export default function Login() {
  const { login, socialLogin } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  // Login form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Social login popup
  const [socialPopup, setSocialPopup] = useState(null) // null | 'google' | 'facebook'
  const [socialLoading, setSocialLoading] = useState(false)

  // Forgot password states
  const [forgotOpen, setForgotOpen] = useState(false)
  const [fpStep, setFpStep] = useState(1) // 1=email, 2=otp+newpass
  const [fpEmail, setFpEmail] = useState('')
  const [fpOtp, setFpOtp] = useState('')
  const [fpNewPass, setFpNewPass] = useState('')
  const [fpConfirm, setFpConfirm] = useState('')
  const [fpLoading, setFpLoading] = useState(false)
  const [fpDone, setFpDone] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate(redirect.startsWith('/') ? redirect : '/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSocialSelect(profile, provider) {
    setSocialLoading(true)
    try {
      await socialLogin({ ...profile, authProvider: provider })
      setSocialPopup(null)
      toast.success(`Welcome, ${profile.name}! 🎉`)
      navigate(redirect.startsWith('/') ? redirect : '/')
    } catch (err) {
      toast.error(err.message || 'Social login failed.')
    } finally {
      setSocialLoading(false)
    }
  }

  async function handleForgotStep1(e) {
    e.preventDefault()
    setFpLoading(true)
    try {
      await authAPI.forgotPassword(fpEmail)
      toast.success('OTP sent! Check your email or backend console.')
      setFpStep(2)
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP.')
    } finally {
      setFpLoading(false)
    }
  }

  async function handleForgotStep2(e) {
    e.preventDefault()
    if (fpNewPass !== fpConfirm) { toast.error('Passwords do not match.'); return }
    if (fpNewPass.length < 6) { toast.error('Password must be at least 6 characters.'); return }
    setFpLoading(true)
    try {
      await authAPI.resetPassword(fpEmail, fpOtp, fpNewPass)
      setFpDone(true)
      toast.success('Password reset successfully!')
    } catch (err) {
      toast.error(err.message || 'Reset failed.')
    } finally {
      setFpLoading(false)
    }
  }

  function closeForgot() {
    setForgotOpen(false)
    setFpStep(1)
    setFpEmail('')
    setFpOtp('')
    setFpNewPass('')
    setFpConfirm('')
    setFpDone(false)
  }

  const mockUsers = socialPopup === 'google' ? MOCK_GOOGLE_USERS : MOCK_FB_USERS
  const providerColor = socialPopup === 'google' ? '#DB4437' : '#1877F2'
  const providerName = socialPopup === 'google' ? 'Google' : 'Facebook'

  return (
    <div className="container-main py-16 flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="shadow-soft p-8 bg-primary rounded-3xl border border-white/50">

          {/* Logo */}
          <div className="text-center mb-8">
            <span className="font-black text-sm uppercase tracking-widest text-zinc-800 font-mono">
              FASHION<span className="text-zinc-500 font-normal">&FREEDOM</span>
            </span>
            <h1 className="text-2xl font-black uppercase text-zinc-900 tracking-tight mt-3">Welcome Back</h1>
            <p className="text-zinc-500 text-xs mt-1 font-semibold">Sign in to your account</p>
          </div>

          {error && (
            <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-xs mb-5 font-semibold">
              {error}
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setSocialPopup('google')}
              className="btn btn-primary py-3 text-xs font-black tracking-wider flex items-center justify-center gap-2 border border-white/50 hover:border-red-200 hover:text-red-600 transition-colors cursor-pointer"
            >
              <FaGoogle className="text-sm text-[#DB4437]" /> Google
            </button>
            <button
              onClick={() => setSocialPopup('facebook')}
              className="btn btn-primary py-3 text-xs font-black tracking-wider flex items-center justify-center gap-2 border border-white/50 hover:border-blue-200 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <FaFacebook className="text-sm text-[#1877F2]" /> Facebook
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-zinc-300/60" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">or continue with email</span>
            <div className="flex-1 h-px bg-zinc-300/60" />
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xs" />
                <input
                  id="login-email"
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="form-control pl-10"
                  placeholder="your.email@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 ml-1">
                <label htmlFor="login-password" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:text-zinc-800 transition-colors bg-transparent border-none cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xs" />
                <input
                  id="login-password"
                  required
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="form-control pl-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-secondary w-full py-3.5 mt-2 text-xs font-black tracking-wider justify-center rounded-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <FaArrowRight className="ml-2 text-[10px]" />}
            </button>
          </form>

          <p className="text-center text-xs font-semibold text-zinc-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="font-black text-zinc-800 no-underline hover:underline">Create Account</Link>
          </p>
        </div>
      </div>

      {/* ─── Social Login Popup ────────────────────────────────────────── */}
      {socialPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm p-4">
          <div className="shadow-soft bg-primary border border-white/50 p-6 rounded-3xl w-full max-w-sm mx-auto animate-fade-in">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                {socialPopup === 'google'
                  ? <FaGoogle className="text-xl text-[#DB4437]" />
                  : <FaFacebook className="text-xl text-[#1877F2]" />
                }
                <div>
                  <div className="font-black text-zinc-900 text-sm">Continue with {providerName}</div>
                  <div className="text-[10px] text-zinc-400 font-semibold">Select an account</div>
                </div>
              </div>
              <button
                onClick={() => setSocialPopup(null)}
                className="btn btn-icon-only btn-primary w-8 h-8 rounded-full border border-white/40"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <div className="space-y-3">
              {mockUsers.map(profile => (
                <button
                  key={profile.socialId}
                  disabled={socialLoading}
                  onClick={() => handleSocialSelect(profile, socialPopup)}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl btn btn-primary border border-white/50 hover:shadow-soft-hover cursor-pointer text-left transition-all"
                >
                  <img
                    src={profile.profilePic}
                    alt={profile.name}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm flex-shrink-0 bg-zinc-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-xs text-zinc-800 uppercase tracking-tight truncate">{profile.name}</div>
                    <div className="text-[10px] text-zinc-500 font-semibold truncate">{profile.email}</div>
                  </div>
                  <FaArrowRight className="text-zinc-400 text-[10px] flex-shrink-0" />
                </button>
              ))}
            </div>

            <p className="text-center text-[10px] text-zinc-400 mt-4 font-semibold">
              Demo accounts for testing. Real OAuth connects to actual {providerName} accounts.
            </p>
          </div>
        </div>
      )}

      {/* ─── Forgot Password Modal ─────────────────────────────────────── */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm p-4">
          <div className="shadow-soft bg-primary border border-white/50 p-6 rounded-3xl w-full max-w-sm mx-auto animate-fade-in">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-zinc-300/40">
              <div className="flex items-center gap-2">
                <FaKey className="text-zinc-600 text-sm" />
                <h3 className="font-black text-zinc-900 text-sm uppercase tracking-wider">Reset Password</h3>
              </div>
              <button onClick={closeForgot} className="btn btn-icon-only btn-primary w-8 h-8 rounded-full border border-white/40">
                <FaTimes className="text-xs" />
              </button>
            </div>

            {fpDone ? (
              <div className="text-center py-4 space-y-4">
                <FaCheckCircle className="text-4xl text-emerald-500 mx-auto" />
                <div>
                  <div className="font-black text-zinc-900 text-sm uppercase">Password Reset!</div>
                  <p className="text-xs text-zinc-500 mt-1 font-semibold">You can now sign in with your new password.</p>
                </div>
                <button
                  onClick={closeForgot}
                  className="btn btn-secondary w-full py-3 text-xs tracking-wider justify-center rounded-full"
                >
                  Back to Sign In
                </button>
              </div>
            ) : fpStep === 1 ? (
              <form onSubmit={handleForgotStep1} className="space-y-4">
                <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
                  Enter your registered email. We'll send a 6-digit OTP to reset your password.
                </p>
                <div>
                  <label htmlFor="fp-email" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Email Address</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xs" />
                    <input
                      id="fp-email"
                      required
                      type="email"
                      value={fpEmail}
                      onChange={e => setFpEmail(e.target.value)}
                      className="form-control pl-10"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={fpLoading}
                  className="btn btn-secondary w-full py-3 text-xs tracking-wider justify-center rounded-full"
                >
                  {fpLoading ? 'Sending OTP...' : 'Send Reset OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotStep2} className="space-y-4 animate-fade-in">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-700 font-semibold">
                  ✅ OTP sent to <strong>{fpEmail}</strong>. Check your email or backend console logs.
                </div>
                <div>
                  <label htmlFor="fp-otp" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">6-Digit OTP Code</label>
                  <input
                    id="fp-otp"
                    required
                    type="text"
                    maxLength={6}
                    value={fpOtp}
                    onChange={e => setFpOtp(e.target.value)}
                    className="form-control text-center text-lg tracking-[6px] font-extrabold"
                    placeholder="000000"
                  />
                </div>
                <div>
                  <label htmlFor="fp-newpass" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">New Password</label>
                  <input
                    id="fp-newpass"
                    required
                    type="password"
                    value={fpNewPass}
                    onChange={e => setFpNewPass(e.target.value)}
                    className="form-control"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label htmlFor="fp-confirm" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Confirm Password</label>
                  <input
                    id="fp-confirm"
                    required
                    type="password"
                    value={fpConfirm}
                    onChange={e => setFpConfirm(e.target.value)}
                    className="form-control"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFpStep(1)}
                    className="btn btn-primary flex-1 py-3 text-xs tracking-wider"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={fpLoading}
                    className="btn btn-secondary flex-1 py-3 text-xs tracking-wider justify-center rounded-full"
                  >
                    {fpLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
