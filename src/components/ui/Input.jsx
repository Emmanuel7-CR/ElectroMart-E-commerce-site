import { forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/utils/helpers'

export const Input = forwardRef(({
  label,
  error,
  hint,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className,
  containerClassName,
  required,
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
      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <LeftIcon className="w-4 h-4 text-text-muted" aria-hidden="true" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            'input-base',
            LeftIcon && 'pl-9',
            (RightIcon || error) && 'pr-9',
            error && 'input-error',
            className
          )}
          {...props}
        />
        {error ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <AlertCircle className="w-4 h-4 text-danger" aria-hidden="true" />
          </div>
        ) : RightIcon ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <RightIcon className="w-4 h-4 text-text-muted" aria-hidden="true" />
          </div>
        ) : null}
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="form-error">
          <AlertCircle className="w-3 h-3" aria-hidden="true" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="form-hint">{hint}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
