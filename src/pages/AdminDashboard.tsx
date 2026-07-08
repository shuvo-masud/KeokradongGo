import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase, Profile, District, Dispute, Order } from '../lib/supabase'

export default function AdminDashboard() {
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'users'
  if (tab === 'disputes') return <DisputesView />
  if (tab === 'analytics') return <AnalyticsView />
  return <UsersView />
}

function UsersView() {
  const { profile: admin } = useAuth()
  const [users, setUsers] = useState<Profile[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [filter, setFilter] = useState('all')

  const load = useCallback(async () => {
    const [userRes, distRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('districts').select('*'),
    ])
    setUsers(userRes.data ?? [])
    setDistricts(distRes.data ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = users.filter(u => {
    if (filter === 'all') return true
    if (filter === 'pending') return u.status === 'pending'
    if (filter === 'sellers') return u.role === 'seller'
    if (filter === 'agents') return u.role === 'agent'
    return true
  })

  async function updateStatus(userId: string, status: string) {
    await supabase.from('profiles').update({ status }).eq('id', userId)
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'account',
      title: status === 'active' ? 'Account Approved' : 'Account Suspended',
      body: status === 'active' ? 'Your account has been approved by admin.' : 'Your account has been suspended. Please contact support.',
    })
    load()
  }

  const districtName = (id: string | null) => districts.find(d => d.id === id)?.name ?? '—'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">User Management</h1>
        <p className="text-gray-500 text-sm mt-1">Approve or suspend sellers and agents based on background checks</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'sellers', 'agents'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f}</button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="text-left p-3 font-semibold">Name</th>
                <th className="text-left p-3 font-semibold">Role</th>
                <th className="text-left p-3 font-semibold">District</th>
                <th className="text-left p-3 font-semibold">Business/NID</th>
                <th className="text-left p-3 font-semibold">Status</th>
                <th className="text-right p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium">{u.full_name}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </td>
                  <td className="p-3"><span className="badge-gray capitalize">{u.role}</span></td>
                  <td className="p-3 text-gray-600">{districtName(u.district_id)}</td>
                  <td className="p-3 text-gray-600 text-xs">
                    {u.business_name && <div>{u.business_name}</div>}
                    {u.national_id && <div className="text-gray-400">NID: {u.national_id}</div>}
                  </td>
                  <td className="p-3">
                    <span className={`badge ${u.status === 'active' ? 'badge-green' : u.status === 'pending' ? 'badge-orange' : 'badge-red'}`}>{u.status}</span>
                  </td>
                  <td className="p-3 text-right">
                    {u.id !== admin?.id && (
                      <div className="flex gap-1 justify-end">
                        {u.status !== 'active' && <button onClick={() => updateStatus(u.id, 'active')} className="btn-primary text-xs py-1 px-2">Approve</button>}
                        {u.status === 'active' && <button onClick={() => updateStatus(u.id, 'suspended')} className="btn-outline text-xs py-1 px-2 text-red-600 border-red-200">Suspend</button>}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function DisputesView() {
  const { profile: admin } = useAuth()
  const [disputes, setDisputes] = useState<(Dispute & { buyer: Profile; order: Order })[]>([])

  const load = useCallback(async () => {
    const { data } = await supabase.from('disputes').select('*, buyer:profiles!buyer_id(*), order:orders(*)').order('created_at', { ascending: false })
    setDisputes(data as any ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  async function updateStatus(id: string, status: string, resolution: string) {
    await supabase.from('disputes').update({
      status,
      resolution,
      resolved_at: status === 'resolved' || status === 'closed' ? new Date().toISOString() : null,
    }).eq('id', id)
    const dispute = disputes.find(d => d.id === id)
    if (dispute) {
      await supabase.from('notifications').insert({
        user_id: dispute.buyer_id,
        type: 'dispute',
        title: `Dispute ${status}`,
        body: resolution || `Your dispute has been updated to: ${status}`,
      })
    }
    load()
  }

  const STATUS_COLORS: Record<string, string> = { open: 'badge-red', investigating: 'badge-orange', resolved: 'badge-green', closed: 'badge-gray' }

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl">Dispute Resolution</h1>
      {disputes.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No disputes filed.</div>
      ) : (
        <div className="space-y-4">
          {disputes.map(d => (
            <div key={d.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold">{d.subject}</div>
                  <div className="text-xs text-gray-500 mt-0.5">By {d.buyer?.full_name} · Order #{d.order_id.slice(0, 8)} · {new Date(d.created_at).toLocaleDateString()}</div>
                </div>
                <span className={STATUS_COLORS[d.status]}>{d.status}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{d.description}</p>
              {d.resolution && <div className="text-sm p-3 rounded-xl bg-gray-50 mb-3"><span className="font-medium">Resolution:</span> {d.resolution}</div>}
              {d.status === 'open' || d.status === 'investigating' ? (
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(d.id, 'investigating', d.resolution || 'Under investigation')} className="btn-outline text-xs py-1.5">Mark Investigating</button>
                  <button onClick={() => {
                    const res = prompt('Enter resolution:')
                    if (res) updateStatus(d.id, 'resolved', res)
                  }} className="btn-primary text-xs py-1.5">Resolve</button>
                  <button onClick={() => updateStatus(d.id, 'closed', d.resolution || 'Case closed')} className="btn-ghost text-xs py-1.5">Close</button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AnalyticsView() {
  const [stats, setStats] = useState({
    totalOrders: 0, totalRevenue: 0, totalUsers: 0, totalProducts: 0, verifiedProducts: 0, totalAgents: 0,
  })
  const [districtStats, setDistrictStats] = useState<{ name: string; products: number; orders: number }[]>([])

  useEffect(() => {
    async function load() {
      const [orders, products, users, districts] = await Promise.all([
        supabase.from('orders').select('total'),
        supabase.from('products').select('id, district_id, verification_status'),
        supabase.from('profiles').select('id, role, district_id'),
        supabase.from('districts').select('*'),
      ])
      const orderList = orders.data ?? []
      const productList = products.data ?? []
      const userList = users.data ?? []
      const distList = districts.data ?? []

      setStats({
        totalOrders: orderList.length,
        totalRevenue: orderList.reduce((s: number, o: any) => s + o.total, 0),
        totalUsers: userList.length,
        totalProducts: productList.length,
        verifiedProducts: productList.filter((p: any) => p.verification_status === 'verified').length,
        totalAgents: userList.filter((u: any) => u.role === 'agent').length,
      })

      const distStats = distList.map((d: any) => ({
        name: d.name,
        products: productList.filter((p: any) => p.district_id === d.id).length,
        orders: 0,
      })).filter((d: any) => d.products > 0).sort((a: any, b: any) => b.products - a.products)
      setDistrictStats(distStats)
    }
    load()
  }, [])

  const cards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: 'bg-ocean-50 text-ocean-700' },
    { label: 'Total Revenue', value: `৳${stats.totalRevenue.toFixed(0)}`, icon: '💰', color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'bg-primary-50 text-primary-700' },
    { label: 'Total Products', value: stats.totalProducts, icon: '🏷️', color: 'bg-accent-50 text-accent-700' },
    { label: 'Verified Products', value: stats.verifiedProducts, icon: '✓', color: 'bg-primary-50 text-primary-700' },
    { label: 'Active Agents', value: stats.totalAgents, icon: '🔍', color: 'bg-purple-50 text-purple-700' },
  ]

  const maxProducts = Math.max(...districtStats.map(d => d.products), 1)

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl">District Intelligence</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map(c => (
          <div key={c.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center text-lg mb-3`}>{c.icon}</div>
            <div className="text-xl font-display font-bold">{c.value}</div>
            <div className="text-xs text-gray-500 mt-1">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="card p-6">
        <h2 className="font-display font-bold text-lg mb-4">Top Districts by Product Volume</h2>
        {districtStats.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No district data yet</div>
        ) : (
          <div className="space-y-3">
            {districtStats.map(d => (
              <div key={d.name} className="flex items-center gap-3">
                <div className="w-24 text-sm font-medium">{d.name}</div>
                <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-end px-2 text-white text-xs font-semibold" style={{ width: `${(d.products / maxProducts) * 100}%` }}>{d.products}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
