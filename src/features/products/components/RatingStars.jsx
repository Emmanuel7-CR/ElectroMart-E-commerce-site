import { Star } from 'lucide-react'
import { cn } from '@/utils/helpers'

export function RatingStars({ rating = 0, max = 5, size = 'sm', interactive = false, onChange, className }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' }
  const sz = sizes[size] || sizes.sm

  return (
    <div className={cn('flex items-center gap-0.5', className)} role={interactive ? 'radiogroup' : 'img'} aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating)
        const partial = !filled && i < rating
        return (
          <button
            key={i}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => onChange?.(i + 1) : undefined}
            className={cn(
              interactive && 'hover:scale-110 transition-transform cursor-pointer',
              !interactive && 'pointer-events-none'
            )}
            aria-label={interactive ? `Rate ${i + 1} star${i !== 0 ? 's' : ''}` : undefined}
          >
            <Star
              className={cn(sz, filled || partial ? 'fill-warning text-warning' : 'text-border fill-transparent')}
            />
          </button>
        )
      })}
    </div>
  )
}

export default RatingStars
