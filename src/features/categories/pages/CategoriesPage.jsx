import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Tag } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { categoryService } from '@/services/categoryService'
import { cn } from '@/utils/helpers'

const ICON_MAP = {
  electronics: '💻', fashion: '👗', 'home-living': '🏠', sports: '⚽',
  beauty: '✨', books: '📚',
}
const COLOR_MAP = [
  'from-blue-500/10 to-blue-500/5', 'from-pink-500/10 to-pink-500/5',
  'from-amber-500/10 to-amber-500/5', 'from-green-500/10 to-green-500/5',
  'from-purple-500/10 to-purple-500/5', 'from-orange-500/10 to-orange-500/5',
]

export function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    categoryService.getAll()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <SEO title="All Categories" description="Browse all product categories in our store." />
      <div className="container-base py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">All Categories</h1>
          <p className="text-text-secondary mt-1">Browse our full range of product categories</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <EmptyState icon={Tag} title="No categories yet" description="Categories will appear here once added." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className={cn(
                  'group relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl',
                  'border border-border bg-gradient-to-br hover:border-primary/30',
                  'transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5',
                  COLOR_MAP[i % COLOR_MAP.length]
                )}
              >
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-12 h-12 object-contain" />
                ) : (
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
                    {ICON_MAP[cat.slug] || '🛍️'}
                  </span>
                )}
                <div className="text-center">
                  <p className="font-semibold text-text-primary">{cat.name}</p>
                  {cat.description && (
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{cat.description}</p>
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

export default CategoriesPage
