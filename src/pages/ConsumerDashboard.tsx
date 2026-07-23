// Complete updated ConsumerDashboard file with bKash/Rocket/Nagad and Cash 30% advance payment rules added to the CartDrawer component.

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase, Product, District, Order, OrderItem, Profile, Chat, PlatformSettings } from '../lib/supabase'
import SuperAdminDashboard from './SuperAdminDashboard'
import AdminDashboard from './AdminDashboard'
import AgentDashboard from './AgentDashboard'
import SellerDashboard from './SellerDashboard'

const CATEGORIES = ['All', 'Fruits', 'Textiles', 'Fish', 'Tea', 'Handicraft', 'Spices', 'Other']
const CATEGORY_EMOJIS: Record<string, string> = {
  All: '✨', Fruits: '🥭', Textiles: '🥻', Fish: '🐟', Tea: '🍵', Handicraft: '🎨', Spices: '🌶️', Other: '📦'
}

const PRODUCT_IMAGES: Record<string, string> = {
  Fruits: 'https://images.pexels.com/photos/918843/pexels-photo-918843.jpeg?auto=compress&cs=tinysrgb&w=600',
  Textiles: 'https://images.pexels.com/photos/57840/pexels-photo-57840.jpeg?auto=compress&cs=tinysrgb&w=600',
  Fish: 'https://images.pexels.com/photos/3296394/pexels-photo-3296394.jpeg?auto=compress&cs=tinysrgb&w=600',
  Tea: 'https://images.pexels.com/photos/230477/pexels-photo-230477.jpeg?auto=compress&cs=tinysrgb&w=600',
  Handicraft: 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&w=600',
  Spices: 'https://images.pexels.com/photos/1340116/pexels-photo-1340116.jpeg?auto=compress&cs=tinysrgb&w=600',
  Other: 'https://images.pexels.com/photos/4198023/pexels-photo-4198023.jpeg?auto=compress&cs=tinysrgb&w=600',
}

type ExtendedProduct = Product & { district: District; seller: Profile }
type ExtendedOrder = Order & { items: (OrderItem & { product: Product })[] }
type ExtendedChat = Chat & { sender?: Profile; receiver?: Profile; product?: Product }
interface CartItem { product: ExtendedProduct; quantity: number }

export default function ConsumerDashboard() {
  const authContext = useAuth()
  const profile = authContext?.profile

  const [showAdmin, setShowAdmin] = useState(false)
  const [showSuperAdmin, setShowSuperAdmin] = useState(false)
  const [showAgent, setShowAgent] = useState(false)
  const [showSeller, setShowSeller] = useState(false)

  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams?.get('tab') || 'browse'

  if (!authContext || !profile) {
    return (
      <div className="min-h-[60vh] w-full flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm font-medium text-gray-500">নিরাপদ সেশন যাচাই করা হচ্ছে...</p>
      </div>
    )
  }

  if (showSuperAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button className="btn-outline" onClick={() => setShowSuperAdmin(false)}>
            ← Consumer Dashboard
          </button>
        </div>
        <SuperAdminDashboard />
      </div>
    )
  }
 
  if (showAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button className="btn-outline" onClick={() => setShowAdmin(false)}>
            ← Consumer Dashboard
          </button>
        </div>
        <AdminDashboard />
      </div>
    )
  }

  if (showAgent) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button className="btn-outline" onClick={() => setShowAgent(false)}>
            ← Consumer Dashboard
          </button>
        </div>
        <AgentDashboard />
      </div>
    )
  }

  if (showSeller){
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button className="btn-outline" onClick={() => setShowSeller(false)}>
            ← Consumer Dashboard
          </button>
        </div>
        <SellerDashboard/>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex gap-2 sm:gap-4 overflow-x-auto">
          <button
            onClick={() => setSearchParams({ tab: 'browse' })}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
              tab === 'browse' ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            🛍️ পণ্য ব্রাউজ করুন (Browse)
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'orders' })}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
              tab === 'orders' ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            📦 আমার অর্ডার (My Orders)
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'chats' })}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
              tab === 'chats' ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            💬 সরাসরি চ্যাট (Support Chats)
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {profile.role === 'admin' && (
            <button className="btn-primary" onClick={() => setShowAdmin(true)}>
              Admin Dashboard
            </button>
          )}
          {profile.role === 'super_admin' && (
            <button className="btn-primary" onClick={() => setShowSuperAdmin(true)}>
              Super Admin Dashboard
            </button>
          )}
          {profile.role === 'agent' && (
            <button className="btn-primary" onClick={() => setShowAgent(true)}>
              Agent Dashboard
            </button>
          )}
          {profile.role === 'seller' && (
            <button className="btn-primary" onClick={() => setShowSeller(true)}>
              Seller Dashboard
            </button>
          )}
        </div>
      </div>

      {tab === 'orders' && <OrdersView />}
      {tab === 'chats' && <ChatsView />}
      {tab === 'browse' && <BrowseView />}
    </div>
  )
}

