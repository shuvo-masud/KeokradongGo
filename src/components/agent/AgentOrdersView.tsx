import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

const STATUS = [
  'pending',
  'assigned',
  'on_delivery',
  'delivered',
  'cancelled'
]

export default function AgentOrdersView() {
  const { profile } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    if (profile?.id) {
      loadOrders()
    }
  }, [profile])

  async function loadOrders() {
    if (!profile?.id) return
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          buyer_id,
          shipping_address,
          created_at,
          status,
          total,
          shipping_cost,
          tax,
          payment_method,
          payment_mobile,
          transaction_id,
          buyer:profiles!orders_buyer_id_fkey(
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('assigned_agent_id', profile.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error("Agent orders loading failed:", error)
    } finally {
      setLoading(false)
    }
  }

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
          district:districts(
            id,
            name
          ),
          products(
            title,
            image_url,
            seller:profiles!seller_id(
              full_name,
              email,
              phone,        
              business_name
            )
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

  async function updateStatus(orderId: string, status: string, e?: React.ChangeEvent<HTMLSelectElement>) {
    if (e) e.stopPropagation()
      
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) {
      alert(error.message)
      return
    }

    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o))
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status })
    }
  }

  if (loading) {
    return <div className="card p-10 text-center text-gray-500 font-medium">Loading assigned delivery orders...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Delivery Orders</h1>
        <p className="text-gray-500 text-sm">Orders assigned to you for delivery. Click any order for full details.</p>
      </div>

      {orders.length === 0 ? (
        <div className="card p-10 text-center text-gray-400">No assigned delivery orders</div>
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
                    order.status === 'on_delivery' ? 'bg-blue-50 text-blue-700' :
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

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-end animate-fadeIn">
          <div className="bg-white w-full max-w-xl h-full overflow-y-auto p-6 space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-gray-400 uppercase">Order Details</span>
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

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Update Status</label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold outline-none focus:border-primary-500"
                >
                  {STATUS.map(s => (
                    <option key={s} value={s}>{s.toUpperCase().replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Customer & Delivery Info</h3>
                <div className="text-xs space-y-1.5 text-gray-700">
                  <p><strong>Name:</strong> {selectedOrder.buyer?.full_name || 'N/A'}</p>
                  <p><strong>Phone:</strong> {selectedOrder.buyer?.phone || selectedOrder.payment_mobile || 'N/A'}</p>
                  <p><strong>Address:</strong> {selectedOrder.shipping_address}</p>
                  <p><strong>Payment Method:</strong> <span className="uppercase font-bold text-primary-700">{selectedOrder.payment_method || 'Cash'}</span></p>
                  {selectedOrder.transaction_id && (
                    <p><strong>TrxID:</strong> <span className="font-mono bg-white px-1.5 py-0.5 rounded border">{selectedOrder.transaction_id}</span></p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Ordered Products</h3>
                {loadingDetails ? (
                  <p className="text-xs text-gray-400 text-center py-4">Loading items...</p>
                ) : (
                  <div className="space-y-2">
                    {orderItems.map(item => (
                      <div key={item.id} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
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

                        <div className="pt-2 border-t border-gray-200/60 flex justify-between items-center text-[11px] text-gray-500">
                          <span>
                            Seller: <strong className="text-gray-700">{item.products?.seller?.business_name || item.products?.seller?.full_name || 'N/A'}</strong>
                          </span>
                          <span>
                            District: <span className="text-primary-600 font-bold">📍 {item.district?.name || 'N/A'}</span>
                          </span>
                        </div>
                        {item.products?.seller?.phone && (
    <div>
      Seller Phone: <a href={`tel:${item.products.seller.phone}`} className="text-primary-600 font-semibold hover:underline">📞 {item.products.seller.phone}</a>
    </div>
  )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

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