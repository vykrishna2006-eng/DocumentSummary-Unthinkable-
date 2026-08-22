/**
 * Document improvement suggestions + quality scores panel.
 */

import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { improvementIcon } from '../utils/formatters.js'
import clsx from 'clsx'

function QualityBar({ label, score }) {
  const color =
    score >= 80 ? 'bg-green-500' :
    score >= 60 ? 'bg-yellow-500' :
    'bg-red-500'

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300 font-medium">{score}%</span>
      </div>
      <div className="h-1.5 bg-surface rounded-full overflow-hidden">
        <motion.div
          className={clsx('h-full rounded-full', color)}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
      </div>
    </div>
  )
}

export default function ImprovementSuggestions({ improvements = [], quality }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card space-y-5"
    >
      <div className="flex items-center gap-2">
        <TrendingUp size={16} className="text-brand-400" />
        <h2 className="font-semibold text-slate-100">Document Quality</h2>
      </div>

      {/* Quality scores */}
      {quality && (
        <div className="space-y-2.5">
          <QualityBar label="Clarity"      score={quality.clarity} />
          <QualityBar label="Structure"    score={quality.structure} />
          <QualityBar label="Completeness" score={quality.completeness} />
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-surface-border" />

      {/* Improvement items */}
      <div className="space-y-3">
        <p className="label">AI Suggestions</p>
        <p className="text-xs text-slate-600">These are AI-generated suggestions, not objective assessments.</p>
        {improvements.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            className="flex gap-3 p-3 bg-surface rounded-lg"
          >
            <span className="text-base flex-shrink-0">{improvementIcon(item.icon)}</span>
            <div>
              <p className="text-xs font-semibold text-slate-300">
                {item.category} — {item.message}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{item.suggestion}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
