import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { supabase } from '@/lib/supabase'
import { ToastContainer } from '@/components/ui/Toast'
import { CartDrawer } from '@/features/cart/components/CartDrawer'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import Router from '@/app/Router'

export function App() {
  const { initialize, setSession, fetchProfile } = useAuthStore()
  const { initTheme } = useThemeStore()

  // Initialize theme on mount
  useEffect(() => {
    initTheme()
  }, [initTheme])

  // Initialize auth on mount
  useEffect(() => {
    initialize()

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)

        if (event === 'SIGNED_IN' && session?.user) {
          await fetchProfile(session.user.id)
        }
        if (event === 'SIGNED_OUT') {
          // Stores clear themselves via signOut action
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [initialize, setSession, fetchProfile])

  return (
    <ErrorBoundary>
      <Router />
      {/* Global UI overlays */}
      <CartDrawer />
      <ToastContainer />
    </ErrorBoundary>
  )
}

export default App
