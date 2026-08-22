/**
 * Summary panel — executive / standard / detailed tabs.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import clsx from 'clsx'

const MODES = [
  { id: 'executive', label: 'Executive' },
  { id: 'standard',  label: 'Standard'  },
  { id: 'detailed',  label: 'Detailed'  },
]

export default function SummaryPanel({ summary }) {
  const [active, setActive] = useState('standard')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card space-y-4"
    >
      <div className="flex items-center gap-2">
        <BookOpen size={16} className="text-brand-400" />
        <h2 className="font-semibold text-slate-100">Summary</h2>
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
          className="text-slate-300 leading-relaxed text-sm"
        >
          {summary[active] || 'Summary not available.'}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  )
}
