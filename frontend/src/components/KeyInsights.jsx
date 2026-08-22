/**
 * Key Insights panel — numbered list with optional page citations.
 */

import { motion } from 'framer-motion'
import { Lightbulb } from 'lucide-react'

export default function KeyInsights({ insights = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="card space-y-4"
    >
      <div className="flex items-center gap-2">
        <Lightbulb size={16} className="text-brand-400" />
        <h2 className="font-semibold text-slate-100">Key Insights</h2>
        <span className="badge bg-brand-900 text-brand-400 ml-auto">{insights.length}</span>
      </div>

      <ol className="space-y-3">
        {insights.map((item, i) => (
          <motion.li
            key={item.index ?? i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            className="flex gap-3"
          >
            <span className="w-6 h-6 rounded-md bg-brand-900 text-brand-400 text-xs font-mono font-bold
                             flex items-center justify-center flex-shrink-0 mt-0.5">
              {String(item.index ?? i + 1).padStart(2, '0')}
            </span>
            <div>
              <p className="text-sm text-slate-200 leading-relaxed">{item.text}</p>
              {item.source_page && (
                <span className="inline-block mt-1 text-xs text-slate-600 font-mono">
                  Source: Page {item.source_page}
                </span>
              )}
            </div>
          </motion.li>
        ))}
      </ol>
    </motion.div>
  )
}
