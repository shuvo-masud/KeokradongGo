import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import ConsumerDashboard from './pages/ConsumerDashboard'
import SellerDashboard from './pages/SellerDashboard'
import AgentDashboard from './pages/AgentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import Layout from './components/Layout'

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, profile, loading, profileLoading } = useAuth()
  if (loading || (user && profileLoading && !profile)) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
  if (!user) return <Navigate to="/auth" replace />
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function DashboardRouter() {
  const { profile, profileLoading } = useAuth()
  if (profileLoading || !profile) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
  switch (profile.role) {
    case 'CONSUMER': return <ConsumerDashboard />
    case 'SELLER': return <SellerDashboard />
    case 'AGENT': return <AgentDashboard />
    case 'ADMIN': return <AdminDashboard />
    case 'SUPER_ADMIN': return <SuperAdminDashboard />
    default: return <ConsumerDashboard />
  }
}

function AppRoutes() {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>

  return (
    <Routes>
      <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardRouter /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
