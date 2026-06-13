import { Heart } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { EmptyState } from '@/components/ui/EmptyState'
import { useWishlistStore } from '@/store/wishlistStore'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/currency'

export function WishlistPage() {
  const { items, removeItem } = useWishlistStore()

  return (
    <>
      <SEO title="Wishlist" noIndex />
      <div className="container-base py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-text-primary">
            Wishlist
            {items.length > 0 && (
              <span className="ml-2 text-base font-normal text-text-muted">({items.length})</span>
            )}
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Heart}
              title="Your wishlist is empty"
              description="Save items you love by clicking the heart icon on any product."
              action={{ label: 'Browse products', onClick: () => window.location.href = '/products' }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map(item => (
              <div key={item.product_id} className="card group">
                <div className="aspect-square rounded-lg bg-background mb-4 overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="w-10 h-10 text-text-muted" />
                    </div>
                  )}
                </div>
                <p className="font-medium text-text-primary mb-1 truncate">{item.name}</p>
                <p className="text-sm font-bold text-primary mb-3">{formatCurrency(item.price)}</p>
                <div className="flex gap-2">
                  <Link to={`/products/${item.slug}`} className="flex-1">
                    <Button variant="primary" size="sm" className="w-full">View</Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(item.product_id)}
                    aria-label="Remove from wishlist"
                  >
                    <Heart className="w-3.5 h-3.5 fill-danger text-danger" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default WishlistPage
