import { forwardRef } from 'react'
import { cn } from '@/utils/helpers'

export const Checkbox = forwardRef(({
  label,
  description,
  error,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || props.name

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <input
        ref={ref}
        type="checkbox"
        id={inputId}
        className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-1 cursor-pointer"
        {...props}
      />
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label
              htmlFor={inputId}
              className="text-sm font-medium text-text-primary cursor-pointer select-none"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-text-muted mt-0.5">{description}</p>
          )}
          {error && (
            <p className="text-xs text-danger mt-0.5">{error}</p>
          )}
        </div>
      )}
    </div>
  )
})

Checkbox.displayName = 'Checkbox'
export default Checkbox
