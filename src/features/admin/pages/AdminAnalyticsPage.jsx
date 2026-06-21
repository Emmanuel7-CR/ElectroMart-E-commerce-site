import { useState, useEffect } from 'react'
import { TrendingUp, ShoppingBag, Users, Package } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { SEO } from '@/components/shared/SEO'
import { StatsCard } from '../components/StatsCard'
import { RevenueChart } from '../components/RevenueChart'
import { adminService } from '@/services/adminService'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { cn } from '@/utils/helpers'

const PERIOD_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
]

const STATUS_COLORS_MAP = {
  pending: '#F59E0B', confirmed: '#3B82F6', processing: '#06B6D4',
  shipped: '#8B5CF6', delivered: '#22C55E', cancelled: '#EF4444', refunded: '#94A3B8',
}

export function AdminAnalyticsPage() {
  const [period, setPeriod] = useState(30)
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState([])
  const [statusCounts, setStatusCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminService.getDashboardStats(),
      adminService.getOrderStatusCounts(),
    ]).then(([s, counts]) => { setStats(s); setStatusCounts(counts) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setChartLoading(true)
    adminService.getRevenueChart(period)
      .then(setChartData)
      .catch(() => {})
      .finally(() => setChartLoading(false))
  }, [period])

  const pieData = Object.entries(statusCounts)
    .filter(([, v]) => v > 0)
    .map(([status, count]) => ({ name: status, value: count }))

  return (
    <>
      <SEO title="Analytics — Admin" noIndex />
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Analytics</h1>
          <p className="text-sm text-text-secondary mt-0.5">Store performance overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard label="Total Revenue" value={loading ? '…' : formatCurrency(stats?.totalRevenue || 0)} icon={TrendingUp} color="blue" />
          <StatsCard label="Total Orders" value={loading ? '…' : (stats?.totalOrders || 0).toLocaleString()} icon={ShoppingBag} color="green" />
          <StatsCard label="Customers" value={loading ? '…' : (stats?.totalCustomers || 0).toLocaleString()} icon={Users} color="cyan" />
          <StatsCard label="Products" value={loading ? '…' : (stats?.totalProducts || 0).toLocaleString()} icon={Package} color="amber" />
        </div>

        {/* Revenue chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-text-primary">Revenue Over Time</h2>
            <div className="flex gap-1">
              {PERIOD_OPTIONS.map(o => (
                <button key={o.value} onClick={() => setPeriod(o.value)}
                  className={cn('px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                    period === o.value ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary hover:bg-border')}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <RevenueChart data={chartData} loading={chartLoading} />
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order status pie */}
          <div className="card">
            <h2 className="font-semibold text-text-primary mb-5">Orders by Status</h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS_MAP[entry.name] || '#94A3B8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [v, 'Orders']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-text-muted">No order data yet</div>
            )}
          </div>

          {/* Daily orders bar chart */}
          <div className="card">
            <h2 className="font-semibold text-text-primary mb-5">Daily Revenue (₦)</h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData.slice(-14)} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={d => formatDate(d, 'MMM d')} tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tickFormatter={v => `₦${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} width={48} />
                  <Tooltip formatter={v => [formatCurrency(v), 'Revenue']} labelFormatter={d => formatDate(d, 'MMM d, yyyy')} contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)' }} />
                  <Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-text-muted">No revenue data yet</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminAnalyticsPage
