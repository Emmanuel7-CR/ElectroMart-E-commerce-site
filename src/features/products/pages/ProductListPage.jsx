import { useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { ProductGrid } from '../components/ProductGrid'
import { ProductFilters } from '../components/ProductFilters'
import { ProductSort } from '../components/ProductSort'
import { ProductBreadcrumb } from '../components/ProductBreadcrumb'
import { Pagination } from '@/components/ui/Pagination'
import { Button } from '@/components/ui/Button'
import { useProducts } from '../hooks/useProducts'

export function ProductListPage() {
  const { slug } = useParams()
  const location = useLocation()
  const isBrandRoute = location.pathname.startsWith('/brands/')
  const categorySlug = isBrandRoute ? undefined : slug
  const brandSlug = isBrandRoute ? slug : undefined
  const [filtersOpen, setFiltersOpen] = useState(false)

  const {
    products, total, totalPages, page, loading, error,
    sortBy, setPage, setSort, clearFilters,
  } = useProducts({ categorySlug, brandSlug })

  const crumbs = categorySlug
    ? [{ label: 'Products', href: '/products' }, { label: categorySlug }]
    : [{ label: 'Products' }]

  return (
    <>
      <SEO
        title={categorySlug ? `${categorySlug.replace(/-/g, ' ')} — Products` : 'All Products'}
        description="Browse our full range of premium products."
      />

      <div className="container-base py-6">
        <ProductBreadcrumb crumbs={crumbs} className="mb-4" />

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary capitalize">
              {categorySlug
              ? categorySlug.replace(/-/g, ' ')
              : brandSlug
              ? brandSlug.replace(/-/g, ' ')
              : 'All Products'}
            </h1>
            {!loading && (
              <p className="text-sm text-text-secondary mt-0.5">
                {total} {total === 1 ? 'product' : 'products'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden"
              leftIcon={SlidersHorizontal}
            >
              Filters
            </Button>
            <ProductSort value={sortBy} onChange={setSort} />
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="card sticky top-24 p-4">
              <ProductFilters />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <ProductGrid
              products={products}
              loading={loading}
              error={error}
              onClearFilters={clearFilters}
            />
            {totalPages > 1 && (
              <div className="flex justify-center mt-10">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {filtersOpen && (
        <>
          <div
            className="fixed inset-0 bg-secondary/50 z-40 lg:hidden"
            onClick={() => setFiltersOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-surface z-50 overflow-y-auto p-5 animate-slide-in-right lg:hidden">
            <ProductFilters onClose={() => setFiltersOpen(false)} />
          </div>
        </>
      )}
    </>
  )
}

export default ProductListPage
