import { cn } from '@/utils/helpers'

export function ProductVariants({ variantOptions = [], variants = [], selectedOptions, onOptionChange }) {
  /**
   * selectedOptions: { Color: 'Red', Size: 'M' }
   * onOptionChange(optionName, value): updates selected
   */

  const isOptionAvailable = (optionName, value) => {
    const trial = { ...selectedOptions, [optionName]: value }
    return variants.some(v => {
      if (!v.is_active) return false
      return Object.entries(trial).every(([k, val]) => v.options[k] === val)
    })
  }

  const getVariantForOptions = (opts) => {
    return variants.find(v =>
      v.is_active &&
      Object.entries(opts).every(([k, val]) => v.options[k] === val)
    )
  }

  const selectedVariant = Object.keys(selectedOptions).length === variantOptions.length
    ? getVariantForOptions(selectedOptions)
    : null

  if (!variantOptions.length) return null

  return (
    <div className="space-y-5">
      {variantOptions
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(option => {
          const isColor = option.name.toLowerCase().includes('color') || option.name.toLowerCase().includes('colour')
          const selected = selectedOptions[option.name]

          return (
            <div key={option.id}>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-sm font-semibold text-text-primary">{option.name}:</span>
                {selected && (
                  <span className="text-sm text-text-secondary">{selected}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {option.values.map(value => {
                  const available = isOptionAvailable(option.name, value)
                  const isSelected = selected === value

                  if (isColor) {
                    // Color swatch
                    const colorMap = {
                      red: '#EF4444', blue: '#3B82F6', green: '#22C55E', black: '#000',
                      white: '#FFF', yellow: '#EAB308', purple: '#A855F7', pink: '#EC4899',
                      orange: '#F97316', gray: '#9CA3AF', navy: '#1E3A5F', brown: '#92400E',
                    }
                    const bg = colorMap[value.toLowerCase()] || '#CBD5E1'
                    return (
                      <button
                        key={value}
                        onClick={() => available && onOptionChange(option.name, value)}
                        disabled={!available}
                        title={value}
                        className={cn(
                          'w-8 h-8 rounded-full border-2 transition-all',
                          isSelected ? 'border-primary scale-110 shadow-sm' : 'border-border hover:border-primary/50',
                          !available && 'opacity-40 cursor-not-allowed line-through'
                        )}
                        style={{ backgroundColor: bg }}
                        aria-label={value}
                        aria-pressed={isSelected}
                      />
                    )
                  }

                  // Text/size button
                  return (
                    <button
                      key={value}
                      onClick={() => available && onOptionChange(option.name, value)}
                      disabled={!available}
                      className={cn(
                        'relative min-w-[40px] h-9 px-3 rounded-lg border text-sm font-medium transition-all',
                        isSelected
                          ? 'border-primary bg-primary text-white shadow-sm'
                          : 'border-border text-text-secondary hover:border-primary/50 hover:text-text-primary',
                        !available && 'opacity-40 cursor-not-allowed'
                      )}
                      aria-pressed={isSelected}
                    >
                      {value}
                      {/* Strike-through line for unavailable */}
                      {!available && (
                        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="w-full border-t border-text-muted/50 rotate-[-20deg]" />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

      {/* Selected variant info */}
      {selectedVariant && (
        <div className="rounded-lg bg-background border border-border px-3 py-2.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">
              {selectedVariant.stock_qty > 0
                ? `${selectedVariant.stock_qty} in stock`
                : 'Out of stock'}
            </span>
            {selectedVariant.sku && (
              <span className="text-text-muted text-xs">SKU: {selectedVariant.sku}</span>
            )}
          </div>
          {selectedVariant.stock_qty > 0 && selectedVariant.stock_qty <= selectedVariant.low_stock_threshold && (
            <p className="text-warning text-xs mt-0.5 font-medium">
              ⚡ Only {selectedVariant.stock_qty} left
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default ProductVariants
