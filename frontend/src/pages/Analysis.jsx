import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Brain, CheckCircle } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext.jsx'
import DocumentStats from '../components/DocumentStats.jsx'
import SummaryPanel from '../components/SummaryPanel.jsx'
import KeyInsights from '../components/KeyInsights.jsx'
import ImprovementSuggestions from '../components/ImprovementSuggestions.jsx'
import DocumentViewer from '../components/DocumentViewer.jsx'

export default function Analysis() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthContext()

  const initials = (user?.user_metadata?.full_name || user?.email || 'U')
    .split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  // Guard: redirect if arrived without data
  if (!state?.result) {
    navigate('/')
    return null
  }

  const { result, filename } = state

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

        <div className="flex items-center gap-3">
          <CheckCircle size={14} className="text-green-400" />
          <span className="text-sm text-slate-400">Analysis complete</span>
          <button
            onClick={() => navigate('/profile')}
            className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center
                       text-white text-xs font-bold hover:bg-brand-500 transition-colors ml-2"
            title="Profile"
          >
            {initials}
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 px-4 sm:px-6 py-8 max-w-7xl mx-auto w-full">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="label text-brand-400 mb-1">Analysis Results</p>
          <h1 className="text-2xl font-bold text-slate-100 truncate">
            {filename || result.document.name}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {result.document.type} · {result.document.pages} pages · {result.document.word_count.toLocaleString()} words
          </p>
        </motion.div>

        {/* Top row: stats + summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <DocumentStats
              document={result.document}
              extraction={result.extraction}
            />
          </div>
          <div className="lg:col-span-2">
            <SummaryPanel summary={result.summary} />
          </div>
        </div>

        {/* Middle row: key insights + improvements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <KeyInsights insights={result.key_insights} />
          <ImprovementSuggestions
            improvements={result.improvements}
            quality={result.quality}
          />
        </div>

        {/* Bottom: Document Explorer */}
        <DocumentViewer
          fullText={result.full_text}
          sections={result.sections}
        />
      </main>
    </div>
  )
}
