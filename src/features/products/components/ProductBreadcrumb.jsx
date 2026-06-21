import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/utils/helpers'

export function ProductBreadcrumb({ crumbs = [], className }) {
  // crumbs: [{ label, href }]
  const all = [{ label: 'Home', href: '/' }, ...crumbs]

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-xs text-text-muted flex-wrap', className)}>
      {all.map((crumb, i) => {
        const isLast = i === all.length - 1
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3 h-3 text-border" aria-hidden="true" />}
            {isLast ? (
              <span className="text-text-primary font-medium" aria-current="page">{crumb.label}</span>
            ) : (
              <Link to={crumb.href} className="hover:text-primary transition-colors flex items-center gap-1">
                {i === 0 && <Home className="w-3 h-3" aria-hidden="true" />}
                {crumb.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

export default ProductBreadcrumb
