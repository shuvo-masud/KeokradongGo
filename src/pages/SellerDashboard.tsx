import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase, Product, District, Profile } from '../lib/supabase'

const CATEGORIES = ['Fruits', 'Textiles', 'Fish', 'Tea', 'Handicraft', 'Spices', 'Other']
const PRODUCT_IMAGES: Record<string, string> = {
  Fruits: 'https://images.pexels.com/photos/918843/pexels-photo-918843.jpeg?auto=compress&cs=tinysrgb&w=600',
  Textiles: 'https://images.pexels.com/photos/57840/pexels-photo-57840.jpeg?auto=compress&cs=tinysrgb&w=600',
  Fish: 'https://images.pexels.com/photos/3296394/pexels-photo-3296394.jpeg?auto=compress&cs=tinysrgb&w=600',
  Tea: 'https://images.pexels.com/photos/230477/pexels-photo-230477.jpeg?auto=compress&cs=tinysrgb&w=600',
  Handicraft: 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&w=600',
  Spices: 'https://images.pexels.com/photos/1340116/pexels-photo-1340116.jpeg?auto=compress&cs=tinysrgb&w=600',
  Other: 'https://images.pexels.com/photos/4198023/pexels-photo-4198023.jpeg?auto=compress&cs=tinysrgb&w=600',
}

export default function SellerDashboard() {
  const { profile } = useAuth()
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'overview'

  if (profile?.status === 'pending') {
    return (
      <div className="max-w-lg mx-auto mt-20 card p-10 text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="font-display font-bold text-xl mb-2">Account Pending Approval</h2>
        <p className="text-gray-500 text-sm">Your seller account is under review by an admin. You'll receive a notification once approved.</p>
      </div>
    )
  }

  if (profile?.status === 'suspended') {
    return (
      <div className="max-w-lg mx-auto mt-20 card p-10 text-center">
        <div className="text-5xl mb-4">🚫</div>
        <h2 className="font-display font-bold text-xl mb-2">Account Suspended</h2>
        <p className="text-gray-500 text-sm">Your account has been suspended. Please contact support for assistance.</p>
      </div>
    )
  }

  if (tab === 'add') return <AddProductView />
  if (tab === 'products') return <ProductsView />
  if (tab === 'orders') return <SellerOrdersView />
  return <OverviewView />
}

function OverviewView() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({ totalProducts: 0, verifiedProducts: 0, pendingProducts: 0, totalRevenue: 0, pendingOrders: 0 })

  useEffect(() => {
    if (!profile) return
    async function load() {
      const [products, orders] = await Promise.all([
        supabase.from('products').select('*').eq('seller_id', profile!.id),
        supabase.from('order_items').select('quantity, unit_price, order:orders(status)').eq('seller_id', profile!.id),
      ])
      const prods = products.data ?? []
      const orderItems = orders.data ?? []
      const revenue = orderItems.reduce((sum: number, oi: any) => sum + oi.quantity * oi.unit_price, 0)
      const pending = orderItems.filter((oi: any) => oi.order?.status === 'pending').length
      setStats({
        totalProducts: prods.length,
        verifiedProducts: prods.filter((p: any) => p.verification_status === 'verified').length,
        pendingProducts: prods.filter((p: any) => p.verification_status === 'pending').length,
        totalRevenue: revenue,
        pendingOrders: pending,
      })
    }
    load()
  }, [profile])

  const cards = [
    { label: 'Total Products', value: stats.totalProducts, icon: '🏷️', color: 'bg-ocean-50 text-ocean-700' },
    { label: 'Verified', value: stats.verifiedProducts, icon: '✓', color: 'bg-primary-50 text-primary-700' },
    { label: 'Pending Verification', value: stats.pendingProducts, icon: '⏳', color: 'bg-accent-50 text-accent-700' },
    { label: 'Total Revenue', value: `৳${stats.totalRevenue.toFixed(0)}`, icon: '💰', color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: '📦', color: 'bg-blue-50 text-blue-700' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">Seller Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{profile?.business_name} — Monitor your store performance</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map(c => (
          <div key={c.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center text-lg mb-3`}>{c.icon}</div>
            <div className="text-2xl font-display font-bold">{c.value}</div>
            <div className="text-xs text-gray-500 mt-1">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="card p-6">
        <h2 className="font-display font-bold text-lg mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { href: '/dashboard?tab=add', icon: '➕', title: 'Add New Product', desc: 'List a new authentic item' },
            { href: '/dashboard?tab=products', icon: '🏷️', title: 'Manage Products', desc: 'View and edit your listings' },
            { href: '/dashboard?tab=orders', icon: '📦', title: 'View Orders', desc: 'Track customer orders' },
          ].map(a => (
            <a key={a.href} href={a.href} className="card p-4 hover:shadow-md transition-shadow border-2 border-dashed border-gray-200 text-center">
              <div className="text-3xl mb-2">{a.icon}</div>
              <div className="font-semibold text-sm">{a.title}</div>
              <div className="text-xs text-gray-500 mt-1">{a.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function AddProductView() {
  const { profile } = useAuth()
  const [districts, setDistricts] = useState<District[]>([])
  const [agents, setAgents] = useState<Profile[]>([])
  const [form, setForm] = useState({ title: '', description: '', price: '', category: 'Fruits', districtId: '', stock: '1', imageUrl: '' })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('districts').select('*').order('name').then(({ data }) => setDistricts(data ?? []))
  }, [])

  useEffect(() => {
    if (!form.districtId) { setAgents([]); return }
    supabase.from('profiles').select('*').eq('role', 'agent').eq('district_id', form.districtId).eq('status', 'active').then(({ data }) => setAgents(data ?? []))
  }, [form.districtId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setError(null)
    const assignedAgent = agents.length > 0 ? agents[0].id : null
    const { error: insertError } = await supabase.from('products').insert({
      seller_id: profile.id,
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      district_id: form.districtId,
      stock: parseInt(form.stock),
      image_url: form.imageUrl || PRODUCT_IMAGES[form.category],
      assigned_agent_id: assignedAgent,
      verification_status: 'pending',
    })
    if (insertError) { setError(insertError.message); setSaving(false); return }
    if (assignedAgent) {
      await supabase.from('notifications').insert({
        user_id: assignedAgent,
        type: 'verification',
        title: 'New product to verify',
        body: `"${form.title}" needs inspection in your district`,
      })
    }
    setSuccess(true)
    setForm({ title: '', description: '', price: '', category: 'Fruits', districtId: '', stock: '1', imageUrl: '' })
    setSaving(false)
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto card p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="font-display font-bold text-xl mb-2">Product Listed Successfully!</h2>
        <p className="text-gray-500 text-sm mb-6">Your product has been assigned to a district agent for verification.</p>
        <div className="flex gap-3 justify-center">
          <a href="/dashboard?tab=products" className="btn-primary">View My Products</a>
          <button onClick={() => setSuccess(false)} className="btn-outline">Add Another</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">Add New Product</h1>
        <p className="text-gray-500 text-sm mt-1">List an authentic item with its district of origin</p>
      </div>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}
        <div>
          <label className="label">Product Title</label>
          <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Rajshahi Mangoes — Gopalbhog Variety" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[100px]" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required placeholder="Describe your product, its authenticity, and origin story..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Price (৳)</label>
            <input type="number" className="input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required min="1" step="0.01" placeholder="500" />
          </div>
          <div>
            <label className="label">Stock Quantity</label>
            <input type="number" className="input" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required min="1" placeholder="10" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">District of Origin</label>
            <select className="input" value={form.districtId} onChange={e => setForm({ ...form, districtId: e.target.value })} required>
              <option value="">Select district</option>
              {districts.map(d => <option key={d.id} value={d.id}>{d.name} — {d.division}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Image URL (optional)</label>
          <input className="input" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="Leave blank to use a default category image" />
        </div>
        {form.districtId && (
          <div className="p-3 rounded-xl bg-ocean-50 border border-ocean-100 text-sm text-ocean-700">
            {agents.length > 0 ? `✓ ${agents.length} agent(s) available in this district. Your product will be auto-assigned for verification.` : 'No agents available in this district yet. Your product will be listed as pending.'}
          </div>
        )}
        <button type="submit" className="btn-primary w-full py-3" disabled={saving}>{saving ? 'Saving...' : 'List Product'}</button>
      </form>
    </div>
  )
}

function EditProductModal({ product, districts, onClose, onSaved }: { product: Product & { district: District }; districts: District[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: product.title,
    description: product.description,
    price: product.price.toString(),
    stock: product.stock.toString(),
    category: product.category,
    districtId: product.district_id,
    imageUrl: product.image_url || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const { error: updateError } = await supabase.from('products').update({
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      category: form.category,
      district_id: form.districtId,
      image_url: form.imageUrl || PRODUCT_IMAGES[form.category],
    }).eq('id', product.id)
    if (updateError) { setError(updateError.message); setSaving(false); return }
    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">Edit Product</h2>
            <button onClick={onClose} className="btn-ghost p-2">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}
            <div>
              <label className="label">Product Title</label>
              <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input min-h-[80px]" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Price (৳)</label>
                <input type="number" className="input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required min="1" step="0.01" />
              </div>
              <div>
                <label className="label">Stock</label>
                <input type="number" className="input" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required min="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Category</label>
                <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">District</label>
                <select className="input" value={form.districtId} onChange={e => setForm({ ...form, districtId: e.target.value })} required>
                  {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Image URL</label>
              <input className="input" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="Leave blank to use a default" />
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}

function ProductsView() {
  const { profile } = useAuth()
  const [products, setProducts] = useState<(Product & { district: District })[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [editProduct, setEditProduct] = useState<(Product & { district: District }) | null>(null)

  const load = useCallback(async () => {
    if (!profile) return
    const [prodRes, distRes] = await Promise.all([
      supabase.from('products').select('*, district:districts(*)').eq('seller_id', profile.id).order('created_at', { ascending: false }),
      supabase.from('districts').select('*').order('name'),
    ])
    setProducts(prodRes.data as any ?? [])
    setDistricts(distRes.data ?? [])
  }, [profile])

  useEffect(() => { load() }, [load])

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product? This cannot be undone.')) return
    await supabase.from('products').delete().eq('id', id)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">My Products</h1>
        <a href="/dashboard?tab=add" className="btn-primary">+ Add Product</a>
      </div>
      {products.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No products yet. Click "Add Product" to list your first item.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.id} className="card overflow-hidden">
              <div className="h-40 bg-gray-100 relative">
                <img src={p.image_url || PRODUCT_IMAGES[p.category]} alt={p.title} className="w-full h-full object-cover" />
                {p.verification_status === 'verified' && <span className="absolute top-2 right-2 badge-green">Verified</span>}
                {p.verification_status === 'pending' && <span className="absolute top-2 right-2 badge-orange">Pending</span>}
                {p.verification_status === 'rejected' && <span className="absolute top-2 right-2 badge-red">Rejected</span>}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm truncate">{p.title}</h3>
                <div className="text-xs text-gray-500 mt-1">📍 {p.district.name} · {p.category}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-display font-bold text-lg text-primary-700">৳{p.price.toFixed(0)}</span>
                  <span className="text-xs text-gray-400">{p.stock} in stock</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setEditProduct(p)} className="btn-outline flex-1 text-xs">Edit</button>
                  <button onClick={() => deleteProduct(p.id)} className="btn-ghost flex-1 text-xs text-red-500">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {editProduct && <EditProductModal product={editProduct} districts={districts} onClose={() => setEditProduct(null)} onSaved={load} />}
    </div>
  )
}

function SellerOrdersView() {
  const { profile } = useAuth()
  const [orders, setOrders] = useState<any[]>([])

  const load = useCallback(async () => {
    if (!profile) return
    const { data } = await supabase.from('order_items').select('*, order:orders(*), product:products(*)').eq('seller_id', profile.id).order('created_at', { ascending: false })
    setOrders(data ?? [])
  }, [profile])

  useEffect(() => { load() }, [load])

  const STATUS_LABELS: Record<string, string> = { pending: 'Pending', confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' }

  async function updateOrderStatus(orderId: string, status: string, buyerId: string) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (!error) {
      await supabase.from('notifications').insert({
        user_id: buyerId,
        type: 'order',
        title: `Order ${status}`,
        body: `Your order #${orderId.slice(0, 8)} has been ${status}.`,
      })
      load()
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl">Customer Orders</h1>
      {orders.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No orders yet.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((oi: any) => (
            <div key={oi.id} className="card p-4 flex items-center gap-4">
              <img src={oi.product?.image_url || PRODUCT_IMAGES[oi.product?.category]} alt={oi.product?.title} className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{oi.product?.title}</div>
                <div className="text-xs text-gray-500">Qty: {oi.quantity} × ৳{oi.unit_price.toFixed(0)} = ৳{(oi.quantity * oi.unit_price).toFixed(0)}</div>
                <div className="text-xs text-gray-400 mt-0.5">Order #{oi.order_id.slice(0, 8)} · {new Date(oi.created_at).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${oi.order?.status === 'delivered' ? 'badge-green' : oi.order?.status === 'cancelled' ? 'badge-red' : 'badge-blue'}`}>{STATUS_LABELS[oi.order?.status]}</span>
                {oi.order?.status === 'pending' && (
                  <button onClick={() => updateOrderStatus(oi.order_id, 'confirmed', oi.order?.buyer_id)} className="btn-primary text-xs py-1.5 px-3">Confirm</button>
                )}
                {oi.order?.status === 'confirmed' && (
                  <button onClick={() => updateOrderStatus(oi.order_id, 'shipped', oi.order?.buyer_id)} className="btn-primary text-xs py-1.5 px-3">Ship</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
