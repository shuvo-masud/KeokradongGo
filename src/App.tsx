import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ReactNode } from 'react'

import { AuthProvider, useAuth } from './lib/auth'
import { CartProvider } from './pages/ConsumerDashboard'

import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ConsumerDashboard from './pages/ConsumerDashboard'
import SellerDashboard from './pages/SellerDashboard'
import AgentDashboard from './pages/AgentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import SuperAdminDashboard from './pages/SuperAdminDashboard'

import Layout from './components/Layout'

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
    </div>
  )
}

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode
  allowedRoles?: string[]
}) {
  const {
    user,
    profile,
    loading,
    profileLoading,
  } = useAuth()

  if (loading || profileLoading) {
    return <LoadingScreen />
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(profile.role)
  ) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function DashboardRouter() {
  const { profile, profileLoading } = useAuth()

  if (profileLoading) {
    return <LoadingScreen />
  }

  if (!profile) {
    return <Navigate to="/auth" replace />
  }

  if (profile.status === 'pending') {
    return <PendingAccountMessage />
  }

  if (profile.status === 'suspended') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-3">
            Account Suspended
          </h2>
          <p className="text-gray-600">
            Your account has been suspended. Please contact support for more information.
          </p>
        </div>
      </div>
    )
  }

  if (
    profile.status !== 'active' &&
    !['admin', 'super_admin'].includes(profile.role)
  ) {
    return <PendingAccountMessage />
  }

  // Correctly mapping each role to its respective dashboard view
  switch (profile.role) {
    case 'consumer':
      return <ConsumerDashboard />
    case 'seller':
      return <SellerDashboard />
    case 'agent':
      return <AgentDashboard />
    case 'admin':
      return <AdminDashboard />
    case 'super_admin':
      return <SuperAdminDashboard />
    default:
      return <ConsumerDashboard />
  }
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? <Navigate to="/dashboard" replace /> : <LandingPage />
        }
      />

      <Route
        path="/auth"
        element={
          user ? <Navigate to="/dashboard" replace /> : <AuthPage />
        }
      />

      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <CartProvider>
              <Layout>
                <DashboardRouter />
              </Layout>
            </CartProvider>
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  )
}

function PendingAccountMessage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="card p-8 max-w-md text-center">
        <h2 className="text-xl font-bold mb-3">
          Account Pending Approval
        </h2>
        <p className="text-gray-600">
          Your account is waiting for administrator approval.
          You will get access once your account has been approved.
        </p>
      </div>
    </div>
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