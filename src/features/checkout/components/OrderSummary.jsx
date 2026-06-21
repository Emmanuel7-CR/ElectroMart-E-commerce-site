import { ShoppingBag, Tag, X } from 'lucide-react'
import { useState } from 'react'
import { formatCurrency } from '@/utils/currency'
import { couponService } from '@/services/couponService'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { cn } from '@/utils/helpers'

export function OrderSummary({ items, subtotal, shippingAmount = 0, taxAmount = 0, discountAmount = 0, coupon, onCouponApply }) {
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')

  const total = subtotal + shippingAmount + taxAmount - discountAmount

  const handleApplyCoupon = async () => {
    setCouponError('')
    setCouponLoading(true)
    try {
      const result = await couponService.validate(couponCode, subtotal)
      onCouponApply?.(result)
      setCouponCode('')
    } catch (err) {
      setCouponError(err.message)
    } finally {
      setCouponLoading(false)
    }
  }

  return (
    <div className="card">
      <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
        <ShoppingBag className="w-4 h-4 text-primary" />
        Order Summary
      </h2>

      {/* Items */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {items.map(item => (
          <div key={item.key} className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg bg-background border border-border overflow-hidden shrink-0">
              {item.image_url
                ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">{item.name[0]}</div>
              }
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-2xs font-bold rounded-full flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
              {item.variant_name && <p className="text-xs text-text-muted">{item.variant_name}</p>}
            </div>
            <p className="text-sm font-semibold text-text-primary shrink-0">
              {formatCurrency(item.unit_price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-4 space-y-2.5">
        {/* Coupon field */}
        {!coupon && onCouponApply && (
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Coupon code"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value.toUpperCase())}
              leftIcon={Tag}
              className="flex-1"
              onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleApplyCoupon}
              loading={couponLoading}
              disabled={!couponCode.trim()}
            >
              Apply
            </Button>
          </div>
        )}

        {couponError && (
          <Alert variant="error" className="mb-2" onDismiss={() => setCouponError('')}>
            {couponError}
          </Alert>
        )}

        {/* Applied coupon */}
        {coupon && (
          <div className="flex items-center justify-between text-sm text-success bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2 mb-2">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span className="font-medium">{coupon.coupon.code}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>-{formatCurrency(coupon.discountAmount)}</span>
              {onCouponApply && (
                <button onClick={() => onCouponApply(null)} className="text-text-muted hover:text-danger">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="flex justify-between text-sm text-text-secondary">
          <span>Subtotal</span>
          <span className="font-medium text-text-primary">{formatCurrency(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-success">
            <span>Discount</span>
            <span className="font-medium">-{formatCurrency(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-text-secondary">
          <span>Shipping</span>
          <span className={cn('font-medium', shippingAmount === 0 ? 'text-success' : 'text-text-primary')}>
            {shippingAmount === 0 ? 'Free' : formatCurrency(shippingAmount)}
          </span>
        </div>
        {taxAmount > 0 && (
          <div className="flex justify-between text-sm text-text-secondary">
            <span>Tax</span>
            <span className="font-medium text-text-primary">{formatCurrency(taxAmount)}</span>
          </div>
        )}
        <div className="border-t border-border pt-2.5 flex justify-between font-bold text-text-primary">
          <span>Total</span>
          <span className="text-lg">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary
