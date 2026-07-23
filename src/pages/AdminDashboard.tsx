import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase, Profile, District, Dispute, Order, Product } from '../lib/supabase'

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'users'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setSearchParams({ tab: 'users' })}
          className={tab === 'users' ? 'btn-primary' : 'btn-outline'}
        >
          Users
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'orders' })}
          className={tab === 'orders' ? 'btn-primary' : 'btn-outline'}
        >
          Orders
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'pending_products' })}
          className={tab === 'pending_products' ? 'btn-primary' : 'btn-outline'}
        >
          Pending Products
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'disputes' })}
          className={tab === 'disputes' ? 'btn-primary' : 'btn-outline'}
        >
          Disputes
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'analytics' })}
          className={tab === 'analytics' ? 'btn-primary' : 'btn-outline'}
        >
          Analytics
        </button>
      </div>

      {tab === 'orders' && <OrdersManagement />}
      {tab === 'users' && <UsersView />}
      {tab === 'pending_products' && <PendingProductsView />}
      {tab === 'disputes' && <DisputesView />}
      {tab === 'analytics' && <AnalyticsView />}
    </div>
  )
}

function PendingProductsView() {
  const [pendingProducts, setPendingProducts] = useState<(Product & { district?: District; seller?: Profile; assigned_agent?: Profile })[]>([])
  const [agents, setAgents] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  
  const [selectedProduct, setSelectedProduct] = useState<(Product & { district?: District; seller?: Profile }) | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState('')

  const loadPending = useCallback(async () => {
    setLoading(true)
    try {
      const [prodRes, agentRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, district:districts(*), seller:profiles!seller_id(*), assigned_agent:profiles!assigned_agent_id(*)')
          .eq('verification_status', 'pending')
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('*')
          .eq('role', 'agent')
          .eq('status', 'active')
      ])

      setPendingProducts(prodRes.data || [])
      setAgents(agentRes.data || [])
    } catch (err) {
      console.error('Error loading pending products:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPending()
  }, [loadPending])

  async function handleDirectApprove(productId: string) {
    const { error } = await supabase
      .from('products')
      .update({ 
        verification_status: 'verified',
        verified_at: new Date().toISOString()
      })
      .eq('id', productId)

    if (error) {
      alert(error.message)
      return
    }

    alert('Product successfully verified!')
    loadPending()
  }

  async function handleAssignAgent(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProduct || !selectedAgentId) return

    const { error } = await supabase
      .from('products')
      .update({ 
        assigned_agent_id: selectedAgentId
      })
      .eq('id', selectedProduct.id)

    if (error) {
      alert(error.message)
      return
    }

    await supabase.from('notifications').insert({
      user_id: selectedAgentId,
      type: 'verification',
      title: 'New Product Inspection Assigned',
      body: `You have been assigned to inspect: "${selectedProduct.title}".`
    })

    alert('Agent successfully assigned for verification!')
    setSelectedProduct(null)
    setSelectedAgentId('')
    loadPending()
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading pending products...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-bold text-2xl">Pending Products Verification</h1>
          <p className="text-gray-500 text-sm mt-1">Review new listings, assign field agents, or approve products</p>
        </div>
        <button onClick={loadPending} className="btn-outline text-xs">🔄 Refresh</button>
      </div>

      {pendingProducts.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No pending products waiting for verification.</div>
      ) : (
        <div className="space-y-4">
          {pendingProducts.map(p => (
            <div key={p.id} className="card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <img 
                  src={p.image_url || 'https://images.pexels.com/photos/4198023/pexels-photo-4198023.jpeg?auto=compress&cs=tinysrgb&w=600'} 
                  alt={p.title} 
                  className="w-16 h-16 rounded-xl object-cover border" 
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="badge-gray text-[10px] uppercase">{p.category || 'General'}</span>
                    <span className="text-xs text-gray-400">📍 {p.district?.name || 'District unassigned'}</span>
                  </div>
                  <h3 className="font-bold text-base">{p.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1">{p.description}</p>
                  <div className="text-xs font-bold text-primary-600">৳{p.price} | Stock: {p.stock ?? 0}</div>
                  <div className="text-[11px] text-gray-400">
                    Seller: <strong className="text-gray-600">{p.seller?.full_name || 'Unknown'}</strong> | 
                    Assigned Agent: <strong className="text-indigo-600">{p.assigned_agent?.full_name || 'None'}</strong>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto justify-end shrink-0">
                <button 
                  onClick={() => setSelectedProduct(p)}
                  className="btn-outline text-xs py-1.5 px-3"
                >
                  Assign Agent
                </button>
                <button 
                  onClick={() => handleDirectApprove(p.id)}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  Approve Directly
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Agent Assignment Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <div className="card max-w-md w-full p-6 space-y-4 bg-white" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg">Assign Inspection Agent</h3>
              <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="text-xs text-gray-500">
              Product: <strong className="text-gray-800">{selectedProduct.title}</strong>
            </div>

            <form onSubmit={handleAssignAgent} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Select Active Agent:</label>
                <select 
                  className="input w-full text-sm"
                  value={selectedAgentId}
                  onChange={e => setSelectedAgentId(e.target.value)}
                  required
                >
                  <option value="">-- Choose agent --</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.full_name} ({a.email})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setSelectedProduct(null)} className="btn-outline flex-1 text-xs py-2">Cancel</button>
                <button type="submit" className="btn-primary flex-1 text-xs py-2">Confirm Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function OrdersManagement() {
  const [orders, setOrders] = useState<any[]>([])
  const [agents, setAgents] = useState<Profile[]>([])
  const [status, setStatus] = useState('pending')
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)

  const load = useCallback(async () => {
    const { data: ordersData } = await supabase
      .from('orders')
      .select(`
        *,
        buyer:profiles!buyer_id(*),
        assigned_agent:profiles!assigned_agent_id(*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    setOrders(ordersData || [])

    const { data: agentData } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'agent')
      .eq('status', 'active')

    setAgents(agentData || [])
  }, [status])

  useEffect(() => {
    load()
  }, [load])

  async function openOrderDetails(order: any) {
    setSelectedOrder(order)
    setLoadingDetails(true)
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          unit_price,
          district_id,
          products(
            title,
            image_url
          )
        `)
        .eq('order_id', order.id)

      if (error) throw error
      setOrderItems(data || [])
    } catch (err) {
      console.error("Failed to load order items:", err)
    } finally {
      setLoadingDetails(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">Order Management</h1>
        <p className="text-gray-500 text-sm mt-1">Review system orders, filter statuses, and assign delivery agents. Click any order for full details.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['pending', 'assigned', 'confirmed', 'shipped', 'delivered', 'on_delivery', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${status === s ? 'bg-primary-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No {status.replace('_', ' ')} orders found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map(order => (
            <div 
              key={order.id} 
              onClick={() => openOrderDetails(order)}
              className="card p-5 space-y-4 cursor-pointer hover:border-primary-500 transition-all border border-gray-100 shadow-xs bg-white rounded-2xl flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-gray-500">#{order.id.slice(0, 8)}</span>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                    order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                    order.status === 'on_delivery' || order.status === 'shipped' ? 'bg-blue-50 text-blue-700' :
                    order.status === 'cancelled' ? 'bg-rose-50 text-rose-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800">{order.buyer?.full_name || 'Customer'}</h3>
                  <p className="text-xs text-gray-500 truncate">{order.shipping_address}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
                <span className="font-bold text-primary-600 text-sm">
                  ৳{order.total?.toFixed(0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ORDER DETAILS MODAL / SLIDER */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-end animate-fadeIn">
          <div className="bg-white w-full max-w-xl h-full overflow-y-auto p-6 space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-gray-400 uppercase">Admin Order Review</span>
                  <h2 className="text-xl font-bold text-gray-800">#{selectedOrder.id}</h2>
                  <p className="text-xs text-gray-500">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Customer & Shipping Info */}
              <div className="space-y-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Customer & Payment Info</h3>
                <div className="text-xs space-y-1.5 text-gray-700">
                  <p><strong>Name:</strong> {selectedOrder.buyer?.full_name || 'N/A'}</p>
                  <p><strong>Phone:</strong> {selectedOrder.buyer?.phone || selectedOrder.payment_mobile || 'N/A'}</p>
                  <p><strong>Address:</strong> {selectedOrder.shipping_address}</p>
                  <p><strong>Payment Method:</strong> <span className="uppercase font-bold text-primary-700">{selectedOrder.payment_method || 'Cash'}</span></p>
                  {selectedOrder.transaction_id && (
                    <p><strong>TrxID:</strong> <span className="font-mono bg-white px-1.5 py-0.5 rounded border">{selectedOrder.transaction_id}</span></p>
                  )}
                  <p><strong>Assigned Agent:</strong> <span className="font-semibold text-indigo-700">{selectedOrder.assigned_agent?.full_name || 'Not assigned yet'}</span></p>
                </div>
              </div>

              {/* Assign Agent Box if pending or can reassign */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Assign / Reassign Delivery Agent</label>
                <AssignAgentBox orderId={selectedOrder.id} agents={agents} onAssigned={() => { load(); setSelectedOrder(null); }} />
              </div>

              {/* Order Items List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Ordered Products</h3>
                {loadingDetails ? (
                  <p className="text-xs text-gray-400 text-center py-4">Loading items...</p>
                ) : (
                  <div className="space-y-2">
                    {orderItems.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <img 
                          src={item.products?.image_url || '/placeholder.png'} 
                          alt="" 
                          className="w-14 h-14 rounded-lg object-cover bg-white border"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs text-gray-800 truncate">{item.products?.title}</h4>
                          <p className="text-[11px] text-gray-500">Qty: {item.quantity} × ৳{item.unit_price}</p>
                        </div>
                        <div className="font-bold text-xs text-primary-600">
                          ৳{(item.quantity * item.unit_price).toFixed(0)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Summary */}
            <div className="border-t pt-4 space-y-2 bg-white sticky bottom-0">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Subtotal / Shipping</span>
                <span>৳{(selectedOrder.total - (selectedOrder.shipping_cost || 0)).toFixed(0)} + ৳{selectedOrder.shipping_cost || 0}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-800">
                <span>Total Amount</span>
                <span className="text-primary-600">৳{selectedOrder.total?.toFixed(0)}</span>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition-colors mt-2"
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

function AssignAgentBox({ orderId, agents, onAssigned }: { orderId: string; agents: Profile[]; onAssigned: () => void }) {
  const [selectedAgent, setSelectedAgent] = useState('')

  async function assign() {
    if (!selectedAgent) {
      alert('Please select an agent')
      return
    }
    const { error } = await supabase
      .from('orders')
      .update({
        assigned_agent_id: selectedAgent,
        assigned_at: new Date().toISOString(),
        status: 'assigned'
      })
      .eq('id', orderId)

    if (error) {
      alert(error.message)
      return
    }

    await supabase.from('notifications').insert({
      user_id: selectedAgent,
      type: 'order',
      title: 'New Delivery Assigned',
      body: 'A new order has been assigned to you by admin.'
    })

    alert('Agent assigned successfully')
    onAssigned()
  }

  return (
    <div className="flex gap-3 items-center">
      <select className="input flex-1 text-sm bg-white" value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
        <option value="">Select delivery agent</option>
        {agents.map(agent => (
          <option key={agent.id} value={agent.id}>{agent.full_name} ({agent.email})</option>
        ))}
      </select>
      <button onClick={assign} className="btn-primary text-xs py-2 px-4 whitespace-nowrap" disabled={!selectedAgent}>Assign Agent</button>
    </div>
  )
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

 async function updateStatus(userId: string, status: 'active' | 'pending' | 'suspended') {
  const { data: targetUser, error: fetchError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (fetchError) {
    alert(fetchError.message)
    return
  }

  if (!['seller', 'agent'].includes(targetUser.role)) {
    alert('You are only allowed to change the status of sellers and agents.')
    return
  }

  const { error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', userId)

  if (error) {
    alert(error.message)
    return
  }

  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'account',
    title: status === 'active' ? 'Account Approved' : 'Account Suspended',
    body: status === 'active' ? 'Your account has been approved by an administrator.' : 'Your account has been suspended.',
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
                  <div className="text-xs text-gray-500 mt-0.5">By {d.buyer?.full_name} · Order #{d.order_id.slice(0, 8)}</div>
                </div>
                <span className={STATUS_COLORS[d.status]}>{d.status}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{d.description}</p>
              {d.resolution && <div className="text-sm p-3 rounded-xl bg-gray-50 mb-3"><span className="font-medium">Resolution:</span> {d.resolution}</div>}
              {['open', 'investigating'].includes(d.status) && (
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(d.id, 'investigating', d.resolution || 'Under investigation')} className="btn-outline text-xs py-1.5">Mark Investigating</button>
                  <button onClick={() => {
                    const res = prompt('Enter resolution:')
                    if (res) updateStatus(d.id, 'resolved', res)
                  }} className="btn-primary text-xs py-1.5">Resolve</button>
                  <button onClick={() => updateStatus(d.id, 'closed', d.resolution || 'Case closed')} className="btn-ghost text-xs py-1.5">Close</button>
                </div>
              )}
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
        totalRevenue: orderList.reduce((s: number, o: any) => s + (o.total || 0), 0),
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