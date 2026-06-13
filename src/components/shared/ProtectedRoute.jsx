import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { PageSpinner } from '@/components/ui/Spinner'

/**
 * Redirects unauthenticated users to /login.
 * Preserves the attempted URL so we can redirect back after login.
 */
export function ProtectedRoute({ children }) {
  const { user, loading, initialized } = useAuthStore()
  const location = useLocation()

  if (!initialized || loading) {
    return <PageSpinner />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
