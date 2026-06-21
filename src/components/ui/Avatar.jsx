import { cn } from '@/utils/helpers'

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
}

export function Avatar({ src, alt, name, size = 'md', className }) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div className={cn('rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 border border-border', sizes[size], className)}>
      {src ? (
        <img src={src} alt={alt || name || 'Avatar'} className="w-full h-full object-cover" />
      ) : (
        <span className="font-semibold text-primary leading-none">{initials}</span>
      )}
    </div>
  )
}

export default Avatar
