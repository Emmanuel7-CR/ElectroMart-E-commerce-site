import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { ProductGrid } from '@/features/products/components/ProductGrid'
import { ProductSort } from '@/features/products/components/ProductSort'
import { Pagination } from '@/components/ui/Pagination'
import { useProducts } from '@/features/products/hooks/useProducts'

export function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const { products, total, totalPages, page, loading, error, sortBy, setPage, setSort } = useProducts()

  return (
    <>
      <SEO title={query ? `Search: "${query}"` : 'Search'} noIndex />
      <div className="container-base py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <Search className="w-4 h-4" />
            <span className="text-sm">Search results</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            {query ? (
              <>"{query}"</>
            ) : (
              'All Products'
            )}
          </h1>
          {!loading && (
            <p className="text-sm text-text-secondary mt-1">
              {total} {total === 1 ? 'result' : 'results'} found
            </p>
          )}
        </div>

        {/* Sort + Grid */}
        <div className="flex items-center justify-between mb-5">
          <span />
          <ProductSort value={sortBy} onChange={setSort} />
        </div>

        <ProductGrid
          products={products}
          loading={loading}
          error={error}
        />

        {totalPages > 1 && (
          <div className="flex justify-center mt-10">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </>
  )
}

export default SearchResultsPage
