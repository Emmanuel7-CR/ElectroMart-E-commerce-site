import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Eye, ImageOff } from 'lucide-react'
import { cn } from '@/utils/helpers'
import { formatCurrency } from '@/utils/currency'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useUIStore } from '@/store/uiStore'
import { Badge } from '@/components/ui/Badge'
import RatingStars from './RatingStars'

export function ProductCard({ product, className }) {
  const [imgError, setImgError] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)

  const { addItem, openCart } = useCartStore()
  const { toggle: toggleWishlist, hasItem } = useWishlistStore()
  const { toastSuccess } = useUIStore()

  const isWishlisted = hasItem(product.id)
  const hasVariants = product.variants?.length > 0
  const inStock = product.inStock !== false

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!inStock || hasVariants) return
    setAddingToCart(true)
    addItem(product, null, 1)
    toastSuccess(`${product.name} added to cart`)
    openCart()
    setTimeout(() => setAddingToCart(false), 600)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }

  return (
    <article className={cn('group relative bg-surface border border-border rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5', className)}>
      {/* Image area */}
      <Link to={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden bg-background" tabIndex={-1} aria-hidden="true">
        {product.primaryImage && !imgError ? (
          <img
            src={product.primaryImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="w-10 h-10 text-text-muted" aria-hidden="true" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {product.discountPercent && (
            <span className="px-2 py-0.5 bg-danger text-white text-xs font-bold rounded-full">
              -{product.discountPercent}%
            </span>
          )}
          {product.is_featured && (
            <span className="px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
              Featured
            </span>
          )}
          {!inStock && (
            <span className="px-2 py-0.5 bg-secondary/80 text-white text-xs font-medium rounded-full">
              Out of stock
            </span>
          )}
        </div>

        {/* Hover actions */}
        <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/10 transition-colors duration-200" />
        <div className="absolute bottom-2.5 right-2.5 flex flex-col gap-1.5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={handleWishlist}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center shadow-dropdown transition-colors',
              isWishlisted
                ? 'bg-danger text-white'
                : 'bg-surface text-text-secondary hover:bg-danger hover:text-white'
            )}
            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          >
            <Heart className={cn('w-3.5 h-3.5', isWishlisted && 'fill-current')} />
          </button>
          <Link
            to={`/products/${product.slug}`}
            onClick={e => e.stopPropagation()}
            className="w-8 h-8 rounded-full bg-surface text-text-secondary flex items-center justify-center shadow-dropdown hover:bg-primary hover:text-white transition-colors"
            aria-label={`Quick view ${product.name}`}
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        {/* Category */}
        {product.categories && (
          <Link
            to={`/categories/${product.categories.slug}`}
            className="text-xs text-text-muted hover:text-primary transition-colors mb-1 block"
            onClick={e => e.stopPropagation()}
          >
            {product.categories.name}
          </Link>
        )}

        {/* Name */}
        <Link to={`/products/${product.slug}`} className="block group/name">
          <h3 className="font-medium text-text-primary text-sm leading-snug line-clamp-2 group-hover/name:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Brand */}
        {product.brands && (
          <p className="text-xs text-text-muted mt-0.5">{product.brands.name}</p>
        )}

        {/* Rating placeholder - filled by Phase 11 */}
        {product.avgRating > 0 && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <RatingStars rating={product.avgRating} size="sm" />
            <span className="text-xs text-text-muted">({product.reviewCount})</span>
          </div>
        )}

        {/* Price row */}
        <div className="flex items-center justify-between mt-3 gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-text-primary">
              {formatCurrency(product.price)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-xs text-text-muted line-through">
                {formatCurrency(product.compare_price)}
              </span>
            )}
          </div>

          {/* Add to cart */}
          {!hasVariants ? (
            <button
              onClick={handleAddToCart}
              disabled={!inStock || addingToCart}
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 shrink-0',
                inStock
                  ? 'bg-primary text-white hover:bg-primary-hover active:scale-95'
                  : 'bg-border text-text-muted cursor-not-allowed'
              )}
              aria-label={inStock ? `Add ${product.name} to cart` : 'Out of stock'}
            >
              <ShoppingCart className={cn('w-3.5 h-3.5', addingToCart && 'animate-spin')} />
            </button>
          ) : (
            <Link
              to={`/products/${product.slug}`}
              className="text-xs font-medium text-primary hover:text-primary-hover transition-colors shrink-0"
            >
              Choose options
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}

export default ProductCard
