import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,
  initialized: false,

  setSession: (session) => {
    set({ session, user: session?.user ?? null })
  },

  setProfile: (profile) => set({ profile }),

  setLoading: (loading) => set({ loading }),

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({ session, user: session?.user ?? null })

      if (session?.user) {
        await get().fetchProfile(session.user.id)
      }
    } catch (err) {
      console.error('Auth init error:', err)
    } finally {
      set({ loading: false, initialized: true })
    }
  },

  fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      set({ profile: data })
      return data
    } catch (err) {
      console.error('Profile fetch error:', err)
      return null
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, session: null })
  },

  isAdmin: () => {
    const { profile } = get()
    return profile?.role === 'admin' || profile?.role === 'super_admin'
  },

  isSuperAdmin: () => {
    const { profile } = get()
    return profile?.role === 'super_admin'
  },
}))
