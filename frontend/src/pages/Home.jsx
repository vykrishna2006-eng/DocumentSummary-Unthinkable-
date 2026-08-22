import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Image, Zap, Shield, Brain, User,
  BarChart2, Lightbulb, TrendingUp, Clock,
  CheckCircle, ArrowRight, Upload
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useDocumentAnalysis } from '../hooks/useDocumentAnalysis.js'
import { useAuthContext } from '../context/AuthContext.jsx'
import ProcessingOverlay from '../components/ProcessingOverlay.jsx'
import { fmtBytes } from '../utils/formatters.js'
import clsx from 'clsx'

const SUMMARY_MODES = [
  { id: 'executive', label: 'Executive', desc: '~100 words' },
  { id: 'standard',  label: 'Standard',  desc: '~250 words' },
  { id: 'detailed',  label: 'Detailed',  desc: '~500 words' },
]

const FEATURES = [
  {
    icon: FileText,
    title: 'PDF Intelligence',
    desc: 'Extracts text from any PDF — text-based or scanned — with high accuracy.',
    color: 'text-blue-400',
    bg: 'bg-blue-900/30',
  },
  {
    icon: Image,
    title: 'OCR Engine',
    desc: 'Reads scanned documents and images using Tesseract OCR technology.',
    color: 'text-purple-400',
    bg: 'bg-purple-900/30',
  },
  {
    icon: BarChart2,
    title: 'Smart Summaries',
    desc: 'Three summary lengths generated simultaneously — executive, standard, detailed.',
    color: 'text-green-400',
    bg: 'bg-green-900/30',
  },
  {
    icon: Lightbulb,
    title: 'Key Insights',
    desc: 'Extracts the 6 most important findings with page-level citations.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/30',
  },
  {
    icon: TrendingUp,
    title: 'Quality Analysis',
    desc: 'Scores your document on clarity, structure, and completeness.',
    color: 'text-pink-400',
    bg: 'bg-pink-900/30',
  },
  {
    icon: Zap,
    title: 'Under 60 Seconds',
    desc: 'Full AI pipeline — summary, insights, improvements — in under a minute.',
    color: 'text-brand-400',
    bg: 'bg-brand-900/30',
  },
]

const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
}
const MAX_SIZE = 20 * 1024 * 1024

