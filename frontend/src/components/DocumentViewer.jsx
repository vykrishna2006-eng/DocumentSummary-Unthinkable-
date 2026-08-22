/**
 * Document Explorer — left panel with section navigation + full text reader.
 * Clicking a section scrolls the text reader to that position.
 */

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, AlignLeft } from 'lucide-react'
import clsx from 'clsx'

export default function DocumentViewer({ fullText = '', sections = [] }) {
  const [activeSection, setActiveSection] = useState(null)
  const textRef = useRef(null)

  const jumpToSection = (section) => {
    setActiveSection(section.index)
    if (!textRef.current) return
    // Scroll the text area to the approximate character position
    const totalLen = fullText.length
    const ratio = section.start_char / totalLen
    const scrollTarget = textRef.current.scrollHeight * ratio
    textRef.current.scrollTo({ top: scrollTarget, behavior: 'smooth' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="card space-y-4"
    >
      <div className="flex items-center gap-2">
        <BookOpen size={16} className="text-brand-400" />
        <h2 className="font-semibold text-slate-100">Document Explorer</h2>
      </div>

      <div className="flex gap-4 h-80">
        {/* Section list */}
        {sections.length > 0 && (
          <div className="w-44 flex-shrink-0 space-y-1 overflow-y-auto pr-2">
            <p className="label mb-2">Sections</p>
            {sections.map((s) => (
              <button
                key={s.index}
                onClick={() => jumpToSection(s)}
                className={clsx(
                  'w-full text-left px-2 py-1.5 rounded text-xs transition-colors truncate',
                  activeSection === s.index
                    ? 'bg-brand-900/40 text-brand-300'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-surface',
                )}
              >
                <span className="font-mono text-slate-700 mr-1.5">
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
          className="flex-1 overflow-y-auto bg-surface rounded-lg p-4 text-xs text-slate-400 leading-relaxed font-mono whitespace-pre-wrap"
        >
          {fullText || (
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
