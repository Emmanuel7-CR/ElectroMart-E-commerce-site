import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/utils/currency'
import { cn } from '@/utils/helpers'
import Button from '@/components/ui/Button'

function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCartStore()

  return (
    <div className="flex gap-3 py-4 border-b border-border last:border-0">
      {/* Image */}
      <div className="w-16 h-16 rounded-lg bg-background border border-border overflow-hidden shrink-0">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-text-muted" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
        {item.variant_name && (
          <p className="text-xs text-text-muted mt-0.5">{item.variant_name}</p>
        )}
        <p className="text-sm font-bold text-primary mt-1">
          {formatCurrency(item.unit_price * item.quantity)}
        </p>

        {/* Qty controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateQuantity(item.key, item.quantity - 1)}
            className="w-6 h-6 rounded-md border border-border flex items-center justify-center text-text-secondary hover:bg-background hover:text-text-primary transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-sm font-medium text-text-primary w-6 text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.key, item.quantity + 1)}
            disabled={item.quantity >= item.stock_qty}
            className="w-6 h-6 rounded-md border border-border flex items-center justify-center text-text-secondary hover:bg-background hover:text-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Increase quantity"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            onClick={() => removeItem(item.key)}
            className="ml-auto text-text-muted hover:text-danger transition-colors p-1"
            aria-label={`Remove ${item.name} from cart`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function CartDrawer() {
  const { isOpen, closeCart, items, clearCart, subtotal, itemCount } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const drawerRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') closeCart() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, closeCart])

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Focus trap
  useEffect(() => {
    if (isOpen) drawerRef.current?.focus()
  }, [isOpen])

  const handleCheckout = () => {
    closeCart()
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } })
    } else {
      navigate('/checkout')
    }
  }

  const count = itemCount()
  const total = subtotal()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Shopping cart">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-secondary/50 backdrop-blur-sm animate-fade-in"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        className="relative w-full max-w-sm bg-surface h-full flex flex-col shadow-modal animate-slide-in-right focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-text-primary">
              Cart
              {count > 0 && (
                <span className="ml-1.5 text-sm font-normal text-text-muted">
                  ({count} {count === 1 ? 'item' : 'items'})
                </span>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-text-muted hover:text-danger transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={closeCart}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-border transition-colors"
              aria-label="Close cart"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-background flex items-center justify-center mb-4 border border-border">
                <ShoppingBag className="w-7 h-7 text-text-muted" />
              </div>
              <p className="font-medium text-text-primary mb-1">Your cart is empty</p>
              <p className="text-sm text-text-secondary mb-6">Add some products to get started</p>
              <Button variant="primary" size="sm" onClick={closeCart}>
                Continue shopping
              </Button>
            </div>
          ) : (
            <div>
              {items.map(item => (
                <CartItem key={item.key} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-border bg-background shrink-0 space-y-3">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Subtotal</span>
              <span className="font-bold text-text-primary">{formatCurrency(total)}</span>
            </div>
            <p className="text-xs text-text-muted">
              Shipping and taxes calculated at checkout
            </p>

            {/* Actions */}
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleCheckout}
              rightIcon={ArrowRight}
            >
              Checkout
            </Button>
            <Link to="/cart" onClick={closeCart}>
              <Button variant="outline" size="md" className="w-full">
                View full cart
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartDrawer
