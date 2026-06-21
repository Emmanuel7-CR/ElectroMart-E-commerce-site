import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/utils/helpers'
import { formatCurrency } from '@/utils/currency'
import { categoryService } from '@/services/categoryService'
import { brandService } from '@/services/brandService'
import { Button } from '@/components/ui/Button'
import { useSearchParams } from 'react-router-dom'

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full text-sm font-semibold text-text-primary mb-3"
        aria-expanded={open}
      >
        {title}
        {open
          ? <ChevronUp className="w-4 h-4 text-text-muted" />
          : <ChevronDown className="w-4 h-4 text-text-muted" />
        }
      </button>
      {open && children}
    </div>
  )
}

export function ProductFilters({ onClose, className }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [localMin, setLocalMin] = useState(searchParams.get('minPrice') || '')
  const [localMax, setLocalMax] = useState(searchParams.get('maxPrice') || '')

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(() => {})
    brandService.getAll().then(setBrands).catch(() => {})
  }, [])

  const selectedCategory = searchParams.get('category') || ''
  const selectedBrand = searchParams.get('brand') || ''
  const activeTag = searchParams.get('tag') || ''

  const setParam = (key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      value ? next.set(key, value) : next.delete(key)
      next.delete('page')
      return next
    })
  }

  const applyPrice = () => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      localMin ? next.set('minPrice', localMin) : next.delete('minPrice')
      localMax ? next.set('maxPrice', localMax) : next.delete('maxPrice')
      next.delete('page')
      return next
    })
  }

  const clearAll = () => {
    setLocalMin('')
    setLocalMax('')
    setSearchParams(new URLSearchParams())
    onClose?.()
  }

  const activeCount = [
    selectedCategory, selectedBrand, activeTag,
    searchParams.get('minPrice'), searchParams.get('maxPrice'),
    searchParams.get('featured'),
  ].filter(Boolean).length

  const TAGS = ['sale', 'new', 'trending', 'bestseller', 'limited']

  return (
    <div className={cn('bg-surface', className)}>
      {/* Filter header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <span className="font-semibold text-text-primary text-sm">Filters</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button onClick={clearAll} className="text-xs text-danger hover:text-red-600 transition-colors font-medium">
              Clear all
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-border transition-colors lg:hidden">
              <X className="w-4 h-4 text-text-muted" />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <FilterSection title="Category">
        <div className="space-y-1.5">
          <button
            onClick={() => setParam('category', '')}
            className={cn(
              'w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors',
              !selectedCategory ? 'bg-primary/10 text-primary font-medium' : 'text-text-secondary hover:bg-background hover:text-text-primary'
            )}
          >
            All categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setParam('category', cat.slug)}
              className={cn(
                'w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors',
                selectedCategory === cat.slug ? 'bg-primary/10 text-primary font-medium' : 'text-text-secondary hover:bg-background hover:text-text-primary'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Brands */}
      {brands.length > 0 && (
        <FilterSection title="Brand">
          <div className="space-y-1.5">
            <button
              onClick={() => setParam('brand', '')}
              className={cn(
                'w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors',
                !selectedBrand ? 'bg-primary/10 text-primary font-medium' : 'text-text-secondary hover:bg-background hover:text-text-primary'
              )}
            >
              All brands
            </button>
            {brands.map(brand => (
              <button
                key={brand.id}
                onClick={() => setParam('brand', brand.slug)}
                className={cn(
                  'w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors',
                  selectedBrand === brand.slug ? 'bg-primary/10 text-primary font-medium' : 'text-text-secondary hover:bg-background hover:text-text-primary'
                )}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price range */}
      <FilterSection title="Price range">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-xs text-text-muted mb-1 block">Min (₦)</label>
              <input
                type="number"
                placeholder="0"
                value={localMin}
                onChange={e => setLocalMin(e.target.value)}
                min="0"
                className="input-base h-9 text-sm"
              />
            </div>
            <div className="mt-4 text-text-muted text-sm">—</div>
            <div className="flex-1">
              <label className="text-xs text-text-muted mb-1 block">Max (₦)</label>
              <input
                type="number"
                placeholder="Any"
                value={localMax}
                onChange={e => setLocalMax(e.target.value)}
                min="0"
                className="input-base h-9 text-sm"
              />
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={applyPrice}>
            Apply price
          </Button>
          {(searchParams.get('minPrice') || searchParams.get('maxPrice')) && (
            <p className="text-xs text-text-muted text-center">
              {searchParams.get('minPrice') ? formatCurrency(+searchParams.get('minPrice')) : '₦0'}
              {' — '}
              {searchParams.get('maxPrice') ? formatCurrency(+searchParams.get('maxPrice')) : 'Any'}
            </p>
          )}
        </div>
      </FilterSection>

      {/* Tags */}
      <FilterSection title="Tags" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setParam('tag', activeTag === tag ? '' : tag)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize',
                activeTag === tag
                  ? 'bg-primary border-primary text-white'
                  : 'border-border text-text-secondary hover:border-primary/50 hover:text-primary'
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Featured */}
      <FilterSection title="Special" defaultOpen={false}>
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={searchParams.get('featured') === 'true'}
            onChange={e => setParam('featured', e.target.checked ? 'true' : '')}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
            Featured products only
          </span>
        </label>
      </FilterSection>
    </div>
  )
}

export default ProductFilters
