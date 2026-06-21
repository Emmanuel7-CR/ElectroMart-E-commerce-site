import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowRight, Package } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Pagination } from '@/components/ui/Pagination'
import { orderService } from '@/services/orderService'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/utils/constants'

export function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const LIMIT = 10
  const totalPages = Math.ceil(total / LIMIT)

  useEffect(() => {
    setLoading(true)
    orderService.getUserOrders({ page, limit: LIMIT })
      .then(res => { setOrders(res.orders); setTotal(res.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  return (
    <>
      <SEO title="My Orders" noIndex />
      <div className="container-base py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">My Orders</h1>
          {!loading && total > 0 && (
            <p className="text-text-secondary mt-1 text-sm">{total} order{total !== 1 ? 's' : ''} placed</p>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={ShoppingBag}
              title="No orders yet"
              description="When you place your first order, it will appear here."
              action={{ label: 'Start shopping', onClick: () => window.location.href = '/products' }}
            />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map(order => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="block card hover:shadow-card-hover transition-shadow duration-200 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-text-primary">{order.order_number}</span>
                        <Badge variant={ORDER_STATUS_COLORS[order.status] || 'neutral'} dot>
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </Badge>
                        {order.payment_status === 'unpaid' && (
                          <Badge variant="warning">Payment pending</Badge>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary">{formatDate(order.created_at)}</p>
                      <div className="flex items-center gap-2 mt-3">
                        {order.order_items?.slice(0, 3).map(item => (
                          <div key={item.id} className="w-10 h-10 rounded-lg bg-background border border-border overflow-hidden shrink-0">
                            {item.image_url
                              ? <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-text-muted" /></div>
                            }
                          </div>
                        ))}
                        {(order.order_items?.length || 0) > 3 && (
                          <span className="text-xs text-text-muted">+{order.order_items.length - 3} more</span>
                        )}
                        <span className="text-xs text-text-muted ml-1">
                          {order.order_items?.length || 0} {order.order_items?.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-text-primary">{formatCurrency(order.total)}</p>
                      <div className="flex items-center gap-1 mt-1 text-text-muted group-hover:text-primary transition-colors justify-end">
                        <span className="text-xs font-medium">View details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default OrdersPage
