import { cn } from '@/utils/helpers'

const variants = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  neutral: 'badge-neutral',
}

export function Badge({ children, variant = 'neutral', className, dot = false }) {
  return (
    <span className={cn(variants[variant], className)}>
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full', {
            'bg-success': variant === 'success',
            'bg-warning': variant === 'warning',
            'bg-danger': variant === 'danger',
            'bg-primary': variant === 'info',
            'bg-text-muted': variant === 'neutral',
          })}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}

export default Badge
