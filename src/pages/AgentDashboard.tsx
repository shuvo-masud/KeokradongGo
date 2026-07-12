import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import AgentOrdersView from '../components/agent/AgentOrdersView'
import {
  supabase,
  Product,
  District,
  Verification,
  Profile,
  PlatformSettings,
} from '../lib/supabase'

const PRODUCT_IMAGES: Record<string, string> = {
  Fruits:
    'https://images.pexels.com/photos/918843/pexels-photo-918843.jpeg?auto=compress&cs=tinysrgb&w=600',
  Textiles:
    'https://images.pexels.com/photos/57840/pexels-photo-57840.jpeg?auto=compress&cs=tinysrgb&w=600',
  Fish:
    'https://images.pexels.com/photos/3296394/pexels-photo-3296394.jpeg?auto=compress&cs=tinysrgb&w=600',
  Tea:
    'https://images.pexels.com/photos/230477/pexels-photo-230477.jpeg?auto=compress&cs=tinysrgb&w=600',
  Handicraft:
    'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&w=600',
  Spices:
    'https://images.pexels.com/photos/1340116/pexels-photo-1340116.jpeg?auto=compress&cs=tinysrgb&w=600',
  Other:
    'https://images.pexels.com/photos/4198023/pexels-photo-4198023.jpeg?auto=compress&cs=tinysrgb&w=600',
}

type AgentProduct = Product & {
  district?: District
  seller?: Profile
}

export default function AgentDashboard() {
  const [params, setParams] = useSearchParams()

  const tab = params.get('tab') || 'verify'


  return (
    <div className="space-y-6">

      <div className="card p-4 flex gap-3">

        <button
          onClick={() => setParams({tab:'verify'})}
          className={
            tab === 'verify'
            ? 'btn-primary'
            : 'btn-secondary'
          }
        >
          Verification
        </button>


        <button
          onClick={() => setParams({tab:'orders'})}
          className={
            tab === 'orders'
            ? 'btn-primary'
            : 'btn-secondary'
          }
        >
          Orders
        </button>


        <button
          onClick={() => setParams({tab:'earnings'})}
          className={
            tab === 'earnings'
            ? 'btn-primary'
            : 'btn-secondary'
          }
        >
          Earnings
        </button>

      </div>


      {
        tab === 'orders'
        ? <AgentOrdersView />

        : tab === 'earnings'
        ? <EarningsView />

        : <VerifyView />
      }


    </div>
  )
}


function VerifyView() {
  const { profile } = useAuth()

  const [products, setProducts] = useState<AgentProduct[]>([])
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [settings, setSettings] = useState<PlatformSettings | null>(null)

  const [inspectProduct, setInspectProduct] =
    useState<AgentProduct | null>(null)

  const [loading, setLoading] = useState(true)


  const loadData = useCallback(async () => {
    if (!profile?.district_id) return

    setLoading(true)

    try {
      const [
        productsResponse,
        verificationResponse,
        settingsResponse,
      ] = await Promise.all([

        supabase
          .from('products')
          .select(`
            *,
            district:districts(*),
            seller:profiles!products_seller_id_fkey(*)
          `)
          .eq('district_id', profile.district_id)
          .order('created_at', {
            ascending: false,
          }),


        supabase
          .from('verifications')
          .select('*')
          .eq('agent_id', profile.id)
          .order('created_at', {
            ascending:false,
          }),


        supabase
          .from('platform_settings')
          .select('*')
          .maybeSingle(),
      ])


      if (productsResponse.error)
        throw productsResponse.error

      if (verificationResponse.error)
        throw verificationResponse.error


      setProducts(
        (productsResponse.data ?? []) as AgentProduct[]
      )

      setVerifications(
        verificationResponse.data ?? []
      )

      setSettings(
        settingsResponse.data as PlatformSettings
      )


    } catch (error) {

      console.error(
        'Agent dashboard loading failed:',
        error
      )

    } finally {

      setLoading(false)

    }

  }, [profile])


  useEffect(() => {
    loadData()
  }, [loadData])


  const pending =
    products.filter(
      p => p.verification_status === 'pending'
    )

  const verified =
    products.filter(
      p => p.verification_status === 'verified'
    )

  const rejected =
    products.filter(
      p => p.verification_status === 'rejected'
    )


  if (loading) {
    return (
      <div className="card p-10 text-center">
        Loading verification center...
      </div>
    )
  }


  return (
    <div className="space-y-6">

      <div>
        <h1 className="font-display font-bold text-2xl">
          Verification Center
        </h1>

        <p className="text-gray-500 text-sm mt-1">
          Inspect and verify products in your assigned district
        </p>
      </div>


      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <StatCard
          icon="⏳"
          title="Pending Inspection"
          value={pending.length}
        />

        <StatCard
          icon="✓"
          title="Verified"
          value={verified.length}
        />

        <StatCard
          icon="✕"
          title="Rejected"
          value={rejected.length}
        />

        <StatCard
          icon="💰"
          title="Earnings"
          value={`৳${(
            verifications.length *
            (settings?.agent_commission ?? 150)
          ).toFixed(0)}`}
        />

      </div>


      <section>

        <h2 className="font-display font-bold text-lg mb-3">
          Pending Verification Queue
        </h2>


        {pending.length === 0 ? (

          <div className="card p-12 text-center text-gray-400">
            No products pending inspection.
          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {pending.map(product => (

              <ProductCard
                key={product.id}
                product={product}
                onInspect={() =>
                  setInspectProduct(product)
                }
              />

            ))}

          </div>

        )}

      </section>


      {inspectProduct && (

        <InspectModal
          product={inspectProduct}
          onClose={() =>
            setInspectProduct(null)
          }
          onSubmitted={loadData}
        />

      )}

    </div>
  )
}
function StatCard({
  icon,
  title,
  value,
}: {
  icon: string
  title: string
  value: string | number
}) {
  return (
    <div className="card p-5">
      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center text-lg mb-3">
        {icon}
      </div>

      <div className="text-2xl font-display font-bold">
        {value}
      </div>

      <div className="text-xs text-gray-500 mt-1">
        {title}
      </div>
    </div>
  )
}



function ProductCard({
  product,
  onInspect,
}: {
  product: AgentProduct
  onInspect: () => void
}) {

  return (
    <div className="card overflow-hidden hover:shadow-lg transition">

      <div className="h-40 bg-gray-100">

        <img
          src={
            product.image_url ||
            PRODUCT_IMAGES[product.category] ||
            PRODUCT_IMAGES.Other
          }
          alt={product.title}
          className="w-full h-full object-cover"
        />

      </div>


      <div className="p-4">

        <h3 className="font-semibold truncate">
          {product.title}
        </h3>


        <div className="text-xs text-gray-500 mt-1">
          📍 {product.district?.name ?? 'Unknown district'}
          {' · '}
          {product.category}
        </div>


        <div className="text-xs text-gray-500 mt-1">
          Seller:
          {' '}
          {product.seller?.full_name ?? 'Unknown'}
        </div>


        <div className="flex justify-between items-center mt-3">

          <span className="font-bold text-lg text-primary-700">
            ৳{Number(product.price ?? 0).toFixed(0)}
          </span>


          <span className="text-xs text-gray-400">
            {product.stock ?? 0} units
          </span>

        </div>


        <button
          onClick={onInspect}
          className="btn-primary w-full mt-3"
        >
          Inspect Now
        </button>

      </div>

    </div>
  )
}




function InspectModal({
  product,
  onClose,
  onSubmitted,
}: {
  product: AgentProduct
  onClose: () => void
  onSubmitted: () => void
}) {

  const { profile } = useAuth()

  const [status, setStatus] =
    useState<'verified' | 'rejected'>('verified')

  const [report, setReport] =
    useState('')

  const [qualityScore, setQualityScore] =
    useState(5)

  const [saving, setSaving] =
    useState(false)



  async function submitInspection(
    e: React.FormEvent
  ) {

    e.preventDefault()

    if (!profile || saving)
      return


    setSaving(true)


    try {

      const { error: verificationError } =
        await supabase
          .from('verifications')
          .insert({

            product_id: product.id,

            agent_id: profile.id,

            status,

            report,

            quality_score:
              status === 'verified'
                ? qualityScore
                : null,

          })


      if (verificationError)
        throw verificationError



      const { error: productError } =
        await supabase
          .from('products')
          .update({

            verification_status: status,

            verified_at:
              new Date().toISOString(),

          })
          .eq('id', product.id)


      if (productError)
        throw productError



      await supabase
        .from('notifications')
        .insert({

          user_id: product.seller_id,

          type:'verification',

          title:
            status === 'verified'
              ? 'Product Verified!'
              : 'Product Rejected',

          body:
            `${product.title} has been ${status} by ${profile.full_name}`,

        })


      onSubmitted()

      onClose()


    } catch(error){

      console.error(
        'Inspection failed:',
        error
      )

    } finally {

      setSaving(false)

    }

  }



  return (

    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >

      <div
        className="bg-white rounded-2xl max-w-lg w-full p-6"
        onClick={
          e => e.stopPropagation()
        }
      >

        <div className="flex justify-between mb-5">

          <h2 className="font-bold text-lg">
            Inspection Report
          </h2>


          <button onClick={onClose}>
            ✕
          </button>

        </div>



        <div className="flex gap-3 card p-3 mb-5">

          <img
            src={
              product.image_url ||
              PRODUCT_IMAGES[product.category] ||
              PRODUCT_IMAGES.Other
            }
            className="w-16 h-16 rounded-lg object-cover"
          />


          <div>

            <div className="font-semibold">
              {product.title}
            </div>

            <div className="text-xs text-gray-500">
              📍 {product.district?.name}
              {' · '}
              ৳{product.price}
            </div>


          </div>

        </div>



        <form
          onSubmit={submitInspection}
          className="space-y-4"
        >

          <div className="grid grid-cols-2 gap-3">

            <button
              type="button"
              onClick={() => setStatus('verified')}
              className={
                status === 'verified'
                ? 'border-primary-500 bg-primary-50 p-3 rounded-xl'
                : 'border p-3 rounded-xl'
              }
            >
              ✓ Approve
            </button>


            <button
              type="button"
              onClick={() => setStatus('rejected')}
              className={
                status === 'rejected'
                ? 'border-red-500 bg-red-50 p-3 rounded-xl'
                : 'border p-3 rounded-xl'
              }
            >
              ✕ Reject
            </button>

          </div>



          <textarea

            required

            value={report}

            onChange={
              e => setReport(e.target.value)
            }

            placeholder="Inspection findings..."

            className="input min-h-[120px] w-full"

          />



          {status === 'verified' && (

            <div>

              <label className="text-sm">
                Quality Score: {qualityScore}/5
              </label>


              <div className="flex gap-2 mt-2">

                {[1,2,3,4,5].map(n => (

                  <button

                    type="button"

                    key={n}

                    onClick={() =>
                      setQualityScore(n)
                    }

                    className={
                      n <= qualityScore
                      ? "bg-primary-600 text-white w-10 h-10 rounded-lg"
                      : "bg-gray-100 w-10 h-10 rounded-lg"
                    }

                  >
                    ★
                  </button>

                ))}

              </div>

            </div>

          )}



          <button
            disabled={saving}
            className="btn-primary w-full py-3"
          >
            {saving
              ? 'Submitting...'
              : 'Submit Inspection'}
          </button>


        </form>

      </div>

    </div>

  )
}






function EarningsView(){

  const { profile } = useAuth()

  const [
    verifications,
    setVerifications
  ] =
    useState<
      (Verification & {
        product: Product
      })[]
    >([])


  const [
    settings,
    setSettings
  ] =
    useState<PlatformSettings | null>(null)



  useEffect(()=>{

    if(!profile)
      return


    Promise.all([

      supabase
        .from('verifications')
        .select(
          '*, product:products(*)'
        )
        .eq(
          'agent_id',
          profile.id
        )
        .order(
          'created_at',
          {
            ascending:false
          }
        ),


      supabase
        .from('platform_settings')
        .select('*')
        .maybeSingle()


    ])
    .then(([v,s])=>{

      setVerifications(
        (v.data ?? []) as any
      )

      setSettings(
        s.data as PlatformSettings
      )

    })


  },[profile])



  const commission =
    settings?.agent_commission ?? 150


  return (

    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        Earnings & Commission
      </h1>


      <div className="card p-6">

        <div className="text-3xl font-bold text-primary-700">
          ৳{(
            verifications.length *
            commission
          ).toFixed(0)}
        </div>


        <div className="text-gray-500">
          Total earnings
        </div>

      </div>


      <div className="card divide-y">

        {
          verifications.map(v=>(

            <div
              key={v.id}
              className="p-4 flex justify-between"
            >

              <div>
                <div className="font-medium">
                  {v.product?.title}
                </div>

                <div className="text-xs text-gray-500">
                  {v.report}
                </div>

              </div>


              <div className="font-bold text-primary-700">
                +৳{commission}
              </div>

            </div>

          ))
        }

      </div>


    </div>

  )

}