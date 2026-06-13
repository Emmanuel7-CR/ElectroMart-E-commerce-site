import { cn } from '@/utils/helpers'
import Button from './Button'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-4 text-center',
      className
    )}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-background flex items-center justify-center mb-4 border border-border">
          <Icon className="w-7 h-7 text-text-muted" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary max-w-xs mb-6">{description}</p>
      )}
      {action && (
        <Button
          variant={action.variant || 'primary'}
          size="md"
          onClick={action.onClick}
          leftIcon={action.icon}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
