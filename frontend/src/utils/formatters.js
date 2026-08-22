/**
 * Formatting utilities for DocuMind UI.
 */

/** Format a number with thousand separators */
export function fmtNumber(n) {
  return new Intl.NumberFormat().format(n)
}

/** Format bytes to KB/MB */
export function fmtBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Capitalise first letter */
export function capitalise(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
}

/** Map extraction method key to display label */
export function fmtExtractionMethod(method) {
  const map = {
    pdf_text: 'PDF Text',
    ocr:      'OCR Engine',
    hybrid:   'Hybrid (PDF + OCR)',
  }
  return map[method] || method
}

/** Map summary mode to display label */
export function fmtSummaryMode(mode) {
  const map = {
    executive: 'Executive',
    standard:  'Standard',
    detailed:  'Detailed',
  }
  return map[mode] || mode
}

/** Truncate text for preview */
export function truncate(text, maxLen = 120) {
  if (!text || text.length <= maxLen) return text
  return text.slice(0, maxLen).trimEnd() + '…'
}

/** Map icon string from backend to an emoji */
export function improvementIcon(icon) {
  const map = { warning: '⚠', check: '✓', idea: '💡' }
  return map[icon] || '•'
}
