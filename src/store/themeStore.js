import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light', // 'light' | 'dark' | 'system'

      setTheme: (theme) => {
        set({ theme })
        get()._applyTheme(theme)
      },

      toggleTheme: () => {
        const current = get().theme
        const next = current === 'light' ? 'dark' : 'light'
        get().setTheme(next)
      },

      _applyTheme: (theme) => {
        const root = document.documentElement
        if (theme === 'dark') {
          root.classList.add('dark')
        } else if (theme === 'light') {
          root.classList.remove('dark')
        } else {
          // system
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          root.classList.toggle('dark', prefersDark)
        }
      },

      initTheme: () => {
        const { theme, _applyTheme } = get()
        _applyTheme(theme)

        if (theme === 'system') {
          const mq = window.matchMedia('(prefers-color-scheme: dark)')
          mq.addEventListener('change', (e) => {
            document.documentElement.classList.toggle('dark', e.matches)
          })
        }
      },
    }),
    {
      name: 'theme-preference',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
)
