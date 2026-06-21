import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight, Clock, TrendingUp, ImageOff } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { productService } from '@/services/productService'
import { useDebounce } from '@/hooks/useDebounce'
import { formatCurrency } from '@/utils/currency'
import { cn } from '@/utils/helpers'
import { Spinner } from '@/components/ui/Spinner'

const TRENDING = ['Nike sneakers', 'iPhone 15', 'Samsung TV', 'Gaming laptop', 'Wireless earbuds']

function ResultItem({ result, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-background transition-colors text-left group"
    >
      <div className="w-10 h-10 rounded-lg bg-background border border-border overflow-hidden shrink-0 group-hover:border-primary/30 transition-colors">
        {result.primaryImage ? (
          <img src={result.primaryImage} alt={result.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="w-4 h-4 text-text-muted" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate group-hover:text-primary transition-colors">
          {result.name}
        </p>
        <p className="text-xs text-text-muted">{formatCurrency(result.price)}</p>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}

export function SearchModal() {
  const { searchOpen, closeSearch } = useUIStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const debouncedQuery = useDebounce(query, 300)

  // Focus input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setResults([])
    }
  }, [searchOpen])

  // Search on debounced query
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    productService.quickSearch(debouncedQuery)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  // Keyboard close
  useEffect(() => {
    if (!searchOpen) return
    const handler = (e) => { if (e.key === 'Escape') closeSearch() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [searchOpen, closeSearch])

  if (!searchOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    closeSearch()
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const handleResultClick = (result) => {
    closeSearch()
    navigate(`/products/${result.slug}`)
  }

  const handleTrending = (term) => {
    setQuery(term)
    inputRef.current?.focus()
  }

  return (
    <div className="fixed inset-0 z-50 animate-fade-in" role="dialog" aria-modal="true" aria-label="Search">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-secondary/60 backdrop-blur-sm"
        onClick={closeSearch}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative max-w-xl mx-auto mt-16 mx-4 sm:mx-auto animate-slide-up">
        <div className="bg-surface rounded-2xl shadow-modal border border-border overflow-hidden">
          {/* Search input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
            <Search className="w-4 h-4 text-text-muted shrink-0" aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products…"
              className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted text-sm outline-none"
              autoComplete="off"
            />
            {loading && <Spinner size="sm" />}
            {query && !loading && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button type="submit" className="sr-only">Search</button>
          </form>

          {/* Results */}
          {query.trim() ? (
            <div className="max-h-80 overflow-y-auto">
              {results.length > 0 ? (
                <>
                  <p className="px-4 pt-3 pb-1 text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Products
                  </p>
                  {results.map(r => (
                    <ResultItem key={r.id} result={r} onClick={() => handleResultClick(r)} />
                  ))}
                  <div className="px-4 py-3 border-t border-border">
                    <button
                      onClick={handleSubmit}
                      className="text-sm text-primary hover:text-primary-hover font-medium flex items-center gap-1.5 transition-colors"
                    >
                      See all results for "{query}"
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                !loading && (
                  <div className="px-4 py-8 text-center text-sm text-text-muted">
                    No products found for "{query}"
                  </div>
                )
              )}
            </div>
          ) : (
            /* Empty state: show trending */
            <div className="p-4">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Trending searches
              </p>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map(term => (
                  <button
                    key={term}
                    onClick={() => handleTrending(term)}
                    className="px-3 py-1.5 bg-background border border-border rounded-full text-xs text-text-secondary hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Keyboard hint */}
        <p className="text-center text-xs text-white/50 mt-3">
          Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">Esc</kbd> to close
        </p>
      </div>
    </div>
  )
}

export default SearchModal
