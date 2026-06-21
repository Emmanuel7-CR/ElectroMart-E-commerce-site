import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { supabase } from '@/lib/supabase'
import { ToastContainer } from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import Router from '@/app/Router'

export function App() {
  const { initialize, setSession, fetchProfile } = useAuthStore()
  const { initTheme } = useThemeStore()

  useEffect(() => { initTheme() }, [initTheme])

  useEffect(() => {
    initialize()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchProfile(session.user.id)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [initialize, setSession, fetchProfile])

  return (
    <ErrorBoundary>
      <Router />
      <ToastContainer />
    </ErrorBoundary>
  )
}

export default App
