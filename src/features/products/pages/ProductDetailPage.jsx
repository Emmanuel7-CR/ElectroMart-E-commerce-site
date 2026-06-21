import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart, Heart, Share2, Truck, ShieldCheck,
  RefreshCw, Star, ChevronDown, ChevronUp, Minus, Plus
} from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { ProductImages } from '../components/ProductImages'
import { ProductVariants } from '../components/ProductVariants'
import { ProductBreadcrumb } from '../components/ProductBreadcrumb'
import { ProductGrid } from '../components/ProductGrid'
import { RatingStars } from '../components/RatingStars'
import { PageSpinner } from '@/components/ui/Spinner'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useProduct } from '../hooks/useProduct'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useUIStore } from '@/store/uiStore'
import { formatCurrency } from '@/utils/currency'
import { productService } from '@/services/productService'
import { cn } from '@/utils/helpers'
import { ReviewList } from '../components/ReviewList'

function AccordionSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full py-4 text-sm font-semibold text-text-primary hover:text-primary transition-colors"
        aria-expanded={open}
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="pb-4 text-sm text-text-secondary leading-relaxed">{children}</div>}
    </div>
  )
}

export function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { product, loading, error } = useProduct(slug)
  const [selectedOptions, setSelectedOptions] = useState({})
  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [addingToCart, setAddingToCart] = useState(false)
  const [addError, setAddError] = useState('')

  const { addItem, openCart } = useCartStore()
  const { toggle: toggleWishlist, hasItem } = useWishlistStore()
  const { toastSuccess } = useUIStore()

  const isWishlisted = product ? hasItem(product.id) : false

  // Auto-select first option value for each variant option
  useEffect(() => {
    if (product?.variant_options?.length) {
      const initial = {}
      product.variant_options.forEach(opt => {
        if (opt.values?.length) initial[opt.name] = opt.values[0]
      })
      setSelectedOptions(initial)
    }
  }, [product])

  // Load related products
  useEffect(() => {
    if (product) {
      productService
        .getRelatedProducts(product.id, product.category_id)
        .then(setRelatedProducts)
        .catch(() => {})
    }
  }, [product])

  if (loading) return <PageSpinner />
  if (error) return (
    <div className="container-base py-16 text-center">
      <p className="text-danger mb-4">{error}</p>
      <Button onClick={() => navigate('/products')}>Back to products</Button>
    </div>
  )
  if (!product) return null

  // Determine selected variant
  const allOptionsSelected = product.variant_options?.length
    ? Object.keys(selectedOptions).length === product.variant_options.length
    : true

  const selectedVariant = allOptionsSelected && product.variants?.length
    ? product.variants.find(v =>
        v.is_active &&
        Object.entries(selectedOptions).every(([k, val]) => v.options[k] === val)
      )
    : null

  const effectivePrice = selectedVariant?.price ?? product.price
  const effectiveCompare = selectedVariant?.compare_price ?? product.compare_price
  const inStock = product.variants?.length
    ? (selectedVariant ? selectedVariant.stock_qty > 0 : false)
    : true
  const stockQty = selectedVariant?.stock_qty ?? null
  const lowStock = stockQty !== null && stockQty > 0 && stockQty <= (selectedVariant?.low_stock_threshold ?? 5)

  const handleAddToCart = async () => {
    setAddError('')
    if (product.variants?.length && !selectedVariant) {
      setAddError('Please select all options before adding to cart')
      return
    }
    if (!inStock) return

    setAddingToCart(true)
    try {
      addItem(product, selectedVariant || null, quantity)
      toastSuccess(`${product.name} added to cart`)
      openCart()
    } finally {
      setAddingToCart(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toastSuccess('Link copied to clipboard')
    }
  }

  const crumbs = [
    { label: 'Products', href: '/products' },
    product.categories && { label: product.categories.name, href: `/categories/${product.categories.slug}` },
    { label: product.name },
  ].filter(Boolean)

  return (
    <>
      <SEO
        title={product.meta_title || product.name}
        description={product.meta_description || product.description?.slice(0, 160)}
        image={product.primaryImage}
        product={product}
        breadcrumbs={crumbs}
      />

      <div className="container-base py-6">
        <ProductBreadcrumb crumbs={crumbs} className="mb-6" />

        {/* Main product section */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 mb-16">
          {/* Images */}
          <div className="mb-8 lg:mb-0">
            <ProductImages images={product.images} productName={product.name} />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">
            {/* Brand */}
            {product.brands && (
              <Link to={`/brands/${product.brands.slug}`} className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">
                {product.brands.name}
              </Link>
            )}

            {/* Name */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary leading-tight">
                {product.name}
              </h1>
              {product.sku && (
                <p className="text-xs text-text-muted mt-1">SKU: {product.sku}</p>
              )}
            </div>

            {/* Rating summary */}
            {product.avgRating > 0 && (
              <div className="flex items-center gap-2">
                <RatingStars rating={product.avgRating} size="md" />
                <span className="text-sm text-text-secondary">
                  {product.avgRating} ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-text-primary">
                {formatCurrency(effectivePrice)}
              </span>
              {effectiveCompare && effectiveCompare > effectivePrice && (
                <>
                  <span className="text-lg text-text-muted line-through">
                    {formatCurrency(effectiveCompare)}
                  </span>
                  <Badge variant="danger">
                    -{Math.round(((effectiveCompare - effectivePrice) / effectiveCompare) * 100)}%
                  </Badge>
                </>
              )}
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2">
              <span className={cn('w-2 h-2 rounded-full', inStock ? 'bg-success' : 'bg-danger')} />
              <span className={cn('text-sm font-medium', inStock ? 'text-success' : 'text-danger')}>
                {inStock ? (lowStock ? `Only ${stockQty} left in stock` : 'In Stock') : 'Out of Stock'}
              </span>
            </div>

            {/* Variants */}
            {product.variant_options?.length > 0 && (
              <ProductVariants
                variantOptions={product.variant_options}
                variants={product.variants}
                selectedOptions={selectedOptions}
                onOptionChange={(name, val) => setSelectedOptions(prev => ({ ...prev, [name]: val }))}
              />
            )}

            {/* Add error */}
            {addError && (
              <Alert variant="warning" onDismiss={() => setAddError('')}>{addError}</Alert>
            )}

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-3">
              {/* Qty stepper */}
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-11 flex items-center justify-center text-text-secondary hover:bg-background transition-colors disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-semibold text-text-primary">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  disabled={stockQty !== null && quantity >= stockQty}
                  className="w-10 h-11 flex items-center justify-center text-text-secondary hover:bg-background transition-colors disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to cart */}
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                loading={addingToCart}
                disabled={!inStock}
                leftIcon={ShoppingCart}
              >
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>

              {/* Wishlist */}
              <button
                onClick={() => toggleWishlist(product)}
                className={cn(
                  'w-11 h-11 rounded-xl border flex items-center justify-center transition-all',
                  isWishlisted
                    ? 'border-danger bg-red-50 dark:bg-red-900/20 text-danger'
                    : 'border-border text-text-muted hover:border-danger hover:text-danger'
                )}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={cn('w-5 h-5', isWishlisted && 'fill-current')} />
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="w-11 h-11 rounded-xl border border-border text-text-muted hover:text-primary hover:border-primary/30 flex items-center justify-center transition-all"
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
              {[
                { icon: Truck, label: 'Free shipping', sub: 'Orders over ₦50K' },
                { icon: ShieldCheck, label: 'Secure payment', sub: 'Encrypted checkout' },
                { icon: RefreshCw, label: 'Easy returns', sub: '30-day policy' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-center">
                  <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className="text-xs font-medium text-text-primary">{label}</p>
                  <p className="text-xs text-text-muted">{sub}</p>
                </div>
              ))}
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.tags.map(tag => (
                  <Link
                    key={tag}
                    to={`/products?tag=${tag}`}
                    className="px-2.5 py-1 bg-background border border-border rounded-full text-xs text-text-secondary hover:text-primary hover:border-primary/30 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Accordion sections */}
        <div className="max-w-2xl mb-16">
          <AccordionSection title="Product Description" defaultOpen>
            {product.description
              ? <p>{product.description}</p>
              : <p className="text-text-muted italic">No description available.</p>
            }
          </AccordionSection>
          <AccordionSection title="Shipping & Delivery">
            <ul className="space-y-2">
              <li>Standard delivery: 3–5 business days</li>
              <li>Express delivery: 1–2 business days</li>
              <li>Free shipping on orders above ₦50,000</li>
              <li>All orders are tracked and insured</li>
            </ul>
          </AccordionSection>
          <AccordionSection title="Returns & Exchanges">
            <p>
              We accept returns within 30 days of delivery. Items must be unused,
              in original packaging with all tags attached. Contact our support team
              to initiate a return.
            </p>
          </AccordionSection>
        </div>

        {/* Reviews */}
        <ReviewList productId={product.id} />

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-6">You might also like</h2>
            <ProductGrid products={relatedProducts} loading={false} />
          </section>
        )}
      </div>
    </>
  )
}

export default ProductDetailPage
