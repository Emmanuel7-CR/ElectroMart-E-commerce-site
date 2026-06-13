import { useState } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingBag, Package, Tag, Award, Users,
  BarChart2, Ticket, Star, TrendingUp, LogOut, ChevronLeft,
  Menu, Bell, Sun, Moon, ExternalLink
} from 'lucide-react'
import { cn } from '@/utils/helpers'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { APP_NAME } from '@/utils/constants'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: Tag },
  { label: 'Brands', href: '/admin/brands', icon: Award },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Inventory', href: '/admin/inventory', icon: BarChart2 },
  { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
]

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { profile, signOut } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const NavItem = ({ item }) => (
    <NavLink
      to={item.href}
      end={item.exact}
      className={({ isActive }) => cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-primary text-white shadow-sm'
          : 'text-slate-400 hover:bg-white/10 hover:text-white'
      )}
      onClick={() => setMobileOpen(false)}
    >
      <item.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  )

  const Sidebar = ({ mobile = false }) => (
    <div className={cn(
      'flex flex-col h-full bg-secondary',
      !mobile && (collapsed ? 'w-16' : 'w-60'),
    )}>
      {/* Header */}
      <div className={cn(
        'flex items-center border-b border-white/10 shrink-0',
        collapsed ? 'h-16 justify-center px-0' : 'h-16 px-4 gap-3'
      )}>
        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <ShoppingBag className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-white text-sm truncate">{APP_NAME}</span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5" aria-label="Admin navigation">
        {navItems.map(item => (
          <NavItem key={item.href} item={item} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 p-2 space-y-0.5 shrink-0">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          {!collapsed && 'View Store'}
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className={cn(
        'hidden lg:flex flex-col shrink-0 transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}>
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-secondary/60 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-60 z-50 lg:hidden animate-slide-in-right">
            <Sidebar mobile />
          </div>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.innerWidth >= 1024 ? setCollapsed(c => !c) : setMobileOpen(true)}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-border transition-colors"
              aria-label="Toggle sidebar"
            >
              {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <h1 className="text-sm font-semibold text-text-primary hidden sm:block">Admin Panel</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-border transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-border transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">
                  {profile?.full_name?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
              <span className="text-sm font-medium text-text-primary hidden sm:block">
                {profile?.full_name || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main id="admin-main" className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