export default function Home() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [mode, setMode] = useState('standard')
  const { state, analyze, reset } = useDocumentAnalysis()
  const { user } = useAuthContext()

  const initials = (user?.user_metadata?.full_name || user?.email || 'U')
    .split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      const err = rejected[0].errors[0]
      if (err.code === 'file-too-large') toast.error('File too large. Max 20 MB.')
      else if (err.code === 'file-invalid-type') toast.error('Unsupported file. Upload PDF, PNG or JPG.')
      else toast.error(err.message)
      return
    }
    setFile(accepted[0])
    // Auto-scroll to upload section
    document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    multiple: false,
  })

  const handleAnalyze = async () => {
    if (!file) { toast.error('Please select a file first.'); return }
    analyze(file, mode)
  }

  // Navigate when result arrives
  useEffect(() => {
    if (state.status === 'success' && state.result) {
      navigate('/analysis', { state: { result: state.result, filename: file?.name } })
    }
  }, [state.status, state.result])

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Nav ── */}
      <nav className="border-b border-surface-border px-6 py-4 flex items-center justify-between sticky top-0 bg-surface/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Brain size={16} className="text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight">DocuMind</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 hidden sm:block">AI Document Intelligence</span>
          <button
            onClick={() => navigate('/profile')}
            className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center
                       text-white text-xs font-bold hover:bg-brand-500 transition-colors"
            title="Profile"
          >
            {initials}
          </button>
        </div>
      </nav>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="text-center px-4 pt-16 pb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 badge bg-brand-900 text-brand-300 mb-6">
              <Zap size={12} />
              Powered by AI · PDF · OCR · Gemini
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Understand Any Document
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
              Upload a PDF or image. Get summaries, key insights, and improvement
              suggestions — all in under 60 seconds.
            </p>
            <button
              onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Upload size={16} />
              Upload Document
              <ArrowRight size={16} />
            </button>
          </motion.div>
        </section>

        {/* ── Stats bar ── */}
        <section className="border-y border-surface-border bg-surface-card">
          <div className="max-w-4xl mx-auto px-6 py-5 grid grid-cols-3 gap-4 text-center">
            {[
              { value: '< 60s', label: 'Analysis time' },
              { value: '3',     label: 'Summary modes' },
              { value: '6',     label: 'Key insights'  },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-brand-400">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features grid ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
          <div className="text-center mb-10">
            <p className="label text-brand-400 mb-2">What DocuMind does</p>
            <h2 className="text-2xl font-bold text-slate-100">Full AI Intelligence Pipeline</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="card hover:border-surface-muted transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-3`}>
                  <f.icon size={18} className={f.color} />
                </div>
                <h3 className="font-semibold text-slate-200 mb-1">{f.title}</h3>
                <p className="text-sm text-slate-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="bg-surface-card border-y border-surface-border py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="label text-brand-400 mb-2">Simple process</p>
              <h2 className="text-2xl font-bold text-slate-100">How it works</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { step: '01', title: 'Upload', desc: 'Drop a PDF, PNG or JPG — up to 20 MB.' },
                { step: '02', title: 'Analyse', desc: 'AI extracts text, chunks it, and runs the full pipeline.' },
                { step: '03', title: 'Explore', desc: 'Read summaries, browse insights, fix your document.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4">
                  <span className="text-3xl font-black text-brand-800 font-mono flex-shrink-0">{step}</span>
                  <div>
                    <h3 className="font-semibold text-slate-200 mb-1">{title}</h3>
                    <p className="text-sm text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Upload section ── */}
        <section id="upload-section" className="max-w-xl mx-auto px-4 py-14">
          <div className="text-center mb-6">
            <p className="label text-brand-400 mb-2">Get started</p>
            <h2 className="text-2xl font-bold text-slate-100">Analyse your document</h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="card space-y-5"
          >
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={clsx(
                'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
                isDragActive
                  ? 'border-brand-500 bg-brand-900/20'
                  : 'border-surface-border hover:border-brand-600 hover:bg-surface',
              )}
            >
              <input {...getInputProps()} />
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    <div className="w-11 h-11 rounded-xl bg-brand-900 flex items-center justify-center mx-auto">
                      <FileText size={22} className="text-brand-400" />
                    </div>
                    <p className="font-medium text-slate-100 text-sm truncate max-w-xs mx-auto">{file.name}</p>
                    <p className="text-xs text-slate-500">{fmtBytes(file.size)}</p>
                    <button
                      onClick={e => { e.stopPropagation(); setFile(null) }}
                      className="text-xs text-slate-500 hover:text-slate-300 underline"
                    >
                      Remove
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    <div className="flex justify-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-lg bg-surface-border flex items-center justify-center">
                        <FileText size={17} className="text-slate-400" />
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-surface-border flex items-center justify-center">
                        <Image size={17} className="text-slate-400" />
                      </div>
                    </div>
                    <p className="font-medium text-slate-300">
                      {isDragActive ? 'Drop it here' : 'Drag & drop your document'}
                    </p>
                    <p className="text-xs text-slate-500">PDF · PNG · JPG — up to 20 MB</p>
                    <span className="inline-block mt-1 px-4 py-1.5 rounded-lg bg-surface-border text-sm text-slate-300 hover:bg-surface-muted transition-colors">
                      Browse Files
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Summary Mode */}
            <div className="space-y-2">
              <p className="label">Summary Mode</p>
              <div className="grid grid-cols-3 gap-2">
                {SUMMARY_MODES.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={clsx(
                      'p-2.5 rounded-lg border text-left transition-all duration-150',
                      mode === m.id
                        ? 'border-brand-500 bg-brand-900/30 text-brand-300'
                        : 'border-surface-border hover:border-surface-muted text-slate-400 hover:text-slate-200',
                    )}
                  >
                    <p className="font-medium text-sm">{m.label}</p>
                    <p className="text-xs mt-0.5 opacity-70">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleAnalyze}
              disabled={!file || state.status === 'processing' || state.status === 'uploading'}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
            >
              <Brain size={18} />
              Analyse Document
            </button>

            {/* Trust */}
            <div className="flex items-center justify-center gap-5 text-slate-600 text-xs pt-1">
              <span className="flex items-center gap-1"><Shield size={12} /> Secure</span>
              <span className="flex items-center gap-1"><Clock size={12} /> Under 60s</span>
              <span className="flex items-center gap-1"><CheckCircle size={12} /> Free</span>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border px-6 py-4 text-center text-xs text-slate-600">
        DocuMind — AI Document Intelligence · Built with Gemini + FastAPI + React
      </footer>

      {/* Processing overlay */}
      <AnimatePresence>
        {(state.status === 'processing' || state.status === 'uploading') && (
          <ProcessingOverlay stages={state} />
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {state.status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 card border-red-800 bg-red-900/20 max-w-sm w-full mx-4 z-50"
          >
            <p className="font-medium text-red-300 mb-1">⚠ Analysis failed</p>
            <p className="text-sm text-slate-400">{state.error}</p>
            <button onClick={reset} className="mt-3 text-sm text-brand-400 hover:underline">Try again</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
