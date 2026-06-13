import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/helpers'

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
}

const sizes = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
}

export const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(sizes[size], variants[variant], className)}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : LeftIcon ? (
        <LeftIcon className="w-4 h-4" aria-hidden="true" />
      ) : null}
      {children}
      {!loading && RightIcon && (
        <RightIcon className="w-4 h-4" aria-hidden="true" />
      )}
    </button>
  )
})

Button.displayName = 'Button'

export default Button
