import React from 'react'
import { useAuth } from '../lib/auth'
import { useNavigate } from 'react-router-dom'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Dashboard Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold">K</div>
          <span className="font-display font-bold text-xl tracking-tight text-gray-900 hidden sm:block">Keokradong</span>
          
          {/* Shows which role dashboard is currently active */}
          <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-semibold capitalize ml-2">
            {profile?.role || 'User'}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-gray-700 hidden sm:block">
            {profile?.full_name || profile?.business_name || 'User'}
          </div>
          
          {/* THE CRASH FIX: Safe fallback for charAt to prevent the white screen */}
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200 uppercase shadow-sm">
            {profile?.full_name?.charAt(0) || profile?.business_name?.charAt(0) || '?'}
          </div>

          <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
          
          <button 
            onClick={handleLogout} 
            className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            লগ আউট
          </button>
        </div>
      </header>

      {/* Dashboard Main Content (This renders Consumer/Seller/Agent Dashboard) */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}