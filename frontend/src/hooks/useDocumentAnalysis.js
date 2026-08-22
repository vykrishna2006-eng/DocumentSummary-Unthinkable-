/**
 * useDocumentAnalysis hook — manages analysis lifecycle + elapsed timer.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { analyzeDocument } from '../services/api.js'

export const STAGES = [
  { id: 'validating',   label: 'Validating file'              },
  { id: 'extracting',   label: 'Extracting document text'     },
  { id: 'detecting',    label: 'Detecting document structure'  },
  { id: 'chunking',     label: 'Building semantic chunks'     },
  { id: 'summarising',  label: 'Generating summaries'         },
  { id: 'insights',     label: 'Extracting key insights'      },
  { id: 'improvements', label: 'Preparing recommendations'    },
]

const STAGE_DELAYS = [400, 600, 500, 400, 700, 600, 500]

const INITIAL = {
  status: 'idle',
  uploadProgress: 0,
  currentStage: -1,
  completedStages: [],
  result: null,
  error: null,
  elapsedSeconds: 0,
}

export function useDocumentAnalysis() {
  const [state, setState] = useState(INITIAL)
  const timerRef    = useRef(null)
  const startRef    = useRef(null)

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  useEffect(() => () => stopTimer(), [])

  const reset = useCallback(() => {
    stopTimer()
    setState(INITIAL)
  }, [])

  const analyze = useCallback(async (file, summaryMode) => {
    stopTimer()

    // Reset state
    setState({ ...INITIAL, status: 'uploading' })

    // Start elapsed timer
    startRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        elapsedSeconds: Math.floor((Date.now() - startRef.current) / 1000),
      }))
    }, 1000)

    // Animate through stages (visual only — real API runs in parallel)
    let idx = 0
    const tick = () => {
      if (idx < STAGES.length) {
        const i = idx++
        setState(prev => ({ ...prev, status: 'processing', currentStage: i }))
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            completedStages: prev.completedStages.includes(STAGES[i].id)
              ? prev.completedStages
              : [...prev.completedStages, STAGES[i].id],
          }))
          tick()
        }, STAGE_DELAYS[i])
      }
    }
    setTimeout(tick, 300)

    // Real API call
    try {
      const result = await analyzeDocument(
        file,
        summaryMode,
        pct => setState(prev => ({ ...prev, uploadProgress: pct })),
      )
      stopTimer()
      setState(prev => ({
        ...prev,
        status: 'success',
        currentStage: STAGES.length,
        completedStages: STAGES.map(s => s.id),
        result,
      }))
    } catch (err) {
      stopTimer()
      setState(prev => ({ ...prev, status: 'error', error: err.message }))
    }
  }, [])

  return { state, analyze, reset }
}
