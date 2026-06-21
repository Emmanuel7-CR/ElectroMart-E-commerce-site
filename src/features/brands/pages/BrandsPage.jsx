import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Award, ExternalLink } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { brandService } from '@/services/brandService'

export function BrandsPage() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    brandService.getAll()
      .then(setBrands)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <SEO title="All Brands" description="Browse all brands available in our store." />
      <div className="container-base py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">All Brands</h1>
          <p className="text-text-secondary mt-1">Shop your favourite brands</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : brands.length === 0 ? (
          <EmptyState icon={Award} title="No brands yet" description="Brands will appear here once added." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {brands.map(brand => (
              <Link
                key={brand.id}
                to={`/brands/${brand.slug}`}
                className="group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-border bg-surface hover:border-primary/30 hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5"
              >
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="h-10 w-auto object-contain filter dark:brightness-0 dark:invert"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {brand.name[0]}
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <p className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                    {brand.name}
                  </p>
                  {brand.website_url && (
                    <div className="flex items-center justify-center gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-3 h-3 text-text-muted" />
                      <span className="text-xs text-text-muted">Visit site</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default BrandsPage
