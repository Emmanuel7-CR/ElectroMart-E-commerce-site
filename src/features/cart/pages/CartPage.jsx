import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, ArrowLeft, ArrowRight, Minus, Plus, Trash2 } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/utils/currency'

export function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, itemCount } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const count = itemCount()
  const total = subtotal()

  const handleCheckout = () => {
    if (!user) navigate('/login', { state: { from: { pathname: '/checkout' } } })
    else navigate('/checkout')
  }

  return (
    <>
      <SEO title="Cart" noIndex />
      <div className="container-base py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-text-primary">
            Shopping Cart
            {count > 0 && (
              <span className="ml-2 text-base font-normal text-text-muted">
                ({count} {count === 1 ? 'item' : 'items'})
              </span>
            )}
          </h1>
          <Link to="/products" className="text-sm text-primary hover:text-primary-hover flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Continue shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="card max-w-md mx-auto">
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              description="Looks like you haven't added anything yet."
              action={{ label: 'Browse products', onClick: () => navigate('/products') }}
            />
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-6 lg:space-y-0">
            {/* Items */}
            <div className="lg:col-span-2">
              <div className="card divide-y divide-border p-0 overflow-hidden">
                {items.map(item => (
                  <div key={item.key} className="flex gap-4 p-5">
                    {/* Image */}
                    <div className="w-20 h-20 rounded-lg bg-background border border-border overflow-hidden shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-text-muted" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            to={`/products/${item.slug}`}
                            className="font-medium text-text-primary hover:text-primary transition-colors"
                          >
                            {item.name}
                          </Link>
                          {item.variant_name && (
                            <p className="text-sm text-text-muted mt-0.5">{item.variant_name}</p>
                          )}
                          {item.sku && (
                            <p className="text-xs text-text-muted mt-0.5">SKU: {item.sku}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.key)}
                          className="text-text-muted hover:text-danger transition-colors p-1 shrink-0"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Qty */}
                        <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.key, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-text-secondary hover:bg-background transition-colors"
                            aria-label="Decrease"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-text-primary">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            disabled={item.quantity >= item.stock_qty}
                            className="w-8 h-8 flex items-center justify-center text-text-secondary hover:bg-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Increase"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="font-bold text-text-primary">
                          {formatCurrency(item.unit_price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={clearCart}
                className="mt-3 text-sm text-text-muted hover:text-danger transition-colors"
              >
                Clear cart
              </button>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="card sticky top-24">
                <h2 className="text-base font-semibold text-text-primary mb-4">Order Summary</h2>

                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal ({count} items)</span>
                    <span className="font-medium text-text-primary">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Shipping</span>
                    <span className="text-success font-medium">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Tax</span>
                    <span className="font-medium text-text-primary">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-bold text-text-primary text-base">
                    <span>Estimated Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleCheckout}
                  rightIcon={ArrowRight}
                >
                  Proceed to Checkout
                </Button>

                <p className="text-xs text-text-muted text-center mt-3">
                  Secure checkout powered by Paystack
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default CartPage
