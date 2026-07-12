import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

export default function OverviewView() {
  const { profile } = useAuth()

  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    pending: 0,
    revenue: 0,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.id) {
      loadStats()
    }
  }, [profile])

  async function loadStats() {
    try {
      setLoading(true)

      const sellerId = profile!.id

      // Products
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', sellerId)


      // Orders
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          quantity,
          unit_price,
          orders(
            status
          )
        `)
        .eq('seller_id', sellerId)


      let orders = 0
      let pending = 0
      let revenue = 0

      orderItems?.forEach((item: any) => {
        orders++

        revenue +=
          Number(item.quantity) *
          Number(item.unit_price)

        if (item.orders?.status === 'pending') {
          pending++
        }
      })


      setStats({
        products: productCount || 0,
        orders,
        pending,
        revenue,
      })

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }


  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading dashboard...
      </div>
    )
  }


  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        Seller Overview
      </h1>


      <div className="grid md:grid-cols-4 gap-5">


        <div className="card p-5">
          <p className="text-gray-500">
            Products
          </p>
          <h2 className="text-3xl font-bold">
            {stats.products}
          </h2>
        </div>


        <div className="card p-5">
          <p className="text-gray-500">
            Orders
          </p>
          <h2 className="text-3xl font-bold">
            {stats.orders}
          </h2>
        </div>


        <div className="card p-5">
          <p className="text-gray-500">
            Pending
          </p>
          <h2 className="text-3xl font-bold">
            {stats.pending}
          </h2>
        </div>


        <div className="card p-5">
          <p className="text-gray-500">
            Revenue
          </p>

          <h2 className="text-3xl font-bold">
            ৳ {stats.revenue}
          </h2>
        </div>


      </div>

    </div>
  )
}