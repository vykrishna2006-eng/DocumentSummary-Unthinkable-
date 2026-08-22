/**
 * Summary panel — executive / standard / detailed tabs with copy and export actions.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Copy, Check, Download, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const MODES = [
  { id: 'executive', label: 'Executive' },
  { id: 'standard',  label: 'Standard'  },
  { id: 'detailed',  label: 'Detailed'  },
]

export default function SummaryPanel({ summary }) {
  const [active, setActive] = useState('standard')
  const [copied, setCopied] = useState(false)

  const currentText = summary?.[active] || 'Summary not available.'
  const wordCount = currentText.split(/\s+/).filter(Boolean).length
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200))

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText)
    setCopied(true)
    toast.success('Summary copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([currentText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `DocuMind-Summary-${active}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Summary downloaded!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card space-y-4"
    >
      {/* Header with quick actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-brand-400" />
          <h2 className="font-semibold text-slate-100">AI Summary</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 bg-surface px-2.5 py-1 rounded-md">
            <Clock size={11} />
            {wordCount} words · ~{readTimeMin} min read
          </span>
          <button
            onClick={handleCopy}
            className="btn-ghost p-1.5 rounded-md hover:bg-surface text-slate-400 hover:text-slate-200"
            title="Copy summary"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>
          <button
            onClick={handleDownload}
            className="btn-ghost p-1.5 rounded-md hover:bg-surface text-slate-400 hover:text-slate-200"
            title="Download summary as text"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2 p-1 bg-surface rounded-lg">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setActive(m.id)}
            className={clsx(
              'flex-1 py-1.5 rounded-md text-sm font-medium transition-all duration-150',
              active === m.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200',
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Summary text */}
      <AnimatePresence mode="wait">
        <motion.p
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="text-slate-300 leading-relaxed text-sm whitespace-pre-line"
        >
          {currentText}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  )
}
