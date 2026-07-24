import { useState, useEffect } from 'react'
import { supabase, PlatformSettings } from '../lib/supabase'
import { useSearchParams, useNavigate } from 'react-router-dom'

export default function SuperAdminDashboard() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const tab = searchParams.get('tab') || 'settings'
  
  return (
    <div className="space-y-6">
      {/* Global Tab Navigation - Update paths to match your active route base */}
      <div className="flex gap-2 border-b border-gray-200 pb-4">
        <button
          onClick={() => navigate('?tab=settings')} // Relative query update keeps you on the same route path
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            tab === 'settings' ? 'bg-primary-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ⚙️ Settings
        </button>
        <button
          onClick={() => navigate('?tab=users')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            tab === 'users' ? 'bg-primary-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          👥 Users Management
        </button>
        <button
          onClick={() => navigate('?tab=metrics')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            tab === 'metrics' ? 'bg-primary-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          📊 Metrics
        </button>
      </div>

      {/* Dynamic Tab Content */}
      {tab === 'metrics' && <MetricsView />}
      {tab === 'users' && <UsersView />}
      {tab === 'settings' && <SettingsView />}
    </div>
  )
}

function SettingsView() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('platform_settings').select('*').maybeSingle().then(({ data }) => setSettings(data as any))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!settings) return
    setSaving(true)
    const { error } = await supabase.from('platform_settings').update({
      tax_percentage: settings.tax_percentage,
      base_shipping_rate: settings.base_shipping_rate,
      agent_commission: settings.agent_commission,
      platform_name: settings.platform_name,
      updated_at: new Date().toISOString(),
    }).eq('id', 1)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  if (!settings) return <div className="text-center py-20 text-gray-400">Loading settings...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">Platform Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure global parameters for the entire marketplace</p>
      </div>

      {saved && <div className="p-3 rounded-xl bg-primary-50 border border-primary-200 text-primary-700 text-sm animate-fade-in">✓ Settings saved successfully</div>}

      <form onSubmit={handleSave} className="card p-6 space-y-5">
        <div>
          <label className="label">Platform Name</label>
          <input className="input" value={settings.platform_name} onChange={e => setSettings({ ...settings, platform_name: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Tax Percentage (%)</label>
            <input type="number" step="0.01" className="input" value={settings.tax_percentage} onChange={e => setSettings({ ...settings, tax_percentage: parseFloat(e.target.value) })} />
          </div>
          <div>
            <label className="label">Base Shipping Rate (৳)</label>
            <input type="number" step="0.01" className="input" value={settings.base_shipping_rate} onChange={e => setSettings({ ...settings, base_shipping_rate: parseFloat(e.target.value) })} />
          </div>
          <div>
            <label className="label">Agent Commission (৳)</label>
            <input type="number" step="0.01" className="input" value={settings.agent_commission} onChange={e => setSettings({ ...settings, agent_commission: parseFloat(e.target.value) })} />
          </div>
        </div>
        <div className="p-4 rounded-xl bg-gray-50 space-y-2 text-sm">
          <div className="font-semibold text-gray-700">Current Configuration Summary:</div>
          <div className="flex justify-between"><span className="text-gray-500">Tax on every order</span><span className="font-medium">{settings.tax_percentage}%</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Shipping per order</span><span className="font-medium">৳{settings.base_shipping_rate.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Agent earns per inspection</span><span className="font-medium">৳{settings.agent_commission.toFixed(2)}</span></div>
        </div>
        <button type="submit" className="btn-primary w-full py-3" disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
      </form>
    </div>
  )
}

function UsersView() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<any | null>(null)

  useEffect(() => {
    async function loadUsers() {
      setLoading(true)
      let query = supabase.from('profiles').select('*, district:districts(name)').order('created_at', { ascending: false })
      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter)
      }
      const { data, error } = await query
      if (error) {
        console.error("Failed to load users:", error.message)
      } else {
        setUsers(data || [])
      }
      setLoading(false)
    }
    loadUsers()
  }, [roleFilter])

  const ROLE_ICONS: Record<string, string> = {
    consumer: '🛍️',
    seller: '🌾',
    agent: '🔍',
    admin: '🛡️',
    super_admin: '👑',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">View, filter and inspect all user profile information</p>
        </div>

        {/* Role Filter Tabs */}
        <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl">
          {['all', 'consumer', 'seller', 'agent', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                roleFilter === r ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {r === 'all' ? 'All Users' : r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No users found for this filter.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (
            <div
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className="card p-5 space-y-3 cursor-pointer hover:border-primary-500 transition-all border border-gray-100 shadow-xs bg-white rounded-2xl flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 flex items-center gap-1">
                    {ROLE_ICONS[u.role] || '👤'} <span className="uppercase">{u.role.replace('_', ' ')}</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                    u.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                    u.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                    'bg-rose-50 text-rose-700'
                  }`}>
                    {u.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 text-base">{u.full_name}</h3>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                <span>📍 {u.district?.name || 'No District'}</span>
                <span>Joined {new Date(u.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* USER PROFILE DETAILS MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-end animate-fadeIn">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto p-6 space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-700">
                    {selectedUser.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selectedUser.full_name}</h2>
                    <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-primary-50 text-primary-700">
                      {selectedUser.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Complete Profile Data Attributes */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Contact & Location</h3>
                  <div className="text-xs space-y-2 text-gray-600">
                    <p className="flex justify-between"><strong>Email:</strong> <span className="font-mono text-gray-800">{selectedUser.email}</span></p>
                    <p className="flex justify-between"><strong>Phone:</strong> <span className="font-mono text-gray-800">{selectedUser.phone || 'N/A'}</span></p>
                    <p className="flex justify-between"><strong>District:</strong> <span className="font-semibold text-primary-600">{selectedUser.district?.name || 'N/A'}</span></p>
                    <p className="flex justify-between"><strong>Account Status:</strong> <span className={`uppercase font-bold ${selectedUser.status === 'active' ? 'text-emerald-600' : 'text-amber-600'}`}>{selectedUser.status}</span></p>
                  </div>
                </div>

                {/* Role Specific Attributes */}
                {(selectedUser.business_name || selectedUser.national_id || selectedUser.seller_products_desc || selectedUser.agent_reason) && (
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
                    <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Role Specific Details</h3>
                    <div className="text-xs space-y-2 text-gray-700">
                      {selectedUser.business_name && (
                        <p><strong>Shop Name:</strong> {selectedUser.business_name}</p>
                      )}
                      {selectedUser.national_id && (
                        <p><strong>NID Number:</strong> <span className="font-mono">{selectedUser.national_id}</span></p>
                      )}
                      {selectedUser.seller_products_desc && (
                        <div>
                          <strong className="block mb-1 text-gray-800">Products / Description (Seller):</strong>
                          <p className="bg-white p-2.5 rounded-lg border border-blue-100 text-gray-600 italic">{selectedUser.seller_products_desc}</p>
                        </div>
                      )}
                      {selectedUser.agent_reason && (
                        <div>
                          <strong className="block mb-1 text-gray-800">Agent Motivation & Bio:</strong>
                          <p className="bg-white p-2.5 rounded-lg border border-blue-100 text-gray-600 italic">{selectedUser.agent_reason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-[11px] text-gray-400 pt-2 flex justify-between">
                  <span>User ID: <span className="font-mono">{selectedUser.id}</span></span>
                  <span>Registered: {new Date(selectedUser.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MetricsView() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0,
    verifiedProducts: 0, pendingProducts: 0, totalAgents: 0, totalSellers: 0,
    totalDisputes: 0, openDisputes: 0,
  })
  const [roleBreakdown, setRoleBreakdown] = useState<{ role: string; count: number }[]>([])

  useEffect(() => {
    async function load() {
      const [users, products, orders, disputes] = await Promise.all([
        supabase.from('profiles').select('role'),
        supabase.from('products').select('verification_status'),
        supabase.from('orders').select('total'),
        supabase.from('disputes').select('status'),
      ])
      const userList = users.data ?? []
      const prodList = products.data ?? []
      const orderList = orders.data ?? []
      const dispList = disputes.data ?? []

      setMetrics({
        totalUsers: userList.length,
        totalProducts: prodList.length,
        totalOrders: orderList.length,
        totalRevenue: orderList.reduce((s: number, o: any) => s + o.total, 0),
        verifiedProducts: prodList.filter((p: any) => p.verification_status === 'verified').length,
        pendingProducts: prodList.filter((p: any) => p.verification_status === 'pending').length,
        totalAgents: userList.filter((u: any) => u.role === 'agent').length,
        totalSellers: userList.filter((u: any) => u.role === 'seller').length,
        totalDisputes: dispList.length,
        openDisputes: dispList.filter((d: any) => d.status === 'open' || d.status === 'investigating').length,
      })

      const roles = ['consumer', 'seller', 'agent', 'admin', 'super_admin']
      setRoleBreakdown(roles.map(r => ({ role: r, count: userList.filter((u: any) => u.role === r).length })))
    }
    load()
  }, [])

  const cards = [
    { label: 'Total Users', value: metrics.totalUsers, icon: '👥', color: 'from-ocean-500 to-ocean-700' },
    { label: 'Total Products', value: metrics.totalProducts, icon: '🏷️', color: 'from-primary-500 to-primary-700' },
    { label: 'Total Orders', value: metrics.totalOrders, icon: '📦', color: 'from-accent-500 to-accent-700' },
    { label: 'Total Revenue', value: `৳${metrics.totalRevenue.toFixed(0)}`, icon: '💰', color: 'from-emerald-500 to-emerald-700' },
  ]

  const ROLE_ICONS: Record<string, string> = { consumer: '🛍️', seller: '🌾', agent: '🔍', admin: '🛡️', super_admin: '👑' }

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl">System Metrics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="card p-5">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-2xl mb-3`}>{c.icon}</div>
            <div className="text-2xl font-display font-bold">{c.value}</div>
            <div className="text-xs text-gray-500 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-display font-bold text-lg mb-4">Product Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary-50">
              <span className="text-sm font-medium text-primary-700">✓ Verified</span>
              <span className="text-xl font-bold text-primary-700">{metrics.verifiedProducts}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-accent-50">
              <span className="text-sm font-medium text-accent-700">⏳ Pending</span>
              <span className="text-xl font-bold text-accent-700">{metrics.pendingProducts}</span>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-display font-bold text-lg mb-4">User Roles</h2>
          <div className="space-y-2">
            {roleBreakdown.map(r => (
              <div key={r.role} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <span className="text-sm flex items-center gap-2">{ROLE_ICONS[r.role]} <span className="capitalize">{r.role.replace('_', ' ')}</span></span>
                <span className="font-semibold">{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-display font-bold text-lg mb-4">Dispute Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
              <span className="text-sm font-medium">Total Disputes</span>
              <span className="text-xl font-bold">{metrics.totalDisputes}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-red-50">
              <span className="text-sm font-medium text-red-700">Open/Investigating</span>
              <span className="text-xl font-bold text-red-700">{metrics.openDisputes}</span>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-display font-bold text-lg mb-4">Marketplace Health</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-ocean-50">
              <span className="text-sm font-medium text-ocean-700">🌾 Active Sellers</span>
              <span className="text-xl font-bold text-ocean-700">{metrics.totalSellers}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50">
              <span className="text-sm font-medium text-purple-700">🔍 Active Agents</span>
              <span className="text-xl font-bold text-purple-700">{metrics.totalAgents}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}