import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/helpers'

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
}

export function Spinner({ size = 'md', className, label = 'Loading...' }) {
  return (
    <span role="status" aria-label={label}>
      <Loader2 className={cn('animate-spin text-primary', sizes[size], className)} aria-hidden="true" />
    </span>
  )
}

export function PageSpinner() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

export default Spinner
