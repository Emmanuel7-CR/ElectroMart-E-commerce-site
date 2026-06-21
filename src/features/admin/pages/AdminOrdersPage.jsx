import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, Package, Truck, CheckCircle2, XCircle, RotateCcw } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { AdminModal } from '../components/AdminModal'
import { DataTable } from '../components/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Pagination } from '@/components/ui/Pagination'
import { PageSpinner } from '@/components/ui/Spinner'
import { Alert } from '@/components/ui/Alert'
import { adminService } from '@/services/adminService'
import { formatCurrency } from '@/utils/currency'
import { formatDate, formatDateTime } from '@/utils/date'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/utils/constants'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/utils/helpers'

const STATUS_OPTIONS_ALL = ['all','pending','confirmed','processing','shipped','delivered','cancelled','refunded']
const STATUS_UPDATE_OPTIONS = [
  { value: 'pending',    label: 'Pending' },
  { value: 'confirmed',  label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped',    label: 'Shipped' },
  { value: 'delivered',  label: 'Delivered' },
  { value: 'cancelled',  label: 'Cancelled' },
  { value: 'refunded',   label: 'Refunded' },
]

const STATUS_ICONS = { pending: Package, confirmed: CheckCircle2, processing: Package, shipped: Truck, delivered: CheckCircle2, cancelled: XCircle, refunded: RotateCcw }

/* ── Order Detail View ── */
function OrderDetail({ orderId }) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusValue, setStatusValue] = useState('')
  const [note, setNote] = useState('')
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const { toastSuccess, toastError } = useUIStore()
  const navigate = useNavigate()

  useEffect(() => {
    adminService.getOrder(orderId)
      .then(o => { setOrder(o); setStatusValue(o.status) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [orderId])

  const handleStatusUpdate = async () => {
    if (statusValue === order.status) return
    setUpdating(true)
    try {
      await adminService.updateOrderStatus(order.id, statusValue, note)
      toastSuccess('Order status updated')
      setNote('')
      const updated = await adminService.getOrder(orderId)
      setOrder(updated)
    } catch (err) { toastError(err.message) }
    finally { setUpdating(false) }
  }

  if (loading) return <PageSpinner />
  if (error || !order) return (
    <div className="p-6 text-center">
      <p className="text-danger mb-3">{error || 'Order not found'}</p>
      <Button variant="outline" size="sm" onClick={() => navigate('/admin/orders')}>Back to orders</Button>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin/orders" className="text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-text-primary">{order.order_number}</h1>
          <p className="text-sm text-text-secondary">{formatDateTime(order.created_at)}</p>
        </div>
        <Badge variant={ORDER_STATUS_COLORS[order.status] || 'neutral'} dot>
          {ORDER_STATUS_LABELS[order.status] || order.status}
        </Badge>
        <Badge variant={order.payment_status === 'paid' ? 'success' : 'warning'}>
          {order.payment_status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order items */}
          <div className="card">
            <h2 className="font-semibold text-text-primary mb-4">Items</h2>
            <div className="space-y-3">
              {order.order_items?.map(item => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-12 h-12 rounded-lg bg-background border border-border overflow-hidden shrink-0">
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
                  <p className="font-semibold text-text-primary">{formatCurrency(item.total_price)}</p>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-border space-y-1.5 text-sm">
              <div className="flex justify-between text-text-secondary"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              {order.discount_amount > 0 && <div className="flex justify-between text-success"><span>Discount {order.coupon_code && `(${order.coupon_code})`}</span><span>-{formatCurrency(order.discount_amount)}</span></div>}
              <div className="flex justify-between text-text-secondary"><span>Shipping</span><span>{order.shipping_amount > 0 ? formatCurrency(order.shipping_amount) : 'Free'}</span></div>
              {order.tax_amount > 0 && <div className="flex justify-between text-text-secondary"><span>Tax</span><span>{formatCurrency(order.tax_amount)}</span></div>}
              <div className="flex justify-between font-bold text-text-primary text-base pt-2 border-t border-border"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
            </div>
          </div>

          {/* Status timeline */}
          {order.order_status_history?.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-text-primary mb-4">Order Timeline</h2>
              <div className="space-y-3">
                {[...order.order_status_history].reverse().map((entry, i) => {
                  const Icon = STATUS_ICONS[entry.status] || Package
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                        i === 0 ? 'bg-primary text-white' : 'bg-background border border-border text-text-muted')}>
                        <Icon className="w-3.5 h-3.5" />
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
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Update status */}
          <div className="card">
            <h2 className="font-semibold text-text-primary mb-4">Update Status</h2>
            <div className="space-y-3">
              <Select
                label="New status"
                options={STATUS_UPDATE_OPTIONS}
                value={statusValue}
                onChange={e => setStatusValue(e.target.value)}
              />
              <div>
                <label className="form-label">Note (optional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="e.g. Tracking number: ABC123"
                  className="input-base text-sm"
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={handleStatusUpdate}
                loading={updating}
                disabled={statusValue === order.status}
              >
                Update status
              </Button>
            </div>
          </div>

          {/* Customer */}
          <div className="card">
            <h2 className="font-semibold text-text-primary mb-3">Customer</h2>
            <p className="text-sm font-medium text-text-primary">{order.profiles?.full_name || '—'}</p>
            <p className="text-sm text-text-secondary">{order.profiles?.email}</p>
            {order.profiles?.phone && <p className="text-sm text-text-secondary">{order.profiles.phone}</p>}
            <Link to={`/admin/customers/${order.user_id}`} className="text-xs text-primary hover:underline mt-2 block">
              View customer →
            </Link>
          </div>

          {/* Shipping address */}
          {order.shipping_address && (
            <div className="card">
              <h2 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                Delivery Address
              </h2>
              <div className="text-sm text-text-secondary leading-relaxed">
                <p className="font-medium text-text-primary">{order.shipping_address.full_name}</p>
                <p>{order.shipping_address.address_line1}</p>
                {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                <p>{order.shipping_address.phone}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Orders List View ── */
function OrdersList() {
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const LIMIT = 20

  const load = useCallback(() => {
    setLoading(true)
    adminService.getOrders({ page, limit: LIMIT, status: statusFilter === 'all' ? '' : statusFilter, search })
      .then(r => { setOrders(r.orders); setTotal(r.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, statusFilter, search])

  useEffect(() => { load() }, [load])

  const columns = [
    { key: 'order_number', label: 'Order', sortable: true, render: (v, row) => (
      <div>
        <p className="font-medium text-text-primary">{v}</p>
        <p className="text-xs text-text-muted">{formatDate(row.created_at)}</p>
      </div>
    )},
    { key: 'profiles', label: 'Customer', render: v => (
      <div>
        <p className="text-sm text-text-secondary">{v?.full_name || '—'}</p>
        <p className="text-xs text-text-muted">{v?.email}</p>
      </div>
    )},
    { key: 'status', label: 'Status', render: v => (
      <Badge variant={ORDER_STATUS_COLORS[v] || 'neutral'} dot>{ORDER_STATUS_LABELS[v] || v}</Badge>
    )},
    { key: 'payment_status', label: 'Payment', render: v => (
      <Badge variant={v === 'paid' ? 'success' : v === 'failed' ? 'danger' : 'warning'}>{v}</Badge>
    )},
    { key: 'total', label: 'Total', sortable: true, render: v => (
      <span className="font-semibold text-text-primary">{formatCurrency(v)}</span>
    )},
    { key: 'id', label: '', className: 'w-16', render: v => (
      <Link to={`/admin/orders/${v}`} className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-hover font-medium transition-colors">
        <Eye className="w-3.5 h-3.5" /> View
      </Link>
    )},
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Orders</h1>
          <p className="text-sm text-text-secondary mt-0.5">{total} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 flex-wrap">
          {STATUS_OPTIONS_ALL.map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                statusFilter === s ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary hover:text-text-primary')}>
              {s === 'all' ? 'All' : ORDER_STATUS_LABELS[s] || s}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search order #…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="input-base h-8 text-sm w-40 ml-auto"
        />
      </div>

      <div className="card p-0 overflow-hidden">
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          emptyTitle="No orders found"
          emptyDescription="Orders will appear here once customers start shopping."
        />
      </div>

      {Math.ceil(total / LIMIT) > 1 && (
        <div className="flex justify-center">
          <Pagination currentPage={page} totalPages={Math.ceil(total / LIMIT)} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}

/* ── Page entry point — routes to list or detail ── */
export function AdminOrdersPage() {
  const { id } = useParams()
  return (
    <>
      <SEO title={id ? 'Order Detail — Admin' : 'Orders — Admin'} noIndex />
      {id ? <OrderDetail orderId={id} /> : <OrdersList />}
    </>
  )
}

export default AdminOrdersPage
