import { useState, useCallback } from 'react'

export function usePagination(initialPage = 1, initialLimit = 12) {
  const [page, setPage] = useState(initialPage)
  const [limit] = useState(initialLimit)

  const nextPage = useCallback(() => setPage(p => p + 1), [])
  const prevPage = useCallback(() => setPage(p => Math.max(1, p - 1)), [])
  const goToPage = useCallback((p) => setPage(Math.max(1, p)), [])
  const reset = useCallback(() => setPage(1), [])

  const offset = (page - 1) * limit

  return { page, limit, offset, nextPage, prevPage, goToPage, reset, setPage }
}

export default usePagination
