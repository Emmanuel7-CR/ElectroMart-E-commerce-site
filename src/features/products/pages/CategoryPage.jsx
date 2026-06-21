import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { ProductListPage } from './ProductListPage'
import { categoryService } from '@/services/categoryService'

export function CategoryPage() {
  // CategoryPage re-uses ProductListPage — it reads :slug from the URL
  return <ProductListPage />
}

export default CategoryPage
