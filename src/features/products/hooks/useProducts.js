import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productService } from '@/services/productService'

export function useProducts({ categorySlug, brandSlug, initialLimit = 12 } = {}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Derive filter state from URL params
  const page = parseInt(searchParams.get('page') || '1', 10)
  const search = searchParams.get('q') || ''
  const sortBy = searchParams.get('sort') || 'newest'
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
  const tagParam = searchParams.get('tag')
  const tags = tagParam ? [tagParam] : []
  const featured = searchParams.get('featured') === 'true'

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await productService.getProducts({
        page,
        limit: initialLimit,
        categorySlug,
        brandSlug,
        search: search || undefined,
        minPrice,
        maxPrice,
        tags: tags.length ? tags : undefined,
        featured: featured || undefined,
        sortBy,
      })
      setProducts(result.products)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch (err) {
      setError(err.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [page, search, sortBy, minPrice, maxPrice, tagParam, featured, categorySlug, brandSlug])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const setFilter = useCallback((key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value === null || value === undefined || value === '') {
        next.delete(key)
      } else {
        next.set(key, String(value))
      }
      // Reset to page 1 when filter changes
      if (key !== 'page') next.delete('page')
      return next
    })
  }, [setSearchParams])

  const setPage = useCallback((p) => setFilter('page', p), [setFilter])
  const setSort = useCallback((s) => setFilter('sort', s), [setFilter])
  const setSearch = useCallback((s) => setFilter('q', s), [setFilter])
  const setPriceRange = useCallback((min, max) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      min != null ? next.set('minPrice', min) : next.delete('minPrice')
      max != null ? next.set('maxPrice', max) : next.delete('maxPrice')
      next.delete('page')
      return next
    })
  }, [setSearchParams])

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams())
  }, [setSearchParams])

  return {
    products,
    total,
    totalPages,
    page,
    loading,
    error,
    search,
    sortBy,
    minPrice,
    maxPrice,
    tags,
    featured,
    setPage,
    setSort,
    setSearch,
    setPriceRange,
    setFilter,
    clearFilters,
    refresh: fetchProducts,
  }
}

export default useProducts
