import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FaArrowRight, FaGoogle, FaFacebook, FaTimes } from 'react-icons/fa'

// Mock social profiles — same pool as Login
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

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const { signup, socialLogin } = useAuth()
  const nav = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || ''

  // Social popup
  const [socialPopup, setSocialPopup] = useState(null)
  const [socialLoading, setSocialLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (form.name.trim().length < 2) { setError('Name must be at least 2 characters.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setLoading(true)
    setError(null)
    try {
      await signup(form.name.trim(), form.email, form.password)
      toast.success('Account created! Welcome to Fashion & Freedom.')
      nav(redirect ? `/${redirect}` : '/')
    } catch (err) {
      setError(err.message || 'Failed to sign up. Email may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSocialSelect(profile, provider) {
    setSocialLoading(true)
    try {
      await socialLogin({ ...profile, authProvider: provider })
      setSocialPopup(null)
      toast.success(`Account ready, ${profile.name}! 🎉`)
      nav(redirect ? `/${redirect}` : '/')
    } catch (err) {
      toast.error(err.message || 'Social signup failed.')
    } finally {
      setSocialLoading(false)
    }
  }

  const mockUsers = socialPopup === 'google' ? MOCK_GOOGLE_USERS : MOCK_FB_USERS

  return (
    <div className="container-main py-16 flex items-center justify-center bg-primary">
      <div className="max-w-md w-full shadow-soft p-8 rounded-3xl border border-white/60 bg-primary">

        <div className="text-center mb-8">
          <span className="font-black text-sm uppercase tracking-widest text-zinc-800 font-mono">
            FASHION<span className="text-zinc-500 font-normal">&FREEDOM</span>
          </span>
          <h1 className="text-2xl font-black uppercase text-zinc-900 tracking-tight mt-3">Create Account</h1>
          <p className="text-zinc-500 text-xs mt-1 font-semibold">Join for exclusive drops & fast checkouts.</p>
        </div>

        {error && (
          <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-xs mb-5 font-semibold">
            {error}
          </div>
        )}

        {/* Social Buttons */}
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
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">or with email</span>
          <div className="flex-1 h-px bg-zinc-300/60" />
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="signup-name" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Full Name</label>
            <input
              id="signup-name" required type="text"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="form-control" placeholder="John Doe" autoComplete="name" minLength={2}
            />
          </div>
          <div>
            <label htmlFor="signup-email" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Email Address</label>
            <input
              id="signup-email" required type="email"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="form-control" placeholder="name@example.com" autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="signup-password" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">
              Password <span className="text-zinc-300 font-normal normal-case">(min. 6 chars)</span>
            </label>
            <input
              id="signup-password" required type="password"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              className="form-control" placeholder="••••••••" autoComplete="new-password" minLength={6}
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="btn btn-secondary w-full py-3.5 mt-2 justify-center text-xs tracking-wider rounded-full"
          >
            {loading ? 'Creating Account...' : <>Create Account <FaArrowRight className="ml-1 text-[10px]" /></>}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-zinc-500 font-bold uppercase tracking-wider">
          Already have an account?{' '}
          <Link to={`/login${redirect ? `?redirect=${redirect}` : ''}`} className="text-zinc-800 hover:text-zinc-600 no-underline border-b-2 border-zinc-900">
            Log In
          </Link>
        </div>
      </div>

      {/* ─── Social Signup Popup ─────────────────────────────────────── */}
      {socialPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm p-4">
          <div className="shadow-soft bg-primary border border-white/50 p-6 rounded-3xl w-full max-w-sm mx-auto">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                {socialPopup === 'google'
                  ? <FaGoogle className="text-xl text-[#DB4437]" />
                  : <FaFacebook className="text-xl text-[#1877F2]" />}
                <div>
                  <div className="font-black text-zinc-900 text-sm">Continue with {socialPopup === 'google' ? 'Google' : 'Facebook'}</div>
                  <div className="text-[10px] text-zinc-400 font-semibold">Select an account to register</div>
                </div>
              </div>
              <button onClick={() => setSocialPopup(null)} className="btn btn-icon-only btn-primary w-8 h-8 rounded-full border border-white/40 cursor-pointer">
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
                    src={profile.profilePic} alt={profile.name}
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
              Demo accounts for testing. Real OAuth integration available on production.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
