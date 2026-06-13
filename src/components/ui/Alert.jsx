import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/utils/helpers'

const variants = {
  success: {
    container: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    icon: 'text-success',
    title: 'text-green-800 dark:text-green-300',
    body: 'text-green-700 dark:text-green-400',
    Icon: CheckCircle2,
  },
  error: {
    container: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    icon: 'text-danger',
    title: 'text-red-800 dark:text-red-300',
    body: 'text-red-700 dark:text-red-400',
    Icon: XCircle,
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    icon: 'text-warning',
    title: 'text-yellow-800 dark:text-yellow-300',
    body: 'text-yellow-700 dark:text-yellow-400',
    Icon: AlertTriangle,
  },
  info: {
    container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    icon: 'text-primary',
    title: 'text-blue-800 dark:text-blue-300',
    body: 'text-blue-700 dark:text-blue-400',
    Icon: Info,
  },
}

export function Alert({ variant = 'info', title, children, onDismiss, className }) {
  const v = variants[variant]
  const { Icon } = v

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 p-4 rounded-xl border text-sm',
        v.container,
        className
      )}
    >
      <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', v.icon)} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title && <p className={cn('font-semibold mb-0.5', v.title)}>{title}</p>}
        {children && <div className={v.body}>{children}</div>}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={cn('shrink-0 hover:opacity-70 transition-opacity', v.icon)}
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

export default Alert
