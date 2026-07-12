import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/auth'

import OverviewView from '../components/seller/OverviewView'
import AddProductView from '../components/seller/AddProductView'
import ProductsView from '../components/seller/ProductsView'
import SellerOrdersView from '../components/seller/SellerOrdersView'

export default function SellerDashboard() {
  const { profile } = useAuth()
  const [params] = useSearchParams()

  const tab = params.get('tab') || 'overview'

  if (profile?.status === 'pending') {
    return (
      <div className="max-w-lg mx-auto mt-20 card p-10 text-center">
        <div className="text-5xl mb-4">⏳</div>

        <h2 className="font-display font-bold text-xl mb-2">
          Account Pending Approval
        </h2>

        <p className="text-gray-500">
          Your seller account is under review.
        </p>
      </div>
    )
  }

  if (profile?.status === 'suspended') {
    return (
      <div className="max-w-lg mx-auto mt-20 card p-10 text-center">
        <div className="text-5xl mb-4">🚫</div>

        <h2 className="font-display font-bold text-xl mb-2">
          Account Suspended
        </h2>

        <p className="text-gray-500">
          Please contact support.
        </p>
      </div>
    )
  }

  switch (tab) {
    case 'add':
      return <AddProductView />

    case 'products':
      return <ProductsView />

    case 'orders':
      return <SellerOrdersView />

    default:
      return <OverviewView />
  }
}