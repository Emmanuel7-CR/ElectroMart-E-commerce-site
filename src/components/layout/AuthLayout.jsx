import { Outlet, Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { APP_NAME } from '@/utils/constants'
import { useThemeStore } from '@/store/themeStore'
import { Sun, Moon } from 'lucide-react'

export function AuthLayout() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
        <Link to="/" className="flex items-center gap-2 font-bold text-text-primary hover:text-primary transition-colors">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          {APP_NAME}
        </Link>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-border transition-colors"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

      {/* Footer note */}
      <div className="text-center py-4 text-xs text-text-muted border-t border-border">
        © {new Date().getFullYear()} {APP_NAME} · 
        <Link to="/privacy" className="hover:text-text-secondary ml-1">Privacy</Link> ·
        <Link to="/terms" className="hover:text-text-secondary ml-1">Terms</Link>
      </div>
    </div>
  )
}

export default AuthLayout
