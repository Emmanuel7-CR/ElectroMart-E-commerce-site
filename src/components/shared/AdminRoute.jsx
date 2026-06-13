import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { PageSpinner } from '@/components/ui/Spinner'

/**
 * Restricts access to admin and super_admin roles.
 * Redirects customers to home, unauthenticated users to login.
 */
export function AdminRoute({ children }) {
  const { user, loading, initialized, isAdmin } = useAuthStore()

  if (!initialized || loading) {
    return <PageSpinner />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute
