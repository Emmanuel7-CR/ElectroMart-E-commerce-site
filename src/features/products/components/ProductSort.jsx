import { ArrowUpDown } from 'lucide-react'
import { cn } from '@/utils/helpers'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A–Z' },
]

export function ProductSort({ value, onChange, className }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <ArrowUpDown className="w-3.5 h-3.5 text-text-muted shrink-0" aria-hidden="true" />
      <label htmlFor="product-sort" className="sr-only">Sort products</label>
      <select
        id="product-sort"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="text-sm bg-transparent text-text-primary border-none outline-none cursor-pointer pr-1 font-medium"
      >
        {SORT_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

export default ProductSort
