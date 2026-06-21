import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/helpers'

export function AdminModal({ open, onClose, title, description, children, size = 'md' }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  useEffect(() => {
    if (open) setTimeout(() => ref.current?.focus(), 50)
  }, [open])

  if (!open) return null

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
      <div className="absolute inset-0 bg-secondary/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref} tabIndex={-1}
        className={cn('relative w-full bg-surface rounded-2xl shadow-modal border border-border animate-slide-up focus:outline-none', sizes[size])}
      >
        <div className="flex items-start justify-between px-6 pt-5 pb-0">
          <div>
            <h2 id="admin-modal-title" className="text-base font-semibold text-text-primary">{title}</h2>
            {description && <p className="text-sm text-text-secondary mt-0.5">{description}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-muted hover:bg-border hover:text-text-primary transition-colors ml-4 -mt-1 -mr-1" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export default AdminModal
