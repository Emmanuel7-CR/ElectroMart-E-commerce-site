import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, Package, Truck, ArrowRight, ShoppingBag } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { PageSpinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { orderService } from '@/services/orderService'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'

export function OrderConfirmationPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService.getOrder(id)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageSpinner />

  if (!order) return (
    <div className="container-base py-16 text-center">
      <p className="text-text-secondary mb-4">Order not found.</p>
      <Link to="/orders"><Button variant="primary">View all orders</Button></Link>
    </div>
  )

  return (
    <>
      <SEO title={`Order ${order.order_number} confirmed`} noIndex />
      <div className="container-base py-12 max-w-2xl">
        <div className="text-center mb-10 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Order Confirmed!</h1>
          <p className="text-text-secondary">
            Thank you for your order. We'll send you an email confirmation shortly.
          </p>
        </div>

        {/* Order details card */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            <div>
              <p className="text-xs text-text-muted mb-0.5">Order number</p>
              <p className="font-bold text-text-primary">{order.order_number}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted mb-0.5">Order date</p>
              <p className="text-sm font-medium text-text-primary">{formatDate(order.created_at)}</p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3 mb-4">
            {order.order_items?.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-background border border-border overflow-hidden shrink-0">
                  {item.image_url
                    ? <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-text-muted" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{item.product_name}</p>
                  {item.variant_name && <p className="text-xs text-text-muted">{item.variant_name}</p>}
                  <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-text-primary">{formatCurrency(item.total_price)}</p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <span className="font-semibold text-text-primary">Total paid</span>
            <span className="text-lg font-bold text-text-primary">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Delivery info */}
        {order.shipping_address && (
          <div className="card mb-6">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              Delivery details
            </h3>
            <p className="text-sm text-text-secondary">
              {order.shipping_address.full_name}<br />
              {order.shipping_address.address_line1}
              {order.shipping_address.address_line2 ? `, ${order.shipping_address.address_line2}` : ''}<br />
              {order.shipping_address.city}, {order.shipping_address.state}<br />
              {order.shipping_address.phone}
            </p>
            <p className="text-xs text-text-muted mt-2">Estimated delivery: 3–5 business days</p>
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to={`/orders/${order.id}`} className="flex-1">
            <Button variant="primary" size="lg" className="w-full" rightIcon={ArrowRight}>
              Track order
            </Button>
          </Link>
          <Link to="/products" className="flex-1">
            <Button variant="outline" size="lg" className="w-full" leftIcon={ShoppingBag}>
              Continue shopping
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}

export default OrderConfirmationPage
