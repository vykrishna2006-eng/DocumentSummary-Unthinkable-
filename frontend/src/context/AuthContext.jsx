/**
 * Auth context — makes auth state available throughout the app
 * without prop drilling.
 */

import { createContext, useContext } from 'react'
import { useAuth } from '../hooks/useAuth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider')
  return ctx
}
