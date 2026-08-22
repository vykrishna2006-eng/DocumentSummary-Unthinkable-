/**
 * Document Explorer — with section navigation, live text search, and copy features.
 */

import { useState, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, AlignLeft, Search, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function DocumentViewer({ fullText = '', sections = [] }) {
  const [activeSection, setActiveSection] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [copied, setCopied] = useState(false)
  const textRef = useRef(null)

  const jumpToSection = (section) => {
    setActiveSection(section.index)
    if (!textRef.current) return
    const totalLen = fullText.length
    const ratio = section.start_char / Math.max(totalLen, 1)
    const scrollTarget = textRef.current.scrollHeight * ratio
    textRef.current.scrollTo({ top: scrollTarget, behavior: 'smooth' })
  }

  const handleCopyText = () => {
    navigator.clipboard.writeText(fullText)
    setCopied(true)
    toast.success('Document text copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  // Count matches
  const matchCount = useMemo(() => {
    if (!searchQuery.trim()) return 0
    try {
      const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
      return (fullText.match(regex) || []).length
    } catch {
      return 0
    }
  }, [searchQuery, fullText])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="card space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-brand-400" />
          <h2 className="font-semibold text-slate-100">Document Explorer & Extracted Content</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative flex items-center">
            <Search size={13} className="absolute left-2.5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search in text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-surface text-xs text-slate-200 pl-7 pr-3 py-1.5 rounded-lg border border-surface-border focus:border-brand-500 focus:outline-none w-36 sm:w-48"
            />
            {searchQuery && (
              <span className="text-[10px] text-brand-400 font-mono ml-1.5 whitespace-nowrap">
                {matchCount} match{matchCount === 1 ? '' : 'es'}
              </span>
            )}
          </div>

          <button
            onClick={handleCopyText}
            className="btn-ghost p-1.5 rounded-md hover:bg-surface text-slate-400 hover:text-slate-200"
            title="Copy full extracted text"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 h-96">
        {/* Section list */}
        {sections.length > 0 && (
          <div className="w-full md:w-52 flex-shrink-0 space-y-1 overflow-y-auto pr-2 border-b md:border-b-0 md:border-r border-surface-border pb-3 md:pb-0">
            <p className="label mb-2">Detected Sections ({sections.length})</p>
            {sections.map((s) => (
              <button
                key={s.index}
                onClick={() => jumpToSection(s)}
                className={clsx(
                  'w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors truncate block',
                  activeSection === s.index
                    ? 'bg-brand-900/50 text-brand-300 border border-brand-700/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surface',
                )}
              >
                <span className="font-mono text-slate-500 mr-1.5">
                  {String(s.index).padStart(2, '0')}
                </span>
                {s.title}
              </button>
            ))}
          </div>
        )}

        {/* Text reader */}
        <div
          ref={textRef}
          className="flex-1 overflow-y-auto bg-surface rounded-lg p-4 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap selection:bg-brand-600 selection:text-white"
        >
          {fullText ? (
            fullText
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-600">
              <AlignLeft size={24} />
              <p>No text available</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
