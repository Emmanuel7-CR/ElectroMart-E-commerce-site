import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  ShoppingBag, Heart, Search, Sun, Moon, Menu, X, User, LogOut,
  Package, Settings, ChevronDown
} from 'lucide-react'
import { cn } from '@/utils/helpers'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useThemeStore } from '@/store/themeStore'
import { useUIStore } from '@/store/uiStore'
import { NAV_LINKS, APP_NAME } from '@/utils/constants'
import Button from '@/components/ui/Button'

function CartButton() {
  const itemCount = useCartStore(s => s.itemCount())
  const openCart = useCartStore(s => s.openCart)

  return (
    <button
      onClick={openCart}
      className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-border transition-colors"
      aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
    >
      <ShoppingBag className="w-5 h-5" />
      {itemCount > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-2xs font-bold rounded-full flex items-center justify-center leading-none"
          aria-hidden="true"
        >
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </button>
  )
}

function WishlistButton() {
  const count = useWishlistStore(s => s.count())
  return (
    <Link
      to="/wishlist"
      className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-border transition-colors"
      aria-label={`Wishlist${count > 0 ? `, ${count} items` : ''}`}
    >
      <Heart className="w-5 h-5" />
      {count > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger text-white text-2xs font-bold rounded-full flex items-center justify-center leading-none"
          aria-hidden="true"
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}

function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-border transition-colors"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark'
        ? <Sun className="w-5 h-5" />
        : <Moon className="w-5 h-5" />
      }
    </button>
  )
}

function UserMenu({ user, profile, onSignOut }) {
  const [open, setOpen] = useState(false)
  const isAdmin = useAuthStore(s => s.isAdmin())

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-border transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-semibold text-primary">
            {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>
        <ChevronDown className={cn('w-3 h-3 text-text-muted transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-full mt-1.5 w-52 bg-surface rounded-xl border border-border shadow-dropdown z-20 py-1 dropdown-enter">
            <div className="px-3 py-2.5 border-b border-border">
              <p className="text-sm font-medium text-text-primary truncate">
                {profile?.full_name || 'Account'}
              </p>
              <p className="text-xs text-text-muted truncate">{user?.email}</p>
            </div>

            <div className="py-1">
              <Link
                to="/orders"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:bg-background hover:text-text-primary transition-colors"
              >
                <Package className="w-4 h-4" />
                My Orders
              </Link>
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:bg-background hover:text-text-primary transition-colors"
              >
                <Settings className="w-4 h-4" />
                Account Settings
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-primary hover:bg-primary/5 transition-colors font-medium"
                >
                  <User className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
            </div>

            <div className="border-t border-border py-1">
              <button
                onClick={() => { onSignOut(); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function Header() {
  const { user, profile, signOut } = useAuthStore()
  const { openSearch } = useUIStore()
  const { openMobileNav, mobileNavOpen, closeMobileNav } = useUIStore()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Global Cmd/Ctrl+K shortcut opens search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openSearch()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [openSearch])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full bg-surface/95 backdrop-blur-sm border-b transition-all duration-200',
        scrolled ? 'border-border shadow-sm' : 'border-transparent'
      )}
    >
      <div className="container-base">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-lg text-text-primary hover:text-primary transition-colors shrink-0"
          >
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="hidden sm:block">{APP_NAME}</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) => cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'text-primary bg-primary/8'
                    : 'text-text-secondary hover:text-text-primary hover:bg-border'
                )}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={openSearch}
              className="hidden sm:flex items-center gap-2 pl-3 pr-2.5 h-9 rounded-lg border border-border text-text-muted hover:text-text-primary hover:border-primary/40 transition-colors text-xs"
              aria-label="Search (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:block">Search</span>
              <kbd className="hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-background border border-border text-2xs font-mono">⌘K</kbd>
            </button>
            <button
              onClick={openSearch}
              className="sm:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-border transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <ThemeToggle />

            <div className="hidden sm:flex items-center gap-1">
              <WishlistButton />
              <CartButton />
            </div>

            {user ? (
              <UserMenu user={user} profile={profile} onSignOut={handleSignOut} />
            ) : (
              <div className="hidden sm:flex items-center gap-2 ml-1">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Sign in
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                  Sign up
                </Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => mobileNavOpen ? closeMobileNav() : openMobileNav()}
              className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-border transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileNavOpen && (
        <>
          <div
            className="fixed inset-0 bg-secondary/40 z-30 md:hidden"
            onClick={closeMobileNav}
            aria-hidden="true"
          />
          <div className="fixed top-16 left-0 right-0 bg-surface border-b border-border z-30 md:hidden animate-slide-down">
            <nav className="container-base py-4 space-y-1" aria-label="Mobile navigation">
              {NAV_LINKS.map(link => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  onClick={closeMobileNav}
                  className={({ isActive }) => cn(
                    'block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-primary bg-primary/8'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background'
                  )}
                >
                  {link.label}
                </NavLink>
              ))}

              <div className="divider" />

              <div className="flex items-center gap-2 px-1">
                <Link to="/wishlist" onClick={closeMobileNav} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full" leftIcon={Heart}>
                    Wishlist
                  </Button>
                </Link>
                <button
                  onClick={() => { useCartStore.getState().openCart(); closeMobileNav() }}
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full" leftIcon={ShoppingBag}>
                    Cart ({useCartStore.getState().itemCount()})
                  </Button>
                </button>
              </div>

              {!user && (
                <div className="flex gap-2 px-1 pt-1">
                  <Link to="/login" onClick={closeMobileNav} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Sign in</Button>
                  </Link>
                  <Link to="/register" onClick={closeMobileNav} className="flex-1">
                    <Button variant="primary" size="sm" className="w-full">Sign up</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  )
}

export default Header
