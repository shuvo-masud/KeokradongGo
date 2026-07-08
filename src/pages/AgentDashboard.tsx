import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase, Product, District, Verification, Profile, PlatformSettings } from '../lib/supabase'

const PRODUCT_IMAGES: Record<string, string> = {
  Fruits: 'https://images.pexels.com/photos/918843/pexels-photo-918843.jpeg?auto=compress&cs=tinysrgb&w=600',
  Textiles: 'https://images.pexels.com/photos/57840/pexels-photo-57840.jpeg?auto=compress&cs=tinysrgb&w=600',
  Fish: 'https://images.pexels.com/photos/3296394/pexels-photo-3296394.jpeg?auto=compress&cs=tinysrgb&w=600',
  Tea: 'https://images.pexels.com/photos/230477/pexels-photo-230477.jpeg?auto=compress&cs=tinysrgb&w=600',
  Handicraft: 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&w=600',
  Spices: 'https://images.pexels.com/photos/1340116/pexels-photo-1340116.jpeg?auto=compress&cs=tinysrgb&w=600',
  Other: 'https://images.pexels.com/photos/4198023/pexels-photo-4198023.jpeg?auto=compress&cs=tinysrgb&w=600',
}

export default function AgentDashboard() {
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'verify'
  if (tab === 'earnings') return <EarningsView />
  return <VerifyView />
}

function VerifyView() {
  const { profile } = useAuth()
  const [products, setProducts] = useState<(Product & { district: District; seller: Profile })[]>([])
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [inspectProduct, setInspectProduct] = useState<(Product & { district: District; seller: Profile }) | null>(null)

  const load = useCallback(async () => {
    if (!profile?.district_id) return
    const [prodRes, verRes, setRes] = await Promise.all([
      supabase.from('products').select('*, district:districts(*), seller:profiles!seller_id(*)').eq('district_id', profile.district_id).order('created_at', { ascending: false }),
      supabase.from('verifications').select('*').eq('agent_id', profile.id).order('created_at', { ascending: false }),
      supabase.from('platform_settings').select('*').maybeSingle(),
    ])
    setProducts(prodRes.data as any ?? [])
    setVerifications(verRes.data ?? [])
    setSettings(setRes.data as any)
  }, [profile])

  useEffect(() => { load() }, [load])

  const pending = products.filter(p => p.verification_status === 'pending')
  const verified = products.filter(p => p.verification_status === 'verified')
  const rejected = products.filter(p => p.verification_status === 'rejected')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">Verification Center</h1>
        <p className="text-gray-500 text-sm mt-1">Inspect and verify products in your assigned district</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-700 flex items-center justify-center text-lg mb-3">⏳</div>
          <div className="text-2xl font-display font-bold">{pending.length}</div>
          <div className="text-xs text-gray-500 mt-1">Pending Inspection</div>
        </div>
        <div className="card p-5">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center text-lg mb-3">✓</div>
          <div className="text-2xl font-display font-bold">{verified.length}</div>
          <div className="text-xs text-gray-500 mt-1">Verified</div>
        </div>
        <div className="card p-5">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center text-lg mb-3">✕</div>
          <div className="text-2xl font-display font-bold">{rejected.length}</div>
          <div className="text-xs text-gray-500 mt-1">Rejected</div>
        </div>
        <div className="card p-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg mb-3">💰</div>
          <div className="text-2xl font-display font-bold">৳{(verifications.length * (settings?.agent_commission ?? 150)).toFixed(0)}</div>
          <div className="text-xs text-gray-500 mt-1">Total Earnings</div>
        </div>
      </div>

      {/* Pending products */}
      <div>
        <h2 className="font-display font-bold text-lg mb-3">Pending Verification Queue</h2>
        {pending.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">No products pending inspection. Great work!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pending.map(p => (
              <div key={p.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-40 bg-gray-100 relative">
                  <img src={p.image_url || PRODUCT_IMAGES[p.category]} alt={p.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 right-2 badge-orange">Pending</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm truncate">{p.title}</h3>
                  <div className="text-xs text-gray-500 mt-1">📍 {p.district.name} · {p.category}</div>
                  <div className="text-xs text-gray-500 mt-1">Seller: {p.seller.full_name}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-display font-bold text-lg text-primary-700">৳{p.price.toFixed(0)}</span>
                    <span className="text-xs text-gray-400">{p.stock} units</span>
                  </div>
                  <button onClick={() => setInspectProduct(p)} className="btn-primary w-full mt-3 text-sm">Inspect Now</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent verifications */}
      {verifications.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-lg mb-3">Recent Verifications</h2>
          <div className="card divide-y divide-gray-100">
            {verifications.slice(0, 10).map(v => {
              const product = products.find(p => p.id === v.product_id)
              return (
                <div key={v.id} className="p-4 flex items-center gap-3">
                  <span className={`badge ${v.status === 'verified' ? 'badge-green' : 'badge-red'}`}>{v.status === 'verified' ? '✓ Verified' : '✕ Rejected'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{product?.title || 'Product removed'}</div>
                    <div className="text-xs text-gray-500">{v.report}</div>
                  </div>
                  {v.quality_score && <span className="text-sm font-semibold text-primary-700">{v.quality_score}/5</span>}
                  <div className="text-xs text-gray-400">{new Date(v.created_at).toLocaleDateString()}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Inspection modal */}
      {inspectProduct && <InspectModal product={inspectProduct} onClose={() => setInspectProduct(null)} onSubmitted={load} />}
    </div>
  )
}

function InspectModal({ product, onClose, onSubmitted }: { product: Product & { district: District; seller: Profile }; onClose: () => void; onSubmitted: () => void }) {
  const { profile } = useAuth()
  const [status, setStatus] = useState<'verified' | 'rejected'>('verified')
  const [report, setReport] = useState('')
  const [qualityScore, setQualityScore] = useState(5)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    await supabase.from('verifications').insert({
      product_id: product.id,
      agent_id: profile.id,
      status,
      report,
      quality_score: status === 'verified' ? qualityScore : null,
    })
    await supabase.from('products').update({
      verification_status: status,
      verified_at: new Date().toISOString(),
    }).eq('id', product.id)
    // Notify seller
    await supabase.from('notifications').insert({
      user_id: product.seller_id,
      type: 'verification',
      title: status === 'verified' ? 'Product Verified!' : 'Product Rejected',
      body: `"${product.title}" has been ${status} by agent ${profile.full_name}`,
    })
    setSaving(false)
    onSubmitted()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">Inspection Report</h2>
            <button onClick={onClose} className="btn-ghost p-2">✕</button>
          </div>
          <div className="card p-3 mb-4 flex gap-3">
            <img src={product.image_url || PRODUCT_IMAGES[product.category]} alt={product.title} className="w-16 h-16 rounded-lg object-cover" />
            <div>
              <div className="font-semibold text-sm">{product.title}</div>
              <div className="text-xs text-gray-500">📍 {product.district.name} · ৳{product.price.toFixed(0)}</div>
              <div className="text-xs text-gray-500">Seller: {product.seller.full_name}</div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Inspection Result</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setStatus('verified')} className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${status === 'verified' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}>✓ Approve</button>
                <button type="button" onClick={() => setStatus('rejected')} className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${status === 'rejected' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600'}`}>✕ Reject</button>
              </div>
            </div>
            <div>
              <label className="label">Inspection Report</label>
              <textarea className="input min-h-[100px]" value={report} onChange={e => setReport(e.target.value)} required placeholder="Describe your physical inspection findings..." />
            </div>
            {status === 'verified' && (
              <div>
                <label className="label">Quality Score: {qualityScore}/5</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" onClick={() => setQualityScore(n)} className={`w-10 h-10 rounded-lg text-lg font-bold ${n <= qualityScore ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}>★</button>
                  ))}
                </div>
              </div>
            )}
            <button type="submit" className="btn-primary w-full py-3" disabled={saving}>{saving ? 'Submitting...' : 'Submit Inspection'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}

function EarningsView() {
  const { profile } = useAuth()
  const [verifications, setVerifications] = useState<(Verification & { product: Product })[]>([])
  const [settings, setSettings] = useState<PlatformSettings | null>(null)

  useEffect(() => {
    if (!profile) return
    Promise.all([
      supabase.from('verifications').select('*, product:products(*)').eq('agent_id', profile.id).order('created_at', { ascending: false }),
      supabase.from('platform_settings').select('*').maybeSingle(),
    ]).then(([verRes, setRes]) => {
      setVerifications(verRes.data as any ?? [])
      setSettings(setRes.data as any)
    })
  }, [profile])

  const commission = settings?.agent_commission ?? 150
  const totalEarnings = verifications.length * commission
  const verifiedCount = verifications.filter(v => v.status === 'verified').length
  const rejectedCount = verifications.filter(v => v.status === 'rejected').length

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl">Earnings & Commission</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="text-2xl font-display font-bold text-primary-700">৳{totalEarnings.toFixed(0)}</div>
          <div className="text-xs text-gray-500 mt-1">Total Earnings</div>
        </div>
        <div className="card p-5">
          <div className="text-2xl font-display font-bold">{verifications.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total Inspections</div>
        </div>
        <div className="card p-5">
          <div className="text-2xl font-display font-bold text-primary-700">{verifiedCount}</div>
          <div className="text-xs text-gray-500 mt-1">Approved</div>
        </div>
        <div className="card p-5">
          <div className="text-2xl font-display font-bold text-red-600">{rejectedCount}</div>
          <div className="text-xs text-gray-500 mt-1">Rejected</div>
        </div>
      </div>
      <div className="card p-4 bg-gradient-to-r from-primary-50 to-accent-50">
        <div className="flex items-center gap-3">
          <div className="text-2xl">💰</div>
          <div>
            <div className="font-semibold text-sm">Commission Rate: ৳{commission.toFixed(0)} per inspection</div>
            <div className="text-xs text-gray-500">You earn ৳{commission.toFixed(0)} for each product batch you inspect and verify</div>
          </div>
        </div>
      </div>
      <div>
        <h2 className="font-display font-bold text-lg mb-3">Inspection History</h2>
        {verifications.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">No inspections yet. Verify products to start earning!</div>
        ) : (
          <div className="card divide-y divide-gray-100">
            {verifications.map(v => (
              <div key={v.id} className="p-4 flex items-center gap-3">
                <span className={`badge ${v.status === 'verified' ? 'badge-green' : 'badge-red'}`}>{v.status === 'verified' ? '✓ Verified' : '✕ Rejected'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{v.product?.title || 'Product removed'}</div>
                  <div className="text-xs text-gray-500 truncate">{v.report}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-primary-700">+৳{commission.toFixed(0)}</div>
                  <div className="text-xs text-gray-400">{new Date(v.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
