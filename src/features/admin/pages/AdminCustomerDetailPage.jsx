import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, MapPin, ShoppingBag, UserCheck, UserX } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { PageSpinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { adminService } from '@/services/adminService'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/utils/constants'
import { useUIStore } from '@/store/uiStore'

export function AdminCustomerDetailPage() {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toastSuccess, toastError } = useUIStore()

  useEffect(() => {
    adminService.getCustomer(id)
      .then(setCustomer)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const toggleStatus = async () => {
    try {
      await adminService.updateCustomerStatus(id, !customer.is_active)
      toastSuccess(`Customer ${customer.is_active ? 'deactivated' : 'activated'}`)
      setCustomer(c => ({ ...c, is_active: !c.is_active }))
    } catch (err) {
      toastError(err.message)
    }
  }

  if (loading) return <PageSpinner />
  if (error || !customer) return (
    <div className="text-center py-16">
      <p className="text-danger mb-3">{error || 'Customer not found'}</p>
      <Link to="/admin/customers"><Button variant="outline" size="sm">Back to customers</Button></Link>
    </div>
  )

  const totalSpend = (customer.orders || [])
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + Number(o.total), 0)

  return (
    <>
      <SEO title={`${customer.full_name || customer.email} — Admin`} noIndex />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/admin/customers" className="text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-text-primary">{customer.full_name || '—'}</h1>
            <p className="text-sm text-text-secondary">{customer.email}</p>
          </div>
          <Badge variant={customer.is_active ? 'success' : 'danger'} dot>
            {customer.is_active ? 'Active' : 'Inactive'}
          </Badge>
          <Button
            variant={customer.is_active ? 'outline' : 'primary'}
            size="sm"
            leftIcon={customer.is_active ? UserX : UserCheck}
            onClick={toggleStatus}
          >
            {customer.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left col */}
          <div className="space-y-5">
            {/* Contact info */}
            <div className="card">
              <h2 className="font-semibold text-text-primary mb-4">Contact</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Mail className="w-4 h-4 shrink-0 text-text-muted" />
                  {customer.email}
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Phone className="w-4 h-4 shrink-0 text-text-muted" />
                    {customer.phone}
                  </div>
                )}
                <div className="pt-2 border-t border-border space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Role</span>
                    <Badge variant="neutral">{customer.role}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Member since</span>
                    <span className="text-text-primary">{formatDate(customer.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Total orders</span>
                    <span className="font-semibold text-text-primary">{customer.orders?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Total spend</span>
                    <span className="font-semibold text-text-primary">{formatCurrency(totalSpend)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Addresses */}
            {customer.addresses?.length > 0 && (
              <div className="card">
                <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Addresses ({customer.addresses.length})
                </h2>
                <div className="space-y-3">
                  {customer.addresses.map(addr => (
                    <div key={addr.id} className="text-sm text-text-secondary border-b border-border pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-medium text-text-primary">{addr.full_name}</span>
                        {addr.is_default && <Badge variant="info" className="text-2xs">Default</Badge>}
                      </div>
                      <p>{addr.address_line1}, {addr.city}, {addr.state}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right col - Orders */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary" />
                Order History ({customer.orders?.length || 0})
              </h2>
              {!customer.orders?.length ? (
                <p className="text-sm text-text-muted text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-0 divide-y divide-border">
                  {customer.orders.map(order => (
                    <Link
                      key={order.id}
                      to={`/admin/orders/${order.id}`}
                      className="flex items-center justify-between py-3 hover:bg-background -mx-2 px-2 rounded-lg transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                          {order.order_number}
                        </p>
                        <p className="text-xs text-text-muted">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={ORDER_STATUS_COLORS[order.status] || 'neutral'} dot>
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </Badge>
                        <span className="text-sm font-semibold text-text-primary">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminCustomerDetailPage
