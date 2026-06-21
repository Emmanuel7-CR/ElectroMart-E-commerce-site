import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/utils/helpers'

export function StatsCard({ label, value, sub, icon: Icon, color = 'blue', trend, trendValue }) {
  const colors = {
    blue:   'bg-blue-50 dark:bg-blue-900/20 text-primary',
    green:  'bg-green-50 dark:bg-green-900/20 text-success',
    amber:  'bg-amber-50 dark:bg-amber-900/20 text-warning',
    cyan:   'bg-cyan-50 dark:bg-cyan-900/20 text-accent',
    red:    'bg-red-50 dark:bg-red-900/20 text-danger',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
  }

  return (
    <div className="card flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-text-primary leading-none mb-1">{value}</p>
        {(sub || trendValue !== undefined) && (
          <div className="flex items-center gap-1.5 mt-1">
            {trendValue !== undefined && (
              <span className={cn(
                'flex items-center gap-0.5 text-xs font-medium',
                trend === 'up' ? 'text-success' : 'text-danger'
              )}>
                {trend === 'up'
                  ? <TrendingUp className="w-3 h-3" />
                  : <TrendingDown className="w-3 h-3" />
                }
                {trendValue}
              </span>
            )}
            {sub && <p className="text-xs text-text-muted">{sub}</p>}
          </div>
        )}
      </div>
      {Icon && (
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', colors[color])}>
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
      )}
    </div>
  )
}

export default StatsCard
