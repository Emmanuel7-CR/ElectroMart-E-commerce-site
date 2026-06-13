import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/helpers'
import Button from './Button'

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full mx-4',
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  hideClose = false,
  className,
}) {
  const overlayRef = useRef(null)
  const contentRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Focus first element on open
  useEffect(() => {
    if (open && contentRef.current) {
      const focusable = contentRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      focusable?.focus()
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-enter"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-secondary/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        ref={contentRef}
        className={cn(
          'relative w-full bg-surface rounded-2xl shadow-modal modal-content-enter',
          'border border-border',
          sizes[size],
          className
        )}
      >
        {(title || !hideClose) && (
          <div className="flex items-start justify-between p-6 pb-0">
            {title && (
              <div>
                <h2 id="modal-title" className="text-lg font-semibold text-text-primary">
                  {title}
                </h2>
                {description && (
                  <p id="modal-description" className="mt-1 text-sm text-text-secondary">
                    {description}
                  </p>
                )}
              </div>
            )}
            {!hideClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close modal"
                className="ml-auto -mr-2 -mt-1 text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default Modal
