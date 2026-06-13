import { create } from 'zustand'

let toastId = 0

export const useUIStore = create((set, get) => ({
  // Toasts
  toasts: [],

  toast: (message, type = 'info', duration = 4000) => {
    const id = ++toastId
    set(s => ({
      toasts: [...s.toasts, { id, message, type, duration }],
    }))
    setTimeout(() => get().dismissToast(id), duration)
    return id
  },

  toastSuccess: (message, duration) => get().toast(message, 'success', duration),
  toastError: (message, duration) => get().toast(message, 'error', duration),
  toastWarning: (message, duration) => get().toast(message, 'warning', duration),

  dismissToast: (id) => {
    set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
  },

  // Search modal
  searchOpen: false,
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),

  // Mobile nav
  mobileNavOpen: false,
  openMobileNav: () => set({ mobileNavOpen: true }),
  closeMobileNav: () => set({ mobileNavOpen: false }),

  // Generic confirmation modal
  confirmModal: null,
  openConfirm: (config) => set({ confirmModal: config }),
  closeConfirm: () => set({ confirmModal: null }),
}))
