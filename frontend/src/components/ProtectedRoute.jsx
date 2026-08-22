/**
 * ProtectedRoute — redirects to /login if user is not authenticated.
 */

import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext.jsx'
import { Loader } from 'lucide-react'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size={24} className="text-brand-400 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
