import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'


export default function SellerOrdersView() {

  const { profile } = useAuth()

  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {

    if(profile?.id){
      loadOrders()
    }

  }, [profile])


  async function loadOrders(){

    try{

      const {data,error}=await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          unit_price,

          products(
            title
          ),

          orders(
            id,
            status,
            shipping_address,
            created_at
          )

        `)
        .eq(
          'seller_id',
          profile!.id
        )


      if(error)
        throw error


      setOrders(data || [])


    }catch(error){

      console.error(error)

    }finally{

      setLoading(false)

    }

  }



  if(loading){

    return (
      <div className="p-10 text-center">
        Loading orders...
      </div>
    )

  }



  return (

    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        Seller Orders
      </h1>


      {
        orders.length===0 ?

        <div className="card p-8 text-center text-gray-500">
          No orders yet
        </div>

        :

        <div className="space-y-4">


        {
          orders.map((item)=>(
            
            <div
              key={item.id}
              className="card p-5"
            >

              <h3 className="font-bold text-lg">
                {item.products?.title}
              </h3>


              <p>
                Quantity:
                {' '}
                {item.quantity}
              </p>


              <p>
                Price:
                {' '}
                ৳ {item.unit_price}
              </p>


              <p>
                Status:
                {' '}
                <span className="font-semibold">
                  {item.orders?.status}
                </span>
              </p>


              <p className="text-sm text-gray-500">
                {item.orders?.shipping_address}
              </p>


            </div>

          ))
        }


        </div>

      }


    </div>

  )

}