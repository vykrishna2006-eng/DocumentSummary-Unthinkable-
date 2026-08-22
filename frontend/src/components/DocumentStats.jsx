/**
 * Document stats card — shows document intelligence metadata.
 * Extraction method, confidence, pages, word count, language.
 */

import { motion } from 'framer-motion'
import { FileText, Hash, Globe, Layers, CheckCircle } from 'lucide-react'
import { fmtNumber, fmtExtractionMethod } from '../utils/formatters.js'

export default function DocumentStats({ document: doc, extraction }) {
  const confidence = Math.round((extraction?.confidence ?? doc.confidence) * 100)

  const stats = [
    { icon: FileText, label: 'Type',       value: doc.type },
    { icon: Layers,   label: 'Pages',      value: doc.pages },
    { icon: Hash,     label: 'Words',      value: fmtNumber(doc.word_count) },
    { icon: Globe,    label: 'Language',   value: doc.language },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-100">Document Intelligence</h2>
        <span className={`badge ${confidence >= 80 ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-400'}`}>
          <CheckCircle size={11} />
          {confidence}% confidence
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-surface p-3 rounded-lg flex items-start gap-3">
            <Icon size={16} className="text-brand-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="label text-slate-600">{label}</p>
              <p className="text-sm font-medium text-slate-200 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Extraction method */}
      <div className="bg-surface rounded-lg p-3 flex items-center gap-3">
        <CheckCircle size={16} className="text-brand-400 flex-shrink-0" />
        <div>
          <p className="label text-slate-600">Extraction Method</p>
          <p className="text-sm font-medium text-slate-200 mt-0.5">
            {fmtExtractionMethod(extraction?.method || doc.extraction_method)}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
