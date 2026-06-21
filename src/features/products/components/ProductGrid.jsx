import { Package } from 'lucide-react'
import { ProductCard } from './ProductCard'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/utils/helpers'

export function ProductGrid({ products, loading, error, onClearFilters, className }) {
  if (error) {
    return (
      <EmptyState
        icon={Package}
        title="Failed to load products"
        description={error}
        action={{ label: 'Try again', onClick: () => window.location.reload() }}
        className={className}
      />
    )
  }

  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5', className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (!products?.length) {
    return (
      <EmptyState
        icon={Package}
        title="No products found"
        description="Try adjusting your filters or search term."
        action={onClearFilters ? { label: 'Clear filters', onClick: onClearFilters } : undefined}
        className={className}
      />
    )
  }

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5', className)}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default ProductGrid
