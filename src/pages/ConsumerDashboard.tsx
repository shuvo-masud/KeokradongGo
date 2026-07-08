import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase, Product, District, Order, OrderItem, Profile, Chat, PlatformSettings } from '../lib/supabase'

const CATEGORIES = ['All', 'Fruits', 'Textiles', 'Fish', 'Tea', 'Handicraft', 'Spices', 'Other']
const PRODUCT_IMAGES: Record<string, string> = {
  Fruits: 'https://images.pexels.com/photos/918843/pexels-photo-918843.jpeg?auto=compress&cs=tinysrgb&w=600',
  Textiles: 'https://images.pexels.com/photos/57840/pexels-photo-57840.jpeg?auto=compress&cs=tinysrgb&w=600',
  Fish: 'https://images.pexels.com/photos/3296394/pexels-photo-3296394.jpeg?auto=compress&cs=tinysrgb&w=600',
  Tea: 'https://images.pexels.com/photos/230477/pexels-photo-230477.jpeg?auto=compress&cs=tinysrgb&w=600',
  Handicraft: 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&w=600',
  Spices: 'https://images.pexels.com/photos/1340116/pexels-photo-1340116.jpeg?auto=compress&cs=tinysrgb&w=600',
  Other: 'https://images.pexels.com/photos/4198023/pexels-photo-4198023.jpeg?auto=compress&cs=tinysrgb&w=600',
}

interface CartItem { product: Product; quantity: number }

export default function ConsumerDashboard() {
  const { profile } = useAuth()
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'browse'

  if (tab === 'orders') return <OrdersView />
  if (tab === 'chats') return <ChatsView />
  return <BrowseView />
}

function BrowseView() {
  const { profile } = useAuth()
  const [products, setProducts] = useState<(Product & { district: District; seller: Profile })[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [category, setCategory] = useState('All')
  const [districtFilter, setDistrictFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<(Product & { district: District; seller: Profile }) | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [prodRes, distRes, setRes] = await Promise.all([
        supabase.from('products').select('*, district:districts(*), seller:profiles!seller_id(*)').order('created_at', { ascending: false }),
        supabase.from('districts').select('*').order('name'),
        supabase.from('platform_settings').select('*').maybeSingle(),
      ])
      setProducts(prodRes.data as any ?? [])
      setDistricts(distRes.data ?? [])
      setSettings(setRes.data as any)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = products.filter(p => {
    if (category !== 'All' && p.category !== category) return false
    if (districtFilter !== 'All' && p.district.name !== districtFilter) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function addToCart(product: Product) {
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

  const cartTotal = cart.reduce((sum, c) => sum + c.product.price * c.quantity, 0)
  const shipping = cart.length > 0 ? (settings?.base_shipping_rate ?? 60) : 0
  const tax = cartTotal * ((settings?.tax_percentage ?? 5) / 100)
  const grandTotal = cartTotal + shipping + tax

  async function checkout(address: string) {
    if (!profile || cart.length === 0) return
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

    // Notify sellers
    const sellerIds = [...new Set(cart.map(c => c.product.seller_id))]
    for (const sellerId of sellerIds) {
      await supabase.from('notifications').insert({
        user_id: sellerId,
        type: 'order',
        title: 'New order received',
        body: `You have a new order for ৳${grandTotal.toFixed(2)}`,
      })
    }
    setCart([])
    setCartOpen(false)
    alert('Order placed successfully! You can track it in My Orders.')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl">Browse Authentic Products</h1>
          <p className="text-gray-500 text-sm mt-1">Filter by district of origin — every verified product is agent-inspected</p>
        </div>
        <button onClick={() => setCartOpen(true)} className="btn-primary relative">
          🛒 Cart
          {cart.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{cart.length}</span>}
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-4">
        <input className="input" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${category === c ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{c}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setDistrictFilter('All')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${districtFilter === 'All' ? 'bg-ocean-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All Districts</button>
          {districts.map(d => (
            <button key={d.id} onClick={() => setDistrictFilter(d.name)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${districtFilter === d.name ? 'bg-ocean-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{d.name}</button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="card h-80 animate-pulse bg-gray-100" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No products found. Try adjusting your filters.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="card overflow-hidden hover:shadow-lg transition-all cursor-pointer group" onClick={() => setSelectedProduct(p)}>
              <div className="h-48 bg-gray-100 overflow-hidden relative">
                <img src={p.image_url || PRODUCT_IMAGES[p.category] || PRODUCT_IMAGES.Other} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {p.verification_status === 'verified' && <span className="absolute top-2 right-2 badge-green">✓ Verified</span>}
                {p.verification_status === 'pending' && <span className="absolute top-2 right-2 badge-orange">Pending</span>}
                {p.verification_status === 'rejected' && <span className="absolute top-2 right-2 badge-red">Rejected</span>}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm truncate">{p.title}</h3>
                <div className="text-xs text-gray-500 mt-1">📍 {p.district.name}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-display font-bold text-lg text-primary-700">৳{p.price.toFixed(0)}</span>
                  <span className="text-xs text-gray-400">{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); addToCart(p) }} className="btn-primary w-full mt-3 text-xs py-2" disabled={p.stock === 0 || p.verification_status !== 'verified'}>
                  {p.verification_status !== 'verified' ? 'Not Verified' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product detail modal */}
      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={() => { addToCart(selectedProduct); setSelectedProduct(null) }} />}

      {/* Cart drawer */}
      {cartOpen && (
        <CartDrawer cart={cart} settings={settings} cartTotal={cartTotal} shipping={shipping} tax={tax} grandTotal={grandTotal}
          onUpdateQty={updateQty} onRemove={removeFromCart} onClose={() => setCartOpen(false)} onCheckout={checkout} />
      )}
    </div>
  )
}

function ProductModal({ product, onClose, onAddToCart }: { product: Product & { district: District; seller: Profile }; onClose: () => void; onAddToCart: () => void }) {
  const { profile } = useAuth()
  const [verification, setVerification] = useState<any>(null)
  const [agent, setAgent] = useState<Profile | null>(null)

  useEffect(() => {
    if (product.assigned_agent_id) {
      supabase.from('verifications').select('*, agent:profiles!agent_id(*)').eq('product_id', product.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
        .then(({ data }) => { setVerification(data); setAgent((data as any)?.agent ?? null) })
    }
  }, [product])

  async function startChat(receiverId: string) {
    if (!profile) return
    const { data: existing } = await supabase.from('chats').select('*').eq('sender_id', profile.id).eq('receiver_id', receiverId).eq('product_id', product.id).maybeSingle()
    if (!existing) {
      await supabase.from('chats').insert({ sender_id: profile.id, receiver_id: receiverId, product_id: product.id, message: `Hi, I'm interested in "${product.title}"` })
    }
    onClose()
    window.location.href = '/dashboard?tab=chats'
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="relative h-64 bg-gray-100">
          <img src={product.image_url || PRODUCT_IMAGES[product.category] || PRODUCT_IMAGES.Other} alt={product.title} className="w-full h-full object-cover" />
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-gray-600 hover:bg-white">✕</button>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h2 className="font-display font-bold text-xl">{product.title}</h2>
            <span className="font-display font-bold text-2xl text-primary-700">৳{product.price.toFixed(0)}</span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="badge-gray">📍 {product.district.name}</span>
            <span className="badge-gray">{product.category}</span>
            {product.verification_status === 'verified' ? <span className="badge-green">✓ Agent Verified</span> : <span className="badge-orange">Pending Verification</span>}
          </div>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">{product.description}</p>

          {/* Seller info */}
          <div className="card p-3 mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">{product.seller.full_name.charAt(0)}</div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{product.seller.business_name || product.seller.full_name}</div>
              <div className="text-xs text-gray-500">Seller · {product.seller.email}</div>
            </div>
            <button onClick={() => startChat(product.seller.id)} className="btn-outline text-xs py-2">💬 Chat</button>
          </div>

          {/* Verification report */}
          {verification && (
            <div className="card p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🔍</span>
                <span className="font-semibold text-sm">Agent Verification Report</span>
              </div>
              <div className="text-sm text-gray-600 mb-2">{verification.report}</div>
              {verification.quality_score && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Quality Score:</span>
                  <span className="font-semibold text-sm text-primary-700">{verification.quality_score}/5</span>
                </div>
              )}
              {agent && (
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-xs text-gray-500">Inspected by: <span className="font-medium text-gray-700">{agent.full_name}</span></div>
                  <button onClick={() => startChat(agent.id)} className="btn-ghost text-xs py-1">💬 Ask Agent</button>
                </div>
              )}
            </div>
          )}

          <button onClick={onAddToCart} className="btn-primary w-full py-3" disabled={product.stock === 0 || product.verification_status !== 'verified'}>
            {product.stock === 0 ? 'Out of Stock' : product.verification_status !== 'verified' ? 'Not Yet Verified' : 'Add to Cart'}
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
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
          <h2 className="font-display font-bold text-lg">{checkoutMode ? 'Checkout' : 'Shopping Cart'}</h2>
          <button onClick={onClose} className="btn-ghost p-2">✕</button>
        </div>
        <div className="p-4">
          {cart.length === 0 ? (
            <div className="text-center py-20 text-gray-400">Your cart is empty</div>
          ) : checkoutMode ? (
            <div className="space-y-4">
              <div>
                <label className="label">Shipping Address</label>
                <textarea className="input min-h-[100px]" value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter your full delivery address" />
              </div>
              <div className="card p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>৳{cartTotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>৳{shipping.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Tax ({settings?.tax_percentage ?? 5}%)</span><span>৳{tax.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100"><span>Total</span><span className="text-primary-700">৳{grandTotal.toFixed(2)}</span></div>
              </div>
              <button onClick={() => { if (address.trim()) onCheckout(address) }} className="btn-primary w-full py-3" disabled={!address.trim()}>Place Order</button>
              <button onClick={() => setCheckoutMode(false)} className="btn-ghost w-full">Back to Cart</button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {cart.map((c: CartItem) => (
                  <div key={c.product.id} className="card p-3 flex gap-3">
                    <img src={c.product.image_url || PRODUCT_IMAGES[c.product.category] || PRODUCT_IMAGES.Other} alt={c.product.title} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{c.product.title}</div>
                      <div className="text-xs text-gray-500">৳{c.product.price.toFixed(0)} each</div>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => onUpdateQty(c.product.id, -1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">−</button>
                        <span className="text-sm font-medium w-6 text-center">{c.quantity}</span>
                        <button onClick={() => onUpdateQty(c.product.id, 1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">+</button>
                        <button onClick={() => onRemove(c.product.id)} className="ml-auto text-xs text-red-500 hover:underline">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card p-4 mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>৳{cartTotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>৳{shipping.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>৳{tax.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100"><span>Total</span><span className="text-primary-700">৳{grandTotal.toFixed(2)}</span></div>
              </div>
              <button onClick={() => setCheckoutMode(true)} className="btn-primary w-full py-3 mt-4">Proceed to Checkout</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function OrdersView() {
  const { profile } = useAuth()
  const [orders, setOrders] = useState<(Order & { items: (OrderItem & { product: Product })[] })[]>([])
  const [loading, setLoading] = useState(true)

  const loadOrders = useCallback(async () => {
    if (!profile) return
    const { data } = await supabase.from('orders').select('*, items:order_items(*, product:products(*))').eq('buyer_id', profile.id).order('created_at', { ascending: false })
    setOrders(data as any ?? [])
    setLoading(false)
  }, [profile])

  useEffect(() => { loadOrders() }, [loadOrders])

  const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered']
  const STATUS_LABELS: Record<string, string> = { pending: 'Order Placed', confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' }

  async function raiseDispute(order: Order) {
    const subject = prompt('Dispute subject:')
    if (!subject) return
    const description = prompt('Describe the issue:')
    if (!description) return
    await supabase.from('disputes').insert({ order_id: order.id, buyer_id: profile!.id, subject, description })
    alert('Dispute submitted. An admin will review it shortly.')
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading orders...</div>

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl">My Orders</h1>
      {orders.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No orders yet. Start shopping!</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-semibold text-sm">Order #{order.id.slice(0, 8)}</div>
                  <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-lg text-primary-700">৳{order.total.toFixed(2)}</div>
                  <span className={`badge ${order.status === 'delivered' ? 'badge-green' : order.status === 'cancelled' ? 'badge-red' : 'badge-blue'}`}>{STATUS_LABELS[order.status]}</span>
                </div>
              </div>

              {/* Tracking */}
              {order.status !== 'cancelled' && (
                <div className="flex items-center mb-4">
                  {STATUS_STEPS.map((step, i) => {
                    const currentIdx = STATUS_STEPS.indexOf(order.status)
                    const done = i <= currentIdx
                    return (
                      <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${done ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'}`}>{i + 1}</div>
                        {i < STATUS_STEPS.length - 1 && <div className={`flex-1 h-1 mx-1 ${i < currentIdx ? 'bg-primary-600' : 'bg-gray-200'}`} />}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Items */}
              <div className="space-y-2">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <img src={item.product.image_url || PRODUCT_IMAGES[item.product.category] || PRODUCT_IMAGES.Other} alt={item.product.title} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1">{item.product.title}</div>
                    <div className="text-gray-500">×{item.quantity}</div>
                    <div className="font-medium">৳{(item.unit_price * item.quantity).toFixed(0)}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs text-gray-500">Ship to: {order.shipping_address}</div>
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <button onClick={() => raiseDispute(order)} className="btn-ghost text-xs text-red-500">⚠ Raise Dispute</button>
                )}
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
    if (!profile) return
    const { data } = await supabase.from('chats').select('*').or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`).order('created_at', { ascending: true })
    const chatList = data ?? []
    setChats(chatList as Chat[])
    const otherIds = [...new Set(chatList.map((c: Chat) => c.sender_id === profile.id ? c.receiver_id : c.sender_id))]
    if (otherIds.length > 0) {
      const { data: users } = await supabase.from('profiles').select('*').in('id', otherIds)
      const map = new Map<string, Profile>()
      ;(users ?? []).forEach(u => map.set(u.id, u as Profile))
      setContacts(map)
      if (otherIds.length > 0 && !activeContact) setActiveContact(otherIds[0])
    }
  }, [profile, activeContact])

  useEffect(() => {
    loadChats()
    if (!profile) return
    const channel = supabase.channel('chats').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats' }, loadChats).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [loadChats, profile])

  async function sendMessage() {
    if (!profile || !activeContact || !message.trim()) return
    await supabase.from('chats').insert({ sender_id: profile.id, receiver_id: activeContact, message: message.trim() })
    setMessage('')
  }

  const contactChats = activeContact ? chats.filter(c => c.sender_id === activeContact || c.receiver_id === activeContact) : []

  return (
    <div className="space-y-4">
      <h1 className="font-display font-bold text-2xl">Support Chats</h1>
      <div className="card overflow-hidden flex h-[600px]">
        {/* Contact list */}
        <div className="w-64 border-r border-gray-200 overflow-y-auto">
          {contacts.size === 0 ? <div className="p-6 text-center text-sm text-gray-400">No conversations yet</div> : (
            [...contacts.entries()].map(([id, contact]) => (
              <button key={id} onClick={() => setActiveContact(id)} className={`w-full p-3 flex items-center gap-3 border-b border-gray-50 hover:bg-gray-50 ${activeContact === id ? 'bg-primary-50' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">{contact.full_name.charAt(0)}</div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-semibold truncate">{contact.full_name}</div>
                  <div className="text-xs text-gray-500 capitalize">{contact.role}</div>
                </div>
              </button>
            ))
          )}
        </div>
        {/* Messages */}
        <div className="flex-1 flex flex-col">
          {activeContact ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {contactChats.map(c => (
                  <div key={c.id} className={`flex ${c.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${c.sender_id === profile?.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800'}`}>{c.message}</div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-200 flex gap-2">
                <input className="input flex-1" value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." />
                <button onClick={sendMessage} className="btn-primary">Send</button>
              </div>
            </>
          ) : <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Select a conversation</div>}
        </div>
      </div>
    </div>
  )
}
