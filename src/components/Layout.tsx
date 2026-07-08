import { useState, useEffect, ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase, Notification } from '../lib/supabase'

const ROLE_LABELS: Record<string, string> = {
  consumer: 'Consumer',
  seller: 'Seller',
  agent: 'Agent',
  admin: 'Admin',
  super_admin: 'Super Admin',
}

const ROLE_ICONS: Record<string, string> = {
  consumer: '🛍️',
  seller: '🌾',
  agent: '🔍',
  admin: '🛡️',
  super_admin: '👑',
}

export default function Layout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!profile) return
    const uid = profile.id
    async function loadNotifs() {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(20)
      setNotifications(data ?? [])
    }
    loadNotifs()
    const channel = supabase.channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` }, loadNotifs)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [profile])

  if (!profile) return null

  const unreadCount = notifications.filter(n => !n.read).length

  async function markAllRead() {
    if (!profile) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', profile.id).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-40 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center gap-2 px-5 border-b border-gray-200">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-lg">B</div>
          <span className="font-display font-bold text-lg">BongoBazar</span>
        </div>
        <nav className="p-3 space-y-1">
          <button onClick={() => { navigate('/dashboard'); setSidebarOpen(false) }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${location.pathname === '/dashboard' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            <span>📊</span> Dashboard
          </button>
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{ROLE_LABELS[profile.role]} Panel</div>
          {profile.role === 'consumer' && (
            <>
              <button onClick={() => { navigate('/dashboard?tab=browse'); setSidebarOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"><span>🛒</span> Browse Products</button>
              <button onClick={() => { navigate('/dashboard?tab=orders'); setSidebarOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"><span>📦</span> My Orders</button>
              <button onClick={() => { navigate('/dashboard?tab=chats'); setSidebarOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"><span>💬</span> Chats</button>
            </>
          )}
          {profile.role === 'seller' && (
            <>
              <button onClick={() => { navigate('/dashboard?tab=products'); setSidebarOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"><span>🏷️</span> My Products</button>
              <button onClick={() => { navigate('/dashboard?tab=add'); setSidebarOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"><span>➕</span> Add Product</button>
              <button onClick={() => { navigate('/dashboard?tab=orders'); setSidebarOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"><span>📦</span> Orders</button>
            </>
          )}
          {profile.role === 'agent' && (
            <>
              <button onClick={() => { navigate('/dashboard?tab=verify'); setSidebarOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"><span>✅</span> Verification Queue</button>
              <button onClick={() => { navigate('/dashboard?tab=earnings'); setSidebarOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"><span>💰</span> Earnings</button>
            </>
          )}
          {profile.role === 'admin' && (
            <>
              <button onClick={() => { navigate('/dashboard?tab=users'); setSidebarOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"><span>👥</span> User Approvals</button>
              <button onClick={() => { navigate('/dashboard?tab=disputes'); setSidebarOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"><span>⚖️</span> Disputes</button>
              <button onClick={() => { navigate('/dashboard?tab=analytics'); setSidebarOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"><span>📈</span> District Intel</button>
            </>
          )}
          {profile.role === 'super_admin' && (
            <>
              <button onClick={() => { navigate('/dashboard?tab=settings'); setSidebarOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"><span>⚙️</span> Platform Settings</button>
              <button onClick={() => { navigate('/dashboard?tab=metrics'); setSidebarOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"><span>📊</span> System Metrics</button>
            </>
          )}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
              {profile.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{profile.full_name}</div>
              <div className="text-xs text-gray-500">{ROLE_ICONS[profile.role]} {ROLE_LABELS[profile.role]}</div>
            </div>
          </div>
          <button onClick={() => signOut()} className="w-full mt-2 btn-ghost text-sm">Sign Out</button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-20 flex items-center justify-between px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-ghost p-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="hidden lg:block">
            <h2 className="font-display font-bold text-lg">Welcome, {profile.full_name.split(' ')[0]}</h2>
          </div>
          <div className="relative">
            <button onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markAllRead() }} className="btn-ghost p-2 relative">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 card shadow-lg max-h-96 overflow-y-auto z-50">
                <div className="p-3 border-b border-gray-100 font-semibold text-sm">Notifications</div>
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-400">No notifications yet</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-3 border-b border-gray-50 hover:bg-gray-50">
                      <div className="text-sm font-medium">{n.title}</div>
                      {n.body && <div className="text-xs text-gray-500 mt-0.5">{n.body}</div>}
                      <div className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </header>
        <main className="p-4 lg:p-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  )
}
