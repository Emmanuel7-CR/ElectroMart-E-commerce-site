import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SEO } from '@/components/shared/SEO'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

export function OrdersPage() {
  return (
    <>
      <SEO title="My Orders" noIndex />
      <div className="container-base py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-8">My Orders</h1>
        <div className="card">
          <EmptyState
            icon={ShoppingBag}
            title="No orders yet"
            description="When you place your first order, it will appear here."
            action={{
              label: 'Start shopping',
              onClick: () => {},
            }}
          />
        </div>
      </div>
    </>
  )
}

export default OrdersPage
