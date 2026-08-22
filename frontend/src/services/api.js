/**
 * DocuMind API client
 * All communication with the FastAPI backend goes through this module.
 */

import axios from 'axios'

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? '/api/v1'
    : 'https://document-summary-backend-5kuw.onrender.com/api/v1')

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 300_000,   // 5 min — Gemini pipeline can take time
})

// Response interceptor: unwrap data or surface error message
client.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.detail ||
      err.response?.data?.error ||
      err.message ||
      'An unexpected error occurred.'
    return Promise.reject(new Error(message))
  },
)

/**
 * Analyse a document.
 * @param {File} file  - The uploaded file (PDF / PNG / JPG)
 * @param {string} summaryMode - "executive" | "standard" | "detailed"
 * @param {function} onProgress - optional upload progress callback (0-100)
 */
export async function analyzeDocument(file, summaryMode = 'standard', onProgress) {
  const form = new FormData()
  form.append('file', file)
  form.append('summary_mode', summaryMode)

  return client.post('/documents/analyze', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (e) => onProgress(Math.round((e.loaded * 100) / (e.total || 1)))
      : undefined,
  })
}

/**
 * Health check — used to verify API connectivity.
 */
export async function checkHealth() {
  return client.get('/health')
}
