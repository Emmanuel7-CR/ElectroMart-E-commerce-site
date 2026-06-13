import { Package } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { EmptyState } from '@/components/ui/EmptyState'

export function ProductListPage() {
  return (
    <>
      <SEO title="All Products" />
      <div className="container-base py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">All Products</h1>
        <p className="text-text-secondary mb-8">
          Full product catalog coming in Phase 2
        </p>
        <div className="card">
          <EmptyState
            icon={Package}
            title="Products loading in Phase 2"
            description="The full product catalog with filters, search, and sorting will be built in Phase 2."
          />
        </div>
      </div>
    </>
  )
}

export default ProductListPage
