import { useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ImageOff } from 'lucide-react'
import { cn } from '@/utils/helpers'

export function ProductImages({ images = [], productName }) {
  const [selected, setSelected] = useState(0)
  const [zoomed, setZoomed] = useState(false)

  const current = images[selected]

  const prev = () => setSelected(i => (i > 0 ? i - 1 : images.length - 1))
  const next = () => setSelected(i => (i < images.length - 1 ? i + 1 : 0))

  if (!images.length) {
    return (
      <div className="aspect-square rounded-2xl bg-background border border-border flex items-center justify-center">
        <ImageOff className="w-16 h-16 text-text-muted" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-background border border-border group">
        <img
          src={current?.url}
          alt={current?.alt_text || productName}
          className={cn(
            'w-full h-full object-cover transition-transform duration-500',
            zoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in group-hover:scale-105'
          )}
          onClick={() => setZoomed(z => !z)}
        />

        {/* Zoom icon */}
        <button
          onClick={() => setZoomed(z => !z)}
          className="absolute top-3 right-3 w-8 h-8 bg-surface/80 backdrop-blur-sm rounded-lg flex items-center justify-center text-text-secondary hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
          aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Prev / Next arrows (only when multiple images) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center text-text-secondary hover:text-primary transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center text-text-secondary hover:text-primary transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-all',
                    i === selected ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                  )}
                  aria-label={`Image ${i + 1}`}
                  aria-current={i === selected}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {images.map((img, i) => (
            <button
              key={img.id || i}
              onClick={() => setSelected(i)}
              className={cn(
                'flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all',
                i === selected ? 'border-primary shadow-sm' : 'border-border hover:border-primary/50'
              )}
              aria-label={`View image ${i + 1}`}
              aria-pressed={i === selected}
            >
              <img
                src={img.url}
                alt={img.alt_text || `${productName} ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductImages
