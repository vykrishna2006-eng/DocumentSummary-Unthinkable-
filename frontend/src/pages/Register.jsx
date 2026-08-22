import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Mail, Lock, User, Eye, EyeOff, Loader } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const { signUp } = useAuthContext()

  const [form, setForm]         = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.fullName || !form.email || !form.password) {
      toast.error('Please fill in all fields.')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await signUp(form.email, form.password, form.fullName)
    setLoading(false)

    if (error) {
      toast.error(error.message || 'Registration failed.')
    } else {
      toast.success('Account created! Check your email to confirm, then sign in.')
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-surface">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-8"
      >
        <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
          <Brain size={18} className="text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">DocuMind</span>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card w-full max-w-md space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Create account</h1>
          <p className="text-slate-500 text-sm mt-1">
            Get started with DocuMind — free forever.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full name */}
          <div className="space-y-1.5">
            <label className="label" htmlFor="fullName">Full name</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Jane Smith"
                className="w-full bg-surface border border-surface-border rounded-lg pl-9 pr-4 py-2.5
                           text-sm text-slate-100 placeholder-slate-600
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="label" htmlFor="email">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-surface border border-surface-border rounded-lg pl-9 pr-4 py-2.5
                           text-sm text-slate-100 placeholder-slate-600
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="label" htmlFor="password">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="password"
                name="password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className="w-full bg-surface border border-surface-border rounded-lg pl-9 pr-10 py-2.5
                           text-sm text-slate-100 placeholder-slate-600
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label className="label" htmlFor="confirm">Confirm password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="confirm"
                name="confirm"
                type={showPass ? 'text' : 'password'}
                value={form.confirm}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="w-full bg-surface border border-surface-border rounded-lg pl-9 pr-4 py-2.5
                           text-sm text-slate-100 placeholder-slate-600
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? <Loader size={16} className="animate-spin" /> : null}
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
