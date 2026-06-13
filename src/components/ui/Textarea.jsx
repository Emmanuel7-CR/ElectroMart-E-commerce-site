import { forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/utils/helpers'

export const Textarea = forwardRef(({
  label,
  error,
  hint,
  className,
  containerClassName,
  required,
  rows = 4,
  id,
  ...props
}, ref) => {
  const inputId = id || props.name

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="text-danger ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        aria-invalid={!!error}
        className={cn(
          'input-base h-auto py-2.5 resize-y min-h-[80px]',
          error && 'input-error',
          className
        )}
        {...props}
      />
      {error && (
        <p role="alert" className="form-error">
          <AlertCircle className="w-3 h-3" aria-hidden="true" />
          {error}
        </p>
      )}
      {hint && !error && <p className="form-hint">{hint}</p>}
    </div>
  )
})

Textarea.displayName = 'Textarea'

export default Textarea
