import { useAuthStore } from '@/store/authStore'

/**
 * Convenience hook that exposes auth state and actions.
 * Components should use this rather than reaching into the store directly.
 */
export function useAuth() {
  const {
    user,
    profile,
    session,
    loading,
    initialized,
    setProfile,
    fetchProfile,
    signOut,
    isAdmin,
    isSuperAdmin,
  } = useAuthStore()

  return {
    user,
    profile,
    session,
    loading,
    initialized,
    isAuthenticated: !!user,
    isAdmin: isAdmin(),
    isSuperAdmin: isSuperAdmin(),
    setProfile,
    fetchProfile,
    signOut,
  }
}

export default useAuth
