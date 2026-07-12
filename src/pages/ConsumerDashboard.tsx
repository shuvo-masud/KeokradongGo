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
interface CartItem { product: ExtendedProduct; quantity: number }

export default function ConsumerDashboard() {
  const { profile } = useAuth()
  const [showAdmin, setShowAdmin] = useState(false)
  const [showSuperAdmin, setShowSuperAdmin] = useState(false)
  const [showAgent, setShowAgent] = useState(false)
  const [showSeller, setShowSeller] = useState(false)

  const authContext = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams?.get('tab') || 'browse'

  if (!authContext || !authContext.profile) {
    return (
      <div className="min-h-[60vh] w-full flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm font-medium text-gray-500">নিরাপদ সেশন যাচাই করা হচ্ছে...</p>
      </div>
    )
  }
  if (showSuperAdmin) {
  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          className="btn-outline"
          onClick={() => setShowSuperAdmin(false)}
        >
          ← Consumer Dashboard
        </button>
      </div>

      <SuperAdminDashboard />
    </>
  )
}
 if (showSeller) {
  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          className="btn-outline"
          onClick={() => setShowSeller(false)}
        >
          ← Consumer Dashboard
        </button>
      </div>

      <SellerDashboard />
    </>
  )
}
 if (showAdmin) {
  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          className="btn-outline"
          onClick={() => setShowAdmin(false)}
        >
          ← Consumer Dashboard
        </button>
      </div>

      <AdminDashboard />
    </>
  )
}
if (showAgent) {
  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          className="btn-outline"
          onClick={() => setShowAgent(false)}
        >
          ← Consumer Dashboard
        </button>
      </div>

      <AgentDashboard />
    </>
  )
}

  return (

    
    
    <div className="space-y-8 pb-12">
      {/* Top Tab Navigation */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex gap-2 sm:gap-4 overflow-x-auto">
          {profile?.role === 'admin' && (
          <div className="flex justify-end mb-6">
            <button
              className="btn-primary"
                 onClick={() => setShowAdmin(true)}
                       >
                   Admin Dashboard
            </button>
         </div>
          )}
           {profile?.role === 'super_admin' && (
          <div className="flex justify-end mb-6">
            <button
              className="btn-primary"
                 onClick={() => setShowSuperAdmin(true)}
                       >
                   Supper_Admin Dashboard
            </button>
         </div>
          )}
          {profile?.role === 'agent' && (
          <div className="flex justify-end mb-6">
            <button
              className="btn-primary"
                 onClick={() => setShowAgent(true)}
                       >
                   Agent Dashboard
            </button>
         </div>
          )}
           {profile?.role === 'seller' && (
          <div className="flex justify-end mb-6">
            <button
              className="btn-primary"
                 onClick={() => setShowSeller(true)}
                       >
                   Seller Dashboard
            </button>
         </div>
          )}
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

  // Smart Memoized Filtering (Matches Product Title OR District Name)
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

  async function checkout(address: string) {
    if (!profile?.id || cart.length === 0) return
    try {
      const { data: order } = await supabase.from('orders').insert({
        buyer_id: profile.id,
        total: grandTotal,
        shipping_cost: shipping,
        tax,
        status: 'pending',
        shipping_address: address,
      }).select().single()
      
      if (!order) return

      const items = cart.map(c => ({
        order_id: order.id,
        product_id: c.product.id,
        seller_id: c.product.seller_id,
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
          body: `আপনার স্টোরে ৳${grandTotal.toFixed(2)} টাকার একটি নতুন অর্ডার এসেছে।`,
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
      {/* Hero Banner */}
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
            বাংলাদেশের ৬৪ জেলার আসল ঐতিহ্যবাহী ও খাঁটি পণ্য খুঁজুন। প্রতিটি পণ্য ডেলিভারির আগে স্থানীয় ফিল্ড এজেন্ট দ্বারা যাচাইকৃত।
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

      {/* Smart Search & Filter Control Panel */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        {/* Main Search Input */}
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

        {/* District Filter Pills */}
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

        {/* Category Filter Pills */}
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

      {/* Product Grid Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-gray-900">
            {districtFilter === 'All' ? 'সকল পণ্য' : `${districtFilter} জেলার পণ্য`}
            <span className="ml-2 text-sm font-normal text-gray-500">({filtered.length}টি পণ্য পাওয়া গেছে)</span>
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
            <h3 className="font-bold text-lg text-gray-800">কোনো পণ্য খুঁজে পাওয়া যায়নি!</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              আপনার ফিল্টার বা সার্চ কিওয়ার্ড অনুযায়ী এই মুহূর্তে কোনো পণ্য লিস্টিংয়ে নেই। অন্য কোনো জেলা বা ক্যাটাগরি সিলেক্ট করে চেষ্টা করুন।
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
                {/* Image Container */}
                <div className="h-52 bg-gray-100 overflow-hidden relative">
                  <img 
                    src={p.image_url || PRODUCT_IMAGES[p.category] || PRODUCT_IMAGES.Other} 
                    alt={p.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  
                  {/* Status & District Overlay Badges */}
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

                  {/* Stock Warning */}
                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                      <span className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-sm">স্টক শেষ (Out of Stock)</span>
                    </div>
                  )}
                </div>

                {/* Content */}
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

      {/* Product Details & Verification Modal */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={() => { addToCart(selectedProduct); setSelectedProduct(null); }} 
        />
      )}

      {/* Shopping Cart Drawer */}
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

// ---------------------------------------------------------------------------
// SUB-COMPONENTS (Modals, Drawers, Orders, Chats)
// ---------------------------------------------------------------------------

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
      await supabase.from('chats').insert({ sender_id: profile.id, receiver_id: receiverId, product_id: product.id, message: `নমস্কার, আমি আপনার "${product.title}" পণ্যটি সম্পর্কে জানতে আগ্রহী।` })
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

          {/* Seller Card */}
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

          {/* Agent Verification Report Box */}
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
            {product.stock === 0 ? 'স্টক শেষ (Out of Stock)' : product.verification_status !== 'verified' ? 'ভেরিফিকেশন সম্পন্ন হয়নি' : 'কার্টে যোগ করুন (Add to Cart)'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CartDrawer({ cart, settings, cartTotal, shipping, tax, grandTotal, onUpdateQty, onRemove, onClose, onCheckout }: any) {
  const [checkoutMode, setCheckoutMode] = useState(false)
  const [address, setAddress] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-left">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <h2 className="font-display font-extrabold text-lg text-gray-900">{checkoutMode ? 'চেকআউট ও ডেলিভারি' : 'আপনার শপিং কার্ট'}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12 text-gray-400">
              <div className="text-6xl">🛍️</div>
              <p className="font-medium text-base text-gray-600">আপনার কার্ট সম্পূর্ণ খালি!</p>
              <button onClick={onClose} className="mt-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-xs font-bold">পণ্য ব্রাউজ করুন</button>
            </div>
          ) : checkoutMode ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">ডেলিভারি ঠিকানা (Detailed Shipping Address)</label>
                <textarea className="w-full p-3.5 rounded-xl border border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none text-sm min-h-[110px]" value={address} onChange={e => setAddress(e.target.value)} placeholder="বাসা নম্বর, রোড, এলাকা, থানা এবং জেলার নাম বিস্তারিত লিখুন..." />
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600"><span>সাবটোটাল</span><span>৳{cartTotal.toLocaleString('bn-BD')}</span></div>
                <div className="flex justify-between text-gray-600"><span>শিপিং চার্জ</span><span>৳{shipping.toLocaleString('bn-BD')}</span></div>
                <div className="flex justify-between text-gray-600"><span>প্ল্যাটফর্ম ট্যাক্স ({settings?.tax_percentage || 5}%)</span><span>৳{tax.toFixed(0)}</span></div>
                <div className="flex justify-between font-extrabold text-base pt-2 border-t border-gray-200 text-gray-900"><span>সর্বমোট পরিশোধযোগ্য</span><span className="text-primary-600">৳{grandTotal.toLocaleString('bn-BD')}</span></div>
              </div>
              <button onClick={() => { if (address.trim()) onCheckout(address) }} className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition-all disabled:bg-gray-300 disabled:shadow-none cursor-pointer" disabled={!address.trim()}>কনফার্ম অর্ডার করুন (Place Order)</button>
              <button onClick={() => setCheckoutMode(false)} className="w-full py-2.5 text-center text-xs font-bold text-gray-500 hover:text-gray-800">← কার্টে ফিরে যান</button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((c: CartItem) => (
                <div key={c.product?.id} className="bg-white p-3.5 rounded-2xl border border-gray-200 flex gap-3.5 items-center shadow-xs">
                  <img src={c.product?.image_url || PRODUCT_IMAGES[c.product?.category] || PRODUCT_IMAGES.Other} alt={c.product?.title} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate">{c.product?.title}</div>
                    <div className="text-xs font-semibold text-primary-600 mt-0.5">৳{(c.product?.price || 0).toLocaleString('bn-BD')}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                        <button onClick={() => onUpdateQty(c.product.id, -1)} className="w-6 h-6 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200 rounded-l-lg">−</button>
                        <span className="w-7 text-center text-xs font-bold text-gray-800">{c.quantity}</span>
                        <button onClick={() => onUpdateQty(c.product.id, 1)} className="w-6 h-6 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200 rounded-r-lg">+</button>
                      </div>
                      <button onClick={() => onRemove(c.product.id)} className="text-[11px] font-bold text-red-500 hover:underline ml-auto">মুছে ফেলুন</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && !checkoutMode && (
          <div className="p-5 border-t border-gray-200 bg-gray-50/50 space-y-3">
            <div className="flex justify-between items-center font-extrabold text-base text-gray-900">
              <span>সর্বমোট আনুমানিক:</span>
              <span className="text-primary-600 text-lg">৳{grandTotal.toLocaleString('bn-BD')}</span>
            </div>
            <button onClick={() => setCheckoutMode(true)} className="w-full py-4 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm shadow-lg shadow-primary-600/30 transition-all cursor-pointer">চেকআউটে এগিয়ে যান →</button>
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

  const loadOrders = useCallback(async () => {
    if (!profile?.id) return
    try {
      const { data } = await supabase.from('orders').select('*, items:order_items(*, product:products(*))').eq('buyer_id', profile.id).order('created_at', { ascending: false })
      setOrders((data as unknown as ExtendedOrder[]) || [])
    } catch (err) { console.error("Failed to load orders:", err) } 
    finally { setLoading(false) }
  }, [profile?.id])

  useEffect(() => { loadOrders() }, [loadOrders])

  const STATUS_LABELS: Record<string, string> = { pending: 'অর্ডার গৃহীত হয়েছে', confirmed: 'কনফার্মড', shipped: 'শিপিং চলছে', delivered: 'ডেলিভারি সম্পন্ন', cancelled: 'বাতিল' }
  const STATUS_COLORS: Record<string, string> = { pending: 'bg-amber-100 text-amber-800', confirmed: 'bg-blue-100 text-blue-800', shipped: 'bg-purple-100 text-purple-800', delivered: 'bg-emerald-100 text-emerald-800', cancelled: 'bg-red-100 text-red-800' }

  if (loading) return <div className="text-center py-20 text-gray-400">অর্ডার লোড করা হচ্ছে...</div>

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="font-display font-bold text-2xl text-gray-900">আমার অর্ডার সমূহ</h2>
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">আপনার কোনো অতীত অর্ডার নেই।</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase">অর্ডার আইডি</span>
                  <div className="font-mono font-bold text-sm text-gray-800">#{order.id?.slice(0, 8)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[order.status || 'pending']}`}>
                    {STATUS_LABELS[order.status || 'pending']}
                  </span>
                  <span className="font-display font-extrabold text-lg text-primary-600">৳{(order.total || 0).toLocaleString('bn-BD')}</span>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center gap-3.5">
                    <img src={item.product?.image_url || PRODUCT_IMAGES[item.product?.category] || PRODUCT_IMAGES.Other} alt={item.product?.title} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-800 truncate">{item.product?.title}</div>
                      <div className="text-xs text-gray-500">পরিমাণ: {item.quantity}টি</div>
                    </div>
                    <div className="font-bold text-sm text-gray-900">৳{((item.unit_price || 0) * (item.quantity || 0)).toLocaleString('bn-BD')}</div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                <span>📍 ঠিকানা: {order.shipping_address}</span>
                <span>তারিখ: {order.created_at ? new Date(order.created_at).toLocaleDateString('bn-BD') : ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ChatsView() {
  const { profile } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [contacts, setContacts] = useState<Map<string, Profile>>(new Map())
  const [activeContact, setActiveContact] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const loadChats = useCallback(async () => {
    if (!profile?.id) return
    try {
      const { data: chatData } = await supabase.from('chats').select('*').or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`).order('created_at', { ascending: true })
      const chatList = (chatData || []) as Chat[]
      setChats(chatList)
      const otherIds = [...new Set(chatList.map(c => c.sender_id === profile.id ? c.receiver_id : c.sender_id))]
      if (otherIds.length > 0) {
        const { data: users } = await supabase.from('profiles').select('*').in('id', otherIds)
        const map = new Map<string, Profile>()
        ;(users || []).forEach(u => map.set(u.id, u as Profile))
        setContacts(map)
        setActiveContact(current => current || otherIds[0])
      }
    } catch (err) { console.error("Failed to load chat history:", err) }
  }, [profile?.id])

  useEffect(() => {
    loadChats()
    if (!profile?.id) return
    const channel = supabase.channel('realtime-chats').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats' }, () => loadChats()).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [loadChats, profile?.id])

  async function sendMessage() {
    if (!profile?.id || !activeContact || !message.trim()) return
    const msgText = message.trim()
    setMessage('')
    await supabase.from('chats').insert({ sender_id: profile.id, receiver_id: activeContact, message: msgText })
  }

  const contactChats = activeContact ? chats.filter(c => c.sender_id === activeContact || c.receiver_id === activeContact) : []

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <h2 className="font-display font-bold text-2xl text-gray-900">সরাসরি চ্যাট ও সাপোর্ট</h2>
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden flex h-[580px] shadow-sm">
        <div className="w-72 border-r border-gray-200 overflow-y-auto bg-gray-50/50 divide-y divide-gray-100">
          {contacts.size === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">কোনো কথোপকথন শুরু হয়নি। পণ্যের বিস্তারিত পেজ থেকে সেলার বা এজেন্টের সাথে চ্যাট শুরু করতে পারেন।</div>
          ) : (
            [...contacts.entries()].map(([id, contact]) => (
              <button key={id} onClick={() => setActiveContact(id)} className={`w-full p-4 flex items-center gap-3 text-left transition-colors ${activeContact === id ? 'bg-primary-50/80 border-r-4 border-r-primary-600' : 'hover:bg-gray-100/60'}`}>
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold uppercase shrink-0">
                  {contact?.business_name?.charAt(0) || contact?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-900 truncate">{contact?.business_name || contact?.full_name || 'User'}</div>
                  <div className="text-[11px] font-medium text-primary-600 capitalize">{contact?.role || 'user'}</div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="flex-1 flex flex-col bg-white">
          {activeContact ? (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/50">
                {contactChats.map(c => (
                  <div key={c.id} className={`flex ${c.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs ${c.sender_id === profile?.id ? 'bg-primary-600 text-white rounded-br-none font-medium' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>
                      {c.message}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3.5 border-t border-gray-200 flex gap-2 bg-white">
                <input className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none text-sm" value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="আপনার মেসেজ লিখুন..." />
                <button onClick={sendMessage} className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition-all">পাঠান</button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center space-y-2">
              <div className="text-4xl">💬</div>
              <p className="text-sm font-medium">বাম পাশ থেকে একটি কথোপকথন সিলেক্ট করুন।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}