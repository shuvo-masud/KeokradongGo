import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase, PlatformSettings } from '../lib/supabase'

export default function SuperAdminDashboard() {
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'settings'
  if (tab === 'metrics') return <MetricsView />
  return <SettingsView />
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
