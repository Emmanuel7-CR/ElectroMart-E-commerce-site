import { useState, useEffect } from 'react'
import { productService } from '@/services/productService'

export function useProduct(slug) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    setError(null)

    productService.getProductBySlug(slug)
      .then(data => {
        if (!cancelled) {
          setProduct(data)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message || 'Product not found')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [slug])

  return { product, loading, error }
}

export default useProduct