function BrowseView() {
  const authContext = useAuth()
  const profile = authContext?.profile

  const [products, setProducts] = useState<ExtendedProduct[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  
  const [category, setCategory] = useState('All')
  const [districtFilter, setDistrictFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ExtendedProduct | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function load() {
      try {
        const [prodRes, distRes, setRes] = await Promise.all([
          supabase.from('products').select('*, district:districts(*), seller:profiles!seller_id(*)').order('created_at', { ascending: false }),
          supabase.from('districts').select('*').order('name'),
          supabase.from('platform_settings').select('*').maybeSingle(),
        ])
        if (isMounted) {
          setProducts((prodRes.data as unknown as ExtendedProduct[]) || [])
          setDistricts(distRes.data || [])
          setSettings(setRes.data as PlatformSettings)
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [])

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (category !== 'All' && p.category !== category) return false
      if (districtFilter !== 'All' && p?.district?.name !== districtFilter) return false
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchTitle = p.title?.toLowerCase().includes(query)
        const matchDistrict = p?.district?.name?.toLowerCase().includes(query)
        const matchCategory = p.category?.toLowerCase().includes(query)
        if (!matchTitle && !matchDistrict && !matchCategory) return false
      }
      return true
    })
  }, [products, category, districtFilter, searchQuery])

  function addToCart(product: ExtendedProduct) {
    if (!product?.id) return
    setCart(prev => {
      const existing = prev.find(c => c.product.id === product.id)
      if (existing) return prev.map(c => c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c)
      return [...prev, { product, quantity: 1 }]
    })
  }

  function updateQty(id: string, delta: number) {
    setCart(prev => prev.map(c => c.product.id === id ? { ...c, quantity: Math.max(1, c.quantity + delta) } : c))
  }

  function removeFromCart(id: string) {
    setCart(prev => prev.filter(c => c.product.id !== id))
  }

  const cartTotal = cart.reduce((sum, c) => sum + (c.product?.price || 0) * c.quantity, 0)
  const shipping = cart.length > 0 ? (settings?.base_shipping_rate || 60) : 0
  const tax = cartTotal * ((settings?.tax_percentage || 5) / 100)
  const grandTotal = cartTotal + shipping + tax

  async function checkout(address: string, paymentMethod: string, paymentDetails?: { txId?: string; mobile?: string }) {
    if (!profile?.id || cart.length === 0) return
    try {
      const { data: order } = await supabase.from('orders').insert({
        buyer_id: profile.id,
        total: grandTotal,
        shipping_cost: shipping,
        tax,
        status: 'pending',
        shipping_address: address,
        payment_method: paymentMethod,
        payment_mobile: paymentDetails?.mobile || null,
        transaction_id: paymentDetails?.txId || null,
      }).select().single()
      
      if (!order) return

      const items = cart.map(c => ({
        order_id: order.id,
        product_id: c.product.id,
        seller_id: c.product.seller_id,
        district_id: c.product.district_id,
        quantity: c.quantity,
        unit_price: c.product.price,
      }))
      await supabase.from('order_items').insert(items)

      const sellerIds = [...new Set(cart.map(c => c.product.seller_id))]
      for (const sellerId of sellerIds) {
        if (!sellerId) continue
        await supabase.from('notifications').insert({
          user_id: sellerId,
          type: 'order',
          title: 'নতুন অর্ডার এসেছে!',
          body: `আপনার স্টোরে ৳${grandTotal.toFixed(2)} টাকার একটি নতুন অর্ডার এসেছে (${paymentMethod === 'cash' ? 'ক্যাশ অন ডেলিভারি - ৩০% অগ্রিম' : paymentMethod}).`,
        })
      }
      setCart([])
      setCartOpen(false)
      alert('অর্ডার সফলভাবে সম্পন্ন হয়েছে! "আমার অর্ডার" ট্যাবে ট্র্যাকিং করুন।')
    } catch (e) {
      console.error("Checkout process encountered error:", e)
    }
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-800 to-primary-600 text-white p-6 sm:p-8 lg:p-10 shadow-lg">
        <div className="absolute -right-10 -top-10 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            ১০০% এজেন্ট ভেরিফাইড মার্কেটপ্লেস
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl tracking-tight leading-tight">
            স্বাগতম, {profile?.full_name || 'স্মার্ট ক্রেতা'}!
          </h1>
          <p className="text-primary-100 text-sm sm:text-base leading-relaxed">
            বাংলাদেশের ৬৪ জেলার ঐতিহ্যবাহী ও আসল পণ্য খুঁজুন। প্রতিটি পণ্য ডেলিভারির আগে স্থানীয় ফিল্ড এজেন্ট দ্বারা যাচাইকৃত।
          </p>
        </div>
        <button 
          onClick={() => setCartOpen(true)} 
          className="absolute top-6 right-6 sm:top-8 sm:right-8 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl p-3 sm:px-5 sm:py-3 flex items-center gap-3 backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <span className="text-xl">🛒</span>
          <span className="font-bold hidden sm:inline">শপিং কার্ট</span>
          {cart.length > 0 && (
            <span className="w-6 h-6 bg-accent-500 text-white text-xs font-extrabold rounded-full flex items-center justify-center shadow-inner">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 text-lg">🔍</span>
          <input 
            type="text"
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm font-medium placeholder:text-gray-400 bg-gray-50/50 focus:bg-white"
            placeholder="পণ্য বা জেলার নাম লিখে খুঁজুন (যেমন: রাজশাহী, আম, টাঙ্গাইলের শাড়ি...)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs text-gray-400 hover:text-gray-600 font-bold"
            >
              মুছে ফেলুন ✕
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">জেলা অনুযায়ী ফিল্টার (Filter by District):</div>
          <div className="flex flex-wrap gap-2 pt-1">
            <button 
              onClick={() => setDistrictFilter('All')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                districtFilter === 'All' 
                  ? 'bg-gray-900 text-white shadow-xs' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📍 সকল জেলা ({districts.length})
            </button>
            {districts.map(d => (
              <button 
                key={d.id} 
                onClick={() => setDistrictFilter(d.name)} 
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  districtFilter === d.name 
                    ? 'bg-primary-600 text-white shadow-xs' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📍 {d.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-gray-100">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">ক্যাটাগরি (Category):</div>
          <div className="flex flex-wrap gap-2 pt-1">
            {CATEGORIES.map(c => (
              <button 
                key={c} 
                onClick={() => setCategory(c)} 
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  category === c 
                    ? 'bg-accent-600 text-white shadow-xs' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{CATEGORY_EMOJIS[c] || '📦'}</span>
                <span>{c}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-gray-900">
            {districtFilter === 'All' ? 'সকল পণ্য' : `${districtFilter} জেলার পণ্য`}
            <span className="ml-2 text-sm font-normal text-gray-500">({filtered.length}টি পণ্য পাওয়া গেছে)</span>
          </h2>
          {(category !== 'All' || districtFilter !== 'All' || searchQuery) && (
            <button 
              onClick={() => { setCategory('All'); setDistrictFilter('All'); setSearchQuery(''); }}
              className="text-xs font-semibold text-primary-600 hover:underline"
            >
              সকল ফিল্টার রিসেট করুন
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-xl w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-10 bg-gray-200 rounded-xl w-full pt-2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
            <div className="text-5xl">🔍</div>
            <h3 className="font-bold text-lg text-gray-800">কোনো পণ্য খুঁজে পাওয়া যায়নি!</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              আপনার ফিল্টার বা সার্চ কিওয়ার্ড অনুযায়ী এই মুহূর্তে কোনো পণ্য লিস্টিংয়ে নেই। অন্য কোনো জেলা বা ক্যাটাগরি সিলেক্ট করে চেষ্টা করুন।
            </p>
            <button 
              onClick={() => { setCategory('All'); setDistrictFilter('All'); setSearchQuery(''); }}
              className="mt-2 px-5 py-2 rounded-xl bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-all"
            >
              সকল পণ্য দেখুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map(p => (
              <div 
                key={p.id} 
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-primary-200 transition-all duration-300 flex flex-col group cursor-pointer"
                onClick={() => setSelectedProduct(p)}
              >
                <div className="h-52 bg-gray-100 overflow-hidden relative">
                  <img 
                    src={p.image_url || PRODUCT_IMAGES[p.category] || PRODUCT_IMAGES.Other} 
                    alt={p.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white font-medium text-xs flex items-center gap-1">
                      📍 {p.district?.name || 'বাংলাদেশ'}
                    </span>
                    {p.verification_status === 'verified' && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-600/90 backdrop-blur-md text-white font-bold text-xs shadow-sm flex items-center gap-1">
                        ✓ ভেরিফাইড
                      </span>
                    )}
                  </div>
                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                      <span className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-sm">স্টক শেষ (Out of Stock)</span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-primary-600 uppercase tracking-wider">{p.category}</div>
                    <h3 className="font-bold text-base text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                      {p.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{p.description}</p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-gray-400">মূল্য (Price)</div>
                      <div className="font-display font-extrabold text-xl text-gray-900">
                        ৳{(p.price || 0).toLocaleString('bn-BD')}
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); addToCart(p); }} 
                      className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 ${
                        p.stock === 0 || p.verification_status !== 'verified'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm active:scale-95 cursor-pointer'
                      }`}
                      disabled={p.stock === 0 || p.verification_status !== 'verified'}
                    >
                      <span>+</span>
                      <span>কার্টে যোগ করুন</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={() => { addToCart(selectedProduct); setSelectedProduct(null); }} 
        />
      )}

      {cartOpen && (
        <CartDrawer 
          cart={cart} 
          settings={settings} 
          cartTotal={cartTotal} 
          shipping={shipping} 
          tax={tax} 
          grandTotal={grandTotal}
          onUpdateQty={updateQty} 
          onRemove={removeFromCart} 
          onClose={() => setCartOpen(false)} 
          onCheckout={checkout} 
        />
      )}
    </div>
  )
}

function ProductModal({ product, onClose, onAddToCart }: { product: ExtendedProduct; onClose: () => void; onAddToCart: () => void }) {
  const { profile } = useAuth()
  const [verification, setVerification] = useState<any>(null)
  const [agent, setAgent] = useState<Profile | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (product?.id && product.assigned_agent_id) {
      supabase.from('verifications').select('*, agent:profiles!agent_id(*)').eq('product_id', product.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
        .then(({ data }) => { setVerification(data); setAgent((data as any)?.agent || null) })
    }
  }, [product])

  async function startChat(receiverId: string) {
    if (!profile?.id || !product?.id || !receiverId) return
    const { data: existing } = await supabase.from('chats').select('*').eq('sender_id', profile.id).eq('receiver_id', receiverId).eq('product_id', product.id).maybeSingle()
    if (!existing) {
      await supabase.from('chats').insert({ sender_id: profile.id, receiver_id: receiverId, product_id: product.id, message: `হ্যালো!, আমি আপনার "${product.title}" পণ্যটি সম্পর্কে জানতে আগ্রহী।` })
    }
    onClose()
    navigate('/dashboard?tab=chats')
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl overflow-hidden border border-gray-100" onClick={e => e.stopPropagation()}>
        <div className="relative h-72 bg-gray-100">
          <img src={product.image_url || PRODUCT_IMAGES[product.category] || PRODUCT_IMAGES.Other} alt={product.title} className="w-full h-full object-cover" />
          <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-gray-700 font-bold shadow-md transition-transform active:scale-95">✕</button>
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className="px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md text-white font-medium text-xs">📍 {product.district?.name || 'বাংলাদেশ'}</span>
            <span className="px-3 py-1 rounded-xl bg-primary-600 text-white font-medium text-xs">{product.category}</span>
          </div>
        </div>
        
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display font-extrabold text-2xl text-gray-900">{product.title}</h2>
              <div className="mt-1 flex items-center gap-2">
                {product.verification_status === 'verified' ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">✓ অনুমোদিত এজেন্ট দ্বারা যাচাইকৃত</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-xs bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">⏳ ভেরিফিকেশন পেন্ডিং</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 font-bold uppercase">মূল্য</div>
              <span className="font-display font-extrabold text-3xl text-primary-600">৳{(product.price || 0).toLocaleString('bn-BD')}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">পণ্যের বিবরণ</h4>
            <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">{product.description}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg uppercase">
                {product.seller?.business_name?.charAt(0) || product.seller?.full_name?.charAt(0) || 'S'}
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">{product.seller?.business_name || product.seller?.full_name || 'লোকাল বিক্রেতা'}</div>
                <div className="text-xs text-gray-500">verified seller · {product.district?.name || 'বাংলাদেশ'}</div>
              </div>
            </div>
            {product.seller?.id && (
              <button onClick={() => startChat(product.seller.id)} className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs flex items-center gap-1.5 transition-all">
                <span>💬</span><span>সেলারকে মেসেজ দিন</span>
              </button>
            )}
          </div>

          {verification && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🛡️</span>
                  <span className="font-bold text-sm text-emerald-900">এজেন্ট ফিজিক্যাল ইন্সপেকশন রিপোর্ট</span>
                </div>
                {verification.quality_score && (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-xs">কোয়ালিটি: {verification.quality_score}/৫</span>
                )}
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed italic">"{verification.report}"</p>
              {agent?.id && (
                <div className="pt-2 flex items-center justify-between text-xs text-emerald-700">
                  <span>পরিদর্শনে: <strong>{agent.full_name}</strong> (অনুমোদিত জেলা পরিদর্শক)</span>
                  <button onClick={() => startChat(agent.id)} className="font-bold underline hover:text-emerald-900">এজেন্টের সাথে চ্যাট করুন →</button>
                </div>
              )}
            </div>
          )}

          <button onClick={onAddToCart} className="w-full py-4 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-lg shadow-primary-600/30 transition-all active:scale-98 cursor-pointer disabled:bg-gray-200 disabled:shadow-none disabled:cursor-not-allowed" disabled={product.stock === 0 || product.verification_status !== 'verified'}>
            {product.stock === 0 ? 'স্টক শেষ (Out of Stock)' : product.verification_status !== 'verified' ? 'ভেরিফিকেশন সম্পন্ন হয়নি' : 'কার্টে যোগ করুন (Add to Cart)'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CartDrawer({ cart, settings, cartTotal, shipping, tax, grandTotal, onUpdateQty, onRemove, onClose, onCheckout }: any) {
  const [checkoutMode, setCheckoutMode] = useState(false)
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'rocket' | 'nagad' | 'cash'>('bkash')
  const [mobileNumber, setMobileNumber] = useState('')
  const [txId, setTxId] = useState('')

  const thirtyPercentAmount = (grandTotal * 0.3).toFixed(2)

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-left">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <h2 className="font-display font-extrabold text-lg text-gray-900">{checkoutMode ? 'চেকআউট ও পেমেন্ট' : 'আপনার শপিং কার্ট'}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12 text-gray-400">
              <div className="text-6xl">🛍️</div>
              <p className="font-medium text-base text-gray-600">আপনার কার্ট সম্পূর্ণ খালি!</p>
              <button onClick={onClose} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-semibold hover:bg-primary-700 transition-all">
                পণ্য ব্রাউজ করুন
              </button>
            </div>
          ) : !checkoutMode ? (
            <div className="space-y-4">
              {cart.map((c: CartItem) => (
                <div key={c.product.id} className="flex gap-4 p-3 rounded-2xl border border-gray-100 bg-gray-50/50 items-center">
                  <img src={c.product.image_url || PRODUCT_IMAGES[c.product.category] || PRODUCT_IMAGES.Other} alt={c.product.title} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-900 truncate">{c.product.title}</h4>
                    <div className="text-xs text-primary-600 font-bold mt-0.5">৳{(c.product.price || 0).toLocaleString('bn-BD')}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => onUpdateQty(c.product.id, -1)} className="w-6 h-6 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-600 flex items-center justify-center hover:bg-gray-100">-</button>
                      <span className="text-xs font-bold text-gray-800">{c.quantity}</span>
                      <button onClick={() => onUpdateQty(c.product.id, 1)} className="w-6 h-6 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-600 flex items-center justify-center hover:bg-gray-100">+</button>
                    </div>
                  </div>
                  <button onClick={() => onRemove(c.product.id)} className="text-xs text-red-500 font-bold hover:underline">ডিলিট</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">ডেলিভারি ঠিকানা (Delivery Address) *</label>
                <textarea 
                  rows={3}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none text-sm bg-gray-50/50"
                  placeholder="আপনার বাসা/অফিসের ঠিকানা, থানা এবং জেলার নাম বিস্তারিত লিখুন..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">পেমেন্ট পদ্ধতি নির্বাচন করুন *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('bkash')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${paymentMethod === 'bkash' ? 'bg-pink-50 border-pink-500 text-pink-700 shadow-xs' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span>📱</span> বিকাশ (bKash)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('rocket')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${paymentMethod === 'rocket' ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-xs' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span>🚀</span> রকেট (Rocket)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('nagad')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${paymentMethod === 'nagad' ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-xs' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span>🟠</span> নগদ (Nagad)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${paymentMethod === 'cash' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span>💵</span> ক্যাশ (Cash)
                  </button>
                </div>
              </div>

              {/* Bkash / Mobile Financial Services Info */}
              {(paymentMethod === 'bkash' || paymentMethod === 'rocket' || paymentMethod === 'nagad') && (
                <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 text-xs text-pink-900 space-y-3">
                  <div className="font-bold flex items-center gap-1.5 text-pink-800">
                    <span>💡</span> 
                    <span>
                      {paymentMethod === 'bkash' ? 'বিকাশ' : paymentMethod === 'rocket' ? 'রকেট' : 'নগদ'} পেমেন্ট নির্দেশনা
                    </span>
                  </div>
                  <p className="leading-relaxed">
                    দয়া করে আমাদের মার্চেন্ট নম্বরে সম্পূর্ণ মোট মূল্য <strong>৳{grandTotal.toFixed(2)}</strong> সেন্ড মানি (Send Money) করুন:
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-pink-200 text-center font-mono font-bold text-sm text-pink-700 tracking-wider">
                    018XXXXXXXX (Merchant / Personal)
                  </div>
                  <div className="space-y-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-pink-800 mb-1">যে নম্বর থেকে টাকা পাঠিয়েছেন:</label>
                      <input 
                        type="text" 
                        placeholder="যেমন: 017XXXXXXXX"
                        value={mobileNumber}
                        onChange={e => setMobileNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-pink-200 bg-white text-xs outline-none focus:ring-1 focus:ring-pink-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-pink-800 mb-1">ট্রানজেকশন আইডি (TrxID):</label>
                      <input 
                        type="text" 
                        placeholder="যেমন: 9N7A6BC5"
                        value={txId}
                        onChange={e => setTxId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-pink-200 bg-white text-xs outline-none focus:ring-1 focus:ring-pink-400 font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Cash Payment Info with 30% Advance Rule */}
              {paymentMethod === 'cash' && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-3">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <span>⚠️</span> 
                    <span>ক্যাশ অন ডেলিভারি (৩০% অগ্রিম পেমেন্ট শর্ত)</span>
                  </div>
                  <p className="leading-relaxed">
                    ক্যাশ অন ডেলিভারি বেছে নেওয়ার জন্য আপনাকে অর্ডারের মোট মূল্যের ন্যূনতম <strong>৩০%</strong> (অর্থাৎ <strong>৳{thirtyPercentAmount}</strong>) আমাদের বিকাশ নম্বরে আগে পরিশোধ করতে হবে। বাকি ৭০% পণ্য হাতে পেয়ে জেলা এজেন্টের নিকট পরিশোধ করবেন।
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-amber-200 text-center font-mono font-bold text-sm text-amber-800 tracking-wider">
                    বিকাশ (মার্চেন্ট/পার্সোনাল): 018XXXXXXXX
                  </div>
                  <div className="space-y-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 mb-1">আপনার বিকাশ নম্বর (যেখান থেকে ৩০% পাঠিয়েছেন):</label>
                      <input 
                        type="text" 
                        placeholder="যেমন: 017XXXXXXXX"
                        value={mobileNumber}
                        onChange={e => setMobileNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-xs outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 mb-1">অগ্রিম পেমেন্টের ট্রানজেকশন আইডি (TrxID):</label>
                      <input 
                        type="text" 
                        placeholder="যেমন: 9N7A6BC5"
                        value={txId}
                        onChange={e => setTxId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-xs outline-none focus:ring-1 focus:ring-amber-400 font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 border-t border-gray-200 bg-gray-50/80 space-y-3">
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>পণ্যের মূল্য:</span>
                <span className="font-bold text-gray-900">৳{cartTotal.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between">
                <span>ডেলিভারি চার্জ:</span>
                <span className="font-bold text-gray-900">৳{shipping.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between">
                <span>ট্যাক্স ({settings?.tax_percentage || 5}%):</span>
                <span className="font-bold text-gray-900">৳{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 text-sm">
                <span className="font-bold text-gray-900">সর্বমোট (Grand Total):</span>
                <span className="font-display font-extrabold text-primary-600 text-base">৳{grandTotal.toFixed(2)}</span>
              </div>
              {paymentMethod === 'cash' && (
                <div className="flex justify-between pt-1 text-amber-700 font-bold bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <span>এখনই পরিশোধ করতে হবে (৩০%):</span>
                  <span>৳{thirtyPercentAmount}</span>
                </div>
              )}
            </div>

            {!checkoutMode ? (
              <button onClick={() => setCheckoutMode(true)} className="w-full py-3.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-lg shadow-primary-600/30 transition-all active:scale-98">
                অর্ডার কনফার্ম করতে এগিয়ে যান →
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setCheckoutMode(false)} className="px-4 py-3.5 rounded-2xl border border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-100 transition-all">
                  ← পেছনে
                </button>
                <button 
                  onClick={() => onCheckout(address, paymentMethod, { mobile: mobileNumber, txId })} 
                  disabled={!address.trim() || !mobileNumber.trim() || !txId.trim()} 
                  className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-98 cursor-pointer disabled:cursor-not-allowed"
                >
                  অর্ডার সম্পন্ন করুন ✓
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function OrdersView() {
  const { profile } = useAuth()
  const [orders, setOrders] = useState<ExtendedOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    supabase.from('orders').select('*, items:order_items(*, product:products(*))').eq('buyer_id', profile.id).order('created_at', { ascending: false })
      .then(({ data }) => { setOrders((data as unknown as ExtendedOrder[]) || []); setLoading(false) })
  }, [profile])

  if (loading) {
    return <div className="p-12 text-center text-gray-400 font-medium">অর্ডার লোড হচ্ছে...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display font-bold text-xl text-gray-900">আমার অর্ডারসমূহ ({orders.length})</h2>
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
          <div className="text-5xl">📦</div>
          <h3 className="font-bold text-lg text-gray-800">আপনার কোনো অর্ডার নেই!</h3>
          <p className="text-sm text-gray-500">আপনি এখনো কোনো পণ্য অর্ডার করেননি। ব্রাউজ ট্যাব থেকে পণ্য পছন্দ করে অর্ডার করুন।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
                <div>
                  <div className="text-xs text-gray-400 font-bold uppercase">অর্ডার আইডি: #{o.id.slice(0, 8)}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{new Date(o.created_at).toLocaleString('bn-BD')}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider ${
                    o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                    o.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {o.status === 'delivered' ? 'ডেলিভারি সম্পন্ন' : o.status === 'shipped' ? 'শিপমেন্টে আছে' : 'পেন্ডিং / প্রক্রিয়াধীন'}
                  </span>
                  <span className="font-display font-extrabold text-base text-gray-900">৳{(o.total || 0).toLocaleString('bn-BD')}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">অর্ডারকৃত পণ্যসমূহ:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {o.items?.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <img src={item.product?.image_url || PRODUCT_IMAGES[item.product?.category] || PRODUCT_IMAGES.Other} alt={item.product?.title} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-gray-900 truncate">{item.product?.title || 'পণ্য'}</h4>
                        <div className="text-[11px] text-gray-500">পরিমাণ: {item.quantity} × ৳{item.unit_price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {o.shipping_address && (
                <div className="pt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <strong>ডেলিভারি ঠিকানা:</strong> {o.shipping_address}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ChatsView() {
  const { profile } = useAuth()
  const [chats, setChats] = useState<ExtendedChat[]>([])
  const [selectedChat, setSelectedChat] = useState<ExtendedChat | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [reply, setReply] = useState('')

  useEffect(() => {
    if (!profile?.id) return
    supabase.from('chats').select('*, sender:profiles!sender_id(*), receiver:profiles!receiver_id(*), product:products(*)').or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`).order('created_at', { ascending: false })
      .then(({ data }) => setChats((data as unknown as ExtendedChat[]) || []))
  }, [profile])

  useEffect(() => {
    if (!selectedChat) return
    supabase.from('chats').select('*, sender:profiles!sender_id(*), receiver:profiles!receiver_id(*)').or(`and(sender_id.eq.${selectedChat.sender_id},receiver_id.eq.${selectedChat.receiver_id}),and(sender_id.eq.${selectedChat.receiver_id},receiver_id.eq.${selectedChat.sender_id})`).order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data || []))
  }, [selectedChat])

  async function sendReply(e: React.FormEvent) {
    e.preventDefault()
    if (!profile?.id || !selectedChat || !reply.trim()) return
    const recipientId = selectedChat.sender_id === profile.id ? selectedChat.receiver_id : selectedChat.sender_id
    const { data } = await supabase.from('chats').insert({
      sender_id: profile.id,
      receiver_id: recipientId,
      product_id: selectedChat.product_id,
      message: reply.trim(),
    }).select('*, sender:profiles!sender_id(*), receiver:profiles!receiver_id(*)').single()

    if (data) {
      setMessages(prev => [...prev, data])
      setReply('')
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs min-h-[600px]">
      <div className="border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 font-display font-bold text-sm bg-gray-50/50">সরাসরি সাপোর্ট চ্যাট ({chats.length})</div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {chats.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">কোনো চ্যাট ইতিহাস নেই</div>
          ) : (
            chats.map(c => {
              const other = c.sender_id === profile?.id ? c.receiver : c.sender
              return (
                <div key={c.id} onClick={() => setSelectedChat(c)} className={`p-4 hover:bg-gray-50 cursor-pointer transition-all ${selectedChat?.id === c.id ? 'bg-primary-50/60 border-l-4 border-primary-600' : ''}`}>
                  <div className="font-bold text-xs text-gray-900">{other?.full_name || 'ইউজার'}</div>
                  <div className="text-[11px] text-primary-600 font-semibold truncate mt-0.5">{c.product?.title || 'সাধারণ সাপোর্ট'}</div>
                  <div className="text-[11px] text-gray-500 truncate mt-1">{c.message}</div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="md:col-span-2 flex flex-col bg-gray-50/30">
        {!selectedChat ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 space-y-2">
            <div className="text-4xl">💬</div>
            <p className="text-xs font-medium">বাম পাশ থেকে যেকোনো চ্যাট সিলেক্ট করুন কথোপকথন দেখতে।</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-gray-900">
                  {selectedChat.sender_id === profile?.id ? selectedChat.receiver?.full_name : selectedChat.sender?.full_name}
                </div>
                {selectedChat.product && <div className="text-xs text-primary-600 font-semibold">পণ্য: {selectedChat.product.title}</div>}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(m => {
                const isMe = m.sender_id === profile?.id
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md rounded-2xl px-4 py-2.5 text-xs shadow-xs ${isMe ? 'bg-primary-600 text-white rounded-br-xs' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-xs'}`}>
                      <p className="leading-relaxed">{m.message}</p>
                      <div className={`text-[9px] mt-1 text-right ${isMe ? 'text-primary-100' : 'text-gray-400'}`}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <form onSubmit={sendReply} className="p-3 border-t border-gray-200 bg-white flex gap-2">
              <input 
                type="text" 
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none text-xs bg-gray-50"
                placeholder="আপনার বার্তা এখানে লিখুন..."
                value={reply}
                onChange={e => setReply(e.target.value)}
              />
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-sm transition-all">
                প্রেরণ করুন
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}