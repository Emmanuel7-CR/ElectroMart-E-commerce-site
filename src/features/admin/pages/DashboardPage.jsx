import {
  ShoppingBag, Package, Users, TrendingUp,
  ArrowUpRight, Clock, CheckCircle2, AlertTriangle
} from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { formatCurrency } from '@/utils/currency'

const stats = [
  { label: 'Total Revenue', value: formatCurrency(0), icon: TrendingUp, change: '+0%', color: 'text-primary bg-blue-50 dark:bg-blue-900/20' },
  { label: 'Total Orders', value: '0', icon: ShoppingBag, change: '+0', color: 'text-success bg-green-50 dark:bg-green-900/20' },
  { label: 'Products', value: '0', icon: Package, change: '0 active', color: 'text-accent bg-cyan-50 dark:bg-cyan-900/20' },
  { label: 'Customers', value: '0', icon: Users, change: '+0 this week', color: 'text-warning bg-yellow-50 dark:bg-yellow-900/20' },
]

export function DashboardPage() {
  return (
    <>
      <SEO title="Dashboard — Admin" noIndex />
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Welcome back. Here's what's happening with your store.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map(stat => (
            <div key={stat.label} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-secondary mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    {stat.change}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Status grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent orders placeholder */}
          <div className="card">
            <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              Recent Orders
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Pending', icon: Clock, color: 'text-warning', count: 0 },
                { label: 'Processing', icon: Package, color: 'text-primary', count: 0 },
                { label: 'Delivered', icon: CheckCircle2, color: 'text-success', count: 0 },
                { label: 'Needs attention', icon: AlertTriangle, color: 'text-danger', count: 0 },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-sm text-text-secondary">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium text-text-primary">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="card">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Add Product', href: '/admin/products/new', icon: Package },
                { label: 'View Orders', href: '/admin/orders', icon: ShoppingBag },
                { label: 'Manage Inventory', href: '/admin/inventory', icon: AlertTriangle },
                { label: 'View Analytics', href: '/admin/analytics', icon: TrendingUp },
              ].map(action => (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors group"
                >
                  <action.icon className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium text-text-secondary group-hover:text-primary transition-colors">
                    {action.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-text-muted text-center pt-4 border-t border-border">
          Full analytics with charts will be available in Phase 6 (Admin Dashboard) and Phase 9 (Analytics).
        </p>
      </div>
    </>
  )
}

export default DashboardPage
