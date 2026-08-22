import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, User, Mail, Calendar, LogOut, ArrowLeft, FileText, Shield } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'

export default function Profile() {
  const navigate = useNavigate()
  const { user, signOut } = useAuthContext()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    toast.success('Signed out.')
    navigate('/login')
  }

  const fullName  = user?.user_metadata?.full_name || 'User'
  const email     = user?.email || ''
  const joinedAt  = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—'

  // Avatar initials
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-surface-border px-6 py-4 flex items-center justify-between sticky top-0 bg-surface/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="btn-ghost flex items-center gap-1.5 -ml-2"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="w-px h-5 bg-surface-border" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center">
              <Brain size={12} className="text-white" />
            </div>
            <span className="font-semibold text-sm">DocuMind</span>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="btn-ghost flex items-center gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </nav>

      <main className="flex-1 px-4 sm:px-6 py-10 max-w-3xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <p className="label text-brand-400 mb-1">Account</p>
            <h1 className="text-2xl font-bold text-slate-100">Profile</h1>
          </div>

          {/* Avatar + name */}
          <div className="card flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">{initials}</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">{fullName}</h2>
              <p className="text-slate-500 text-sm">{email}</p>
            </div>
          </div>

          {/* Details */}
          <div className="card space-y-4">
            <h3 className="font-semibold text-slate-200">Account Details</h3>

            <div className="space-y-3">
              {[
                { icon: User,     label: 'Full Name',   value: fullName },
                { icon: Mail,     label: 'Email',        value: email },
                { icon: Calendar, label: 'Member Since', value: joinedAt },
                { icon: Shield,   label: 'Account Type', value: 'Free Plan' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4 p-3 bg-surface rounded-lg">
                  <Icon size={16} className="text-brand-400 flex-shrink-0" />
                  <div className="flex-1 flex justify-between items-center">
                    <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
                    <span className="text-sm text-slate-200 font-medium">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick action */}
          <div className="card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-900 flex items-center justify-center">
                <FileText size={18} className="text-brand-400" />
              </div>
              <div>
                <p className="font-medium text-slate-200 text-sm">Analyse a document</p>
                <p className="text-xs text-slate-500">Upload a PDF or image to get started</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="btn-primary text-sm px-4 py-2"
            >
              Upload
            </button>
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full py-3 rounded-xl border border-red-900 text-red-400 hover:bg-red-900/20
                       transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <LogOut size={15} />
            Sign out of DocuMind
          </button>
        </motion.div>
      </main>
    </div>
  )
}
