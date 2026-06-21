import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, XCircle, RotateCcw } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { PageSpinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { orderService } from '@/services/orderService'
import { formatCurrency } from '@/utils/currency'
import { formatDateTime } from '@/utils/date'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/utils/constants'
import { cn } from '@/utils/helpers'

const STATUS_ICONS = {
  pending: Clock, confirmed: CheckCircle2, processing: Package,
  shipped: Truck, delivered: CheckCircle2, cancelled: XCircle, refunded: RotateCcw,
}

export function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    orderService.getOrder(id)
      .then(setOrder)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageSpinner />
  if (error || !order) return (
    <div className="container-base py-16 text-center">
      <p className="text-danger mb-4">{error || 'Order not found'}</p>
      <Link to="/orders"><Button variant="outline">Back to orders</Button></Link>
    </div>
  )

  const StatusIcon = STATUS_ICONS[order.status] || Clock

  return (
    <>
      <SEO title={`Order ${order.order_number}`} noIndex />
      <div className="container-base py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/orders" className="text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text-primary">{order.order_number}</h1>
            <p className="text-sm text-text-secondary">Placed {formatDateTime(order.created_at)}</p>
          </div>
          <Badge variant={ORDER_STATUS_COLORS[order.status] || 'neutral'} dot className="ml-auto">
            {ORDER_STATUS_LABELS[order.status] || order.status}
          </Badge>
        </div>

        {/* Status timeline */}
        {order.order_status_history?.length > 0 && (
          <div className="card mb-6">
            <h2 className="font-semibold text-text-primary mb-4">Order Timeline</h2>
            <div className="space-y-4">
              {[...order.order_status_history].reverse().map((entry, i) => {
                const Icon = STATUS_ICONS[entry.status] || Clock
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                      i === 0 ? 'bg-primary text-white' : 'bg-background border border-border text-text-muted'
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={cn('text-sm font-medium', i === 0 ? 'text-primary' : 'text-text-secondary')}>
                        {ORDER_STATUS_LABELS[entry.status] || entry.status}
                      </p>
                      {entry.note && <p className="text-xs text-text-muted">{entry.note}</p>}
                      <p className="text-xs text-text-muted">{formatDateTime(entry.created_at)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="card mb-6">
          <h2 className="font-semibold text-text-primary mb-4">Items ordered</h2>
          <div className="space-y-3">
            {order.order_items?.map(item => (
              <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div className="w-14 h-14 rounded-lg bg-background border border-border overflow-hidden shrink-0">
                  {item.image_url
                    ? <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-text-muted" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">{item.product_name}</p>
                  {item.variant_name && <p className="text-xs text-text-muted">{item.variant_name}</p>}
                  {item.sku && <p className="text-xs text-text-muted">SKU: {item.sku}</p>}
                  <p className="text-xs text-text-muted">Qty: {item.quantity} × {formatCurrency(item.unit_price)}</p>
                </div>
                <p className="font-semibold text-text-primary shrink-0">{formatCurrency(item.total_price)}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount</span><span>-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-text-secondary">
              <span>Shipping</span>
              <span>{order.shipping_amount > 0 ? formatCurrency(order.shipping_amount) : 'Free'}</span>
            </div>
            <div className="flex justify-between font-bold text-text-primary text-base pt-1 border-t border-border">
              <span>Total</span><span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        {order.shipping_address && (
          <div className="card mb-6">
            <h2 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              Delivery address
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              {order.shipping_address.full_name}<br />
              {order.shipping_address.address_line1}
              {order.shipping_address.address_line2 ? `, ${order.shipping_address.address_line2}` : ''}<br />
              {order.shipping_address.city}, {order.shipping_address.state}<br />
              {order.shipping_address.phone}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link to="/orders">
            <Button variant="outline" leftIcon={ArrowLeft}>All orders</Button>
          </Link>
          {['delivered'].includes(order.status) && (
            <Link to="/products">
              <Button variant="primary">Buy again</Button>
            </Link>
          )}
        </div>
      </div>
    </>
  )
}

export default OrderDetailPage
