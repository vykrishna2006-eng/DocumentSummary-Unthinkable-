/**
 * Full-screen processing overlay with animated stage checklist + elapsed timer.
 */

import { motion } from 'framer-motion'
import { Check, Circle, Loader, Clock } from 'lucide-react'
import { STAGES } from '../hooks/useDocumentAnalysis.js'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default function ProcessingOverlay({ stages }) {
  const { currentStage, completedStages, uploadProgress, status, elapsedSeconds } = stages

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-surface/90 backdrop-blur-sm flex items-center justify-center z-50 px-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card max-w-sm w-full space-y-5"
      >
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-brand-900 border border-brand-700 flex items-center justify-center mx-auto mb-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Loader size={20} className="text-brand-400" />
            </motion.div>
          </div>
          <h3 className="font-semibold text-slate-100">Analysing Document</h3>
          <p className="text-sm text-slate-500 mt-1">
            {status === 'uploading'
              ? `Uploading… ${uploadProgress}%`
              : 'Running AI intelligence pipeline'}
          </p>
        </div>

        {/* Upload progress bar */}
        {status === 'uploading' && (
          <div className="h-1 bg-surface-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-brand-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Stage checklist */}
        <ul className="space-y-2.5">
          {STAGES.map((stage, i) => {
            const done   = completedStages.includes(stage.id)
            const active = currentStage === i && !done
            // Keep last stage pulsing while waiting for API
            const waiting = i === STAGES.length - 1 && done && status === 'processing'
            return (
              <li key={stage.id} className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                  ${done && !waiting ? 'bg-brand-600' : 'bg-surface-border'}`}>
                  {done && !waiting ? (
                    <Check size={11} className="text-white" />
                  ) : (active || waiting) ? (
                    <motion.div
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ repeat: Infinity, duration: 0.7 }}
                    >
                      <Circle size={8} className="text-brand-400 fill-brand-400" />
                    </motion.div>
                  ) : (
                    <Circle size={8} className="text-slate-600" />
                  )}
                </span>
                <span className={`text-sm transition-colors
                  ${done && !waiting ? 'text-slate-300' : (active || waiting) ? 'text-slate-100 font-medium' : 'text-slate-600'}`}>
                  {stage.label}
                  {waiting && <span className="text-slate-500 text-xs ml-2">Waiting for AI…</span>}
                </span>
              </li>
            )
          })}
        </ul>

        {/* Elapsed timer */}
        <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-surface-border">
          <Clock size={12} className="text-slate-600" />
          <span className="text-xs text-slate-600 font-mono">
            {formatTime(elapsedSeconds)}
          </span>
          <span className="text-xs text-slate-700">elapsed</span>
        </div>
      </motion.div>
    </motion.div>
  )
}
