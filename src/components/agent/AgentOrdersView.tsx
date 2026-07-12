import { useEffect, useState, useCallback } from 'react'
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

  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  if (profile?.id) {
    console.log("Agent ID:", profile.id)
    loadOrders()
  }
}, [profile])


async function loadOrders() {

  if (!profile?.id) return

  setLoading(true)

  try {

    // 1. Get assigned orders
    const { data: orders, error: orderError } = await supabase
  .from('orders')
  .select(`
    id,
    buyer_id,
    shipping_address,
    created_at,
    status,
    buyer:profiles!orders_buyer_id_fkey(
      id,
      full_name,
      email
    )
  `)
  .eq('assigned_agent_id', profile.id)
  console.log("Orders with buyers:", orders)


    if(orderError){
  console.error("ORDER QUERY ERROR:", orderError)
  throw orderError
}

console.log("Assigned orders:", orders)


    if(!orders || orders.length === 0){

      setItems([])
      return

    }


    const orderIds = orders.map(
      order => order.id
    )


    // 2. Get items of those orders
    const { data: items, error:itemError } = await supabase
  .from('order_items')
  .select(`
    id,
    order_id,
    quantity,
    unit_price,
    district_id,

    products(
      title,
      image_url
    )
  `)
  .in(
    'order_id',
    orderIds
  )


    if(itemError)
      throw itemError



    const merged = items?.map(item => ({
      ...item,
      orders: orders.find(
        o => o.id === item.order_id
      )
    })) || []


    setItems(merged)



  } catch(error){

    console.error(
      "Agent orders loading failed:",
      error
    )

  } finally {

    setLoading(false)

  }

}





  async function updateStatus(
  orderId: string,
  status: string
) {

  const { error } = await supabase
    .from('orders')
    .update({
      status
    })
    .eq(
      'id',
      orderId
    )

  if(error){
    console.error(
      "Status update failed:",
      error
    )
    alert(error.message)
    return
  }

  loadOrders()
}





  if(loading){

    return (

      <div className="card p-10 text-center">

        Loading assigned delivery orders...

      </div>

    )

  }




  return (

    <div className="space-y-6">


      <div>

        <h1 className="text-2xl font-bold">
          Delivery Orders
        </h1>

        <p className="text-gray-500 text-sm">
          Orders assigned to you for delivery
        </p>

      </div>




      {
        items.length === 0 ?


        (

          <div className="card p-10 text-center text-gray-400">

            No assigned delivery orders

          </div>

        )


        :


        (

          <div className="space-y-4">


          {
            items.map(item => (

              <div
                key={item.id}
                className="card p-5 space-y-4"
              >



                <div className="flex justify-between items-center">

                  <div>

                    <h3 className="font-bold">

                      Order #
                      {item.orders?.id?.slice(0,8)}

                    </h3>


                    <p className="text-xs text-gray-500">

                      {
                        item.orders?.created_at
                        &&
                        new Date(
                          item.orders.created_at
                        ).toLocaleDateString()
                      }

                    </p>

                  </div>


                  <div className="font-bold text-primary-600">

                    ৳
                    {
                      (
                        item.unit_price *
                        item.quantity
                      ).toFixed(0)
                    }

                  </div>


                </div>





                <div className="flex gap-4">


                  <img

                    src={
                      item.products?.image_url ||
                      '/placeholder.png'
                    }

                    className="w-20 h-20 rounded-xl object-cover"

                    alt="product"

                  />


                  <div>


                    <h3 className="font-semibold">

                      {
                        item.products?.title
                      }

                    </h3>


                    <p className="text-sm text-gray-500">

                      Quantity:
                      {' '}
                      {item.quantity}

                    </p>


                    <p className="text-sm text-gray-500">

                      District ID:
                      {' '}
                      {item.district_id}

                    </p>


                  </div>


                </div>






                <div className="space-y-1 text-sm">


                  <p>

                    <strong>
                      Customer:
                    </strong>

                    {' '}

                    {
                      item.orders?.buyer?.full_name
                      ||
                      'Unknown'
                    }

                  </p>




                  <p>

                    <strong>
                      Address:
                    </strong>

                    {' '}

                    {
                      item.orders?.shipping_address
                    }

                  </p>


                </div>







                <div>


                  <label className="text-sm font-semibold">

                    Delivery Status

                  </label>


                  <select
                  value={item.orders?.status || 'pending'}
                  onChange={(e)=> 
                   updateStatus(
                  item.orders.id,
                 e.target.value
                 )
                 }
                >


                    {
                      STATUS.map(status => (

                        <option

                          key={status}

                          value={status}

                        >

                          {status}

                        </option>

                      ))

                    }


                  </select>


                </div>




              </div>


            ))

          }


          </div>

        )

      }



    </div>

  )

}