import { cn } from '@/utils/helpers'

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('skeleton', className)}
      aria-hidden="true"
      {...props}
    />
  )
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 ? '65%' : '100%' }}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className }) {
  return (
    <div className={cn('card', className)} aria-hidden="true">
      <Skeleton className="h-48 w-full mb-4 rounded-lg" />
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <Skeleton className="h-6 w-1/3" />
    </div>
  )
}

export default Skeleton
