import { supabase } from '@/lib/supabase'
import { APP_URL } from '@/utils/constants'

export const authService = {
  /**
   * Register a new user with email + password
   */
  async register({ email, password, full_name }) {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name },
        emailRedirectTo: `${APP_URL}/`,
      },
    })
    if (error) throw error
    return data
  },

  /**
   * Sign in with email + password
   */
  async login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (error) throw error
    return data
  },

  /**
   * Sign in with Google OAuth
   */
  async loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${APP_URL}/`,
      },
    })
    if (error) throw error
    return data
  },

  /**
   * Sign out the current user
   */
  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  /**
   * Send password reset email
   */
  async forgotPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${APP_URL}/reset-password` }
    )
    if (error) throw error
  },

  /**
   * Update password (called from reset-password page with valid session)
   */
  async resetPassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
    return data
  },

  /**
   * Update email address
   */
  async updateEmail(newEmail) {
    const { data, error } = await supabase.auth.updateUser({
      email: newEmail.trim().toLowerCase(),
    })
    if (error) throw error
    return data
  },

  /**
   * Get the current session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },
}

export default authService
