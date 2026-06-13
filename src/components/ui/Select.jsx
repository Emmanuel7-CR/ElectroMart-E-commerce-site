import { forwardRef } from 'react'
import { ChevronDown, AlertCircle } from 'lucide-react'
import { cn } from '@/utils/helpers'

export const Select = forwardRef(({
  label,
  error,
  hint,
  options = [],
  placeholder,
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
        <select
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          className={cn(
            'input-base appearance-none pr-9',
            error && 'input-error',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>{placeholder}</option>
          )}
          {options.map(opt => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {error
            ? <AlertCircle className="w-4 h-4 text-danger" aria-hidden="true" />
            : <ChevronDown className="w-4 h-4 text-text-muted" aria-hidden="true" />
          }
        </div>
      </div>
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

Select.displayName = 'Select'

export default Select
