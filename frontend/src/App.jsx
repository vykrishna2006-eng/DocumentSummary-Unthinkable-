import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import Analysis from './pages/Analysis.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Profile from './pages/Profile.jsx'
import { checkHealth } from './services/api.js'

export default function App() {
  // Wake up Render free-tier backend on initial visit
  useEffect(() => {
    checkHealth().catch(() => {})
  }, [])

  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route path="/" element={
          <ProtectedRoute><Home /></ProtectedRoute>
        } />
        <Route path="/analysis" element={
          <ProtectedRoute><Analysis /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  )
}
