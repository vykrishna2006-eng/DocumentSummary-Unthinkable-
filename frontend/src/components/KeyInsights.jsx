/**
 * Key Insights panel — numbered list with citations and copy support.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function KeyInsights({ insights = [] }) {
  const [copied, setCopied] = useState(false)

  const handleCopyAll = () => {
    const text = insights
      .map((item, i) => `${i + 1}. ${item.text}${item.source_page ? ` (Page ${item.source_page})` : ''}`)
      .join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Key insights copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="card space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb size={16} className="text-brand-400" />
          <h2 className="font-semibold text-slate-100">Key Insights</h2>
          <span className="badge bg-brand-900 text-brand-400">{insights.length}</span>
        </div>

        <button
          onClick={handleCopyAll}
          className="btn-ghost p-1.5 rounded-md hover:bg-surface text-slate-400 hover:text-slate-200"
          title="Copy all insights"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
      </div>

      <ol className="space-y-3">
        {insights.map((item, i) => (
          <motion.li
            key={item.index ?? i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            className="flex gap-3 bg-surface/40 hover:bg-surface/80 p-2.5 rounded-lg transition-colors"
          >
            <span className="w-6 h-6 rounded-md bg-brand-900/80 text-brand-300 text-xs font-mono font-bold
                             flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              {String(item.index ?? i + 1).padStart(2, '0')}
            </span>
            <div>
              <p className="text-sm text-slate-200 leading-relaxed">{item.text}</p>
              {item.source_page && (
                <span className="inline-block mt-1 text-xs text-slate-500 font-mono">
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
