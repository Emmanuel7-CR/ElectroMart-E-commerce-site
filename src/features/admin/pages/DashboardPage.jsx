import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Package, Users, TrendingUp, Clock, CheckCircle2, AlertTriangle, ArrowRight, BarChart2 } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { StatsCard } from '../components/StatsCard'
import { RevenueChart } from '../components/RevenueChart'
import { Badge } from '@/components/ui/Badge'
import { adminService } from '@/services/adminService'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/utils/constants'

export function DashboardPage() {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalCustomers: 0, totalProducts: 0 })
  const [chartData, setChartData] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [statusCounts, setStatusCounts] = useState({})
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminService.getDashboardStats(),
      adminService.getRecentOrders(6),
      adminService.getOrderStatusCounts(),
      adminService.getLowStockVariants(),
    ]).then(([s, orders, counts, ls]) => {
      setStats(s)
      setRecentOrders(orders)
      setStatusCounts(counts)
      setLowStock(ls.slice(0, 5))
    }).catch(() => {}).finally(() => setLoading(false))

    adminService.getRevenueChart(30)
      .then(setChartData)
      .catch(() => {})
      .finally(() => setChartLoading(false))
  }, [])

  return (
    <>
      <SEO title="Dashboard — Admin" noIndex />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-0.5">Welcome back. Here's your store at a glance.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard label="Total Revenue" value={loading ? '…' : formatCurrency(stats.totalRevenue)} icon={TrendingUp} color="blue" sub="All time paid orders" />
          <StatsCard label="Total Orders" value={loading ? '…' : stats.totalOrders.toLocaleString()} icon={ShoppingBag} color="green" sub={`${statusCounts.pending || 0} pending`} />
          <StatsCard label="Active Products" value={loading ? '…' : stats.totalProducts.toLocaleString()} icon={Package} color="amber" sub={`${lowStock.length} low stock`} />
          <StatsCard label="Customers" value={loading ? '…' : stats.totalCustomers.toLocaleString()} icon={Users} color="cyan" sub="Registered accounts" />
        </div>

        {/* Revenue Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-text-primary">Revenue — Last 30 days</h2>
              <p className="text-xs text-text-muted mt-0.5">Paid orders only</p>
            </div>
            <Link to="/admin/analytics" className="text-xs text-primary hover:text-primary-hover font-medium flex items-center gap-1">
              Full analytics <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <RevenueChart data={chartData} loading={chartLoading} />
        </div>

        {/* Two column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent orders */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-primary">Recent Orders</h2>
              <Link to="/admin/orders" className="text-xs text-primary hover:text-primary-hover font-medium flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-text-muted py-8 text-center">No orders yet</p>
            ) : (
              <div className="space-y-0 divide-y divide-border">
                {recentOrders.map(order => (
                  <Link key={order.id} to={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between py-3 hover:bg-background -mx-2 px-2 rounded-lg transition-colors group">
                    <div>
                      <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-text-muted">
                        {order.profiles?.full_name || order.profiles?.email || 'Guest'} · {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={ORDER_STATUS_COLORS[order.status] || 'neutral'} dot>
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </Badge>
                      <span className="text-sm font-semibold text-text-primary">{formatCurrency(order.total)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Order status breakdown */}
            <div className="card">
              <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" />
                Order Status
              </h2>
              <div className="space-y-2">
                {[
                  { key: 'pending',    label: 'Pending',    icon: Clock,         color: 'text-warning' },
                  { key: 'processing', label: 'Processing', icon: Package,       color: 'text-primary' },
                  { key: 'shipped',    label: 'Shipped',    icon: ShoppingBag,   color: 'text-accent' },
                  { key: 'delivered',  label: 'Delivered',  icon: CheckCircle2,  color: 'text-success' },
                  { key: 'cancelled',  label: 'Cancelled',  icon: AlertTriangle, color: 'text-danger' },
                ].map(({ key, label, icon: Icon, color }) => (
                  <div key={key} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="text-sm text-text-secondary">{label}</span>
                    </div>
                    <span className="text-sm font-semibold text-text-primary">
                      {statusCounts[key] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Low stock alert */}
            {lowStock.length > 0 && (
              <div className="card border-warning/30 bg-yellow-50/50 dark:bg-yellow-900/10">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-text-primary flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    Low Stock Alert
                  </h2>
                  <Link to="/admin/inventory" className="text-xs text-primary font-medium">View all</Link>
                </div>
                <div className="space-y-2">
                  {lowStock.map(v => (
                    <div key={v.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{v.product_name}</p>
                        <p className="text-xs text-text-muted">{v.variant_name}</p>
                      </div>
                      <span className={`text-sm font-bold ${v.stock_qty === 0 ? 'text-danger' : 'text-warning'}`}>
                        {v.stock_qty} left
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default DashboardPage
