import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/utils/helpers'
import { useUIStore } from '@/store/uiStore'

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const styles = {
  success: 'bg-surface border-success/30 text-success',
  error: 'bg-surface border-danger/30 text-danger',
  warning: 'bg-surface border-warning/30 text-warning',
  info: 'bg-surface border-primary/30 text-primary',
}

function Toast({ id, message, type }) {
  const dismiss = useUIStore(s => s.dismissToast)
  const Icon = icons[type] || Info

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 w-full max-w-sm px-4 py-3.5',
        'rounded-xl border shadow-dropdown toast-enter',
        styles[type]
      )}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
      <p className="text-sm font-medium text-text-primary flex-1">{message}</p>
      <button
        onClick={() => dismiss(id)}
        className="shrink-0 text-text-muted hover:text-text-primary transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useUIStore(s => s.toasts)

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <Toast {...t} />
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
