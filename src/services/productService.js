import { supabase } from '@/lib/supabase'

const PRODUCT_SELECT = `
  id, name, slug, description, price, compare_price, status, is_featured, tags, sku,
  category_id, brand_id,
  categories ( id, name, slug ),
  brands ( id, name, slug, logo_url ),
  product_images ( id, url, alt_text, sort_order, is_primary ),
  product_variants (
    id, name, sku, price, compare_price, stock_qty, low_stock_threshold,
    image_url, options, is_active
  )
`

export const productService = {
  /**
   * Fetch paginated product list with filters
   */
  async getProducts({
    page = 1,
    limit = 12,
    categorySlug,
    brandSlug,
    search,
    minPrice,
    maxPrice,
    tags,
    featured,
    sortBy = 'created_at',
    sortDir = 'desc',
  } = {}) {
    let query = supabase
      .from('products')
      .select(PRODUCT_SELECT, { count: 'exact' })
      .eq('status', 'active')

    // Category filter via join
    if (categorySlug) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single()
      if (cat) query = query.eq('category_id', cat.id)
    }

    // Brand filter
    if (brandSlug) {
      const { data: brand } = await supabase
        .from('brands')
        .select('id')
        .eq('slug', brandSlug)
        .single()
      if (brand) query = query.eq('brand_id', brand.id)
    }

    // Full-text search
    if (search?.trim()) {
      query = query.textSearch('name', search.trim(), { type: 'websearch' })
    }

    // Price range
    if (minPrice !== undefined) query = query.gte('price', minPrice)
    if (maxPrice !== undefined) query = query.lte('price', maxPrice)

    // Tags
    if (tags?.length) query = query.overlaps('tags', tags)

    // Featured
    if (featured) query = query.eq('is_featured', true)

    // Sort
    const sortColumn = {
      newest: 'created_at',
      oldest: 'created_at',
      price_asc: 'price',
      price_desc: 'price',
      name: 'name',
    }[sortBy] || 'created_at'

    const ascending = ['oldest', 'price_asc', 'name'].includes(sortBy)
    query = query.order(sortColumn, { ascending })

    // Pagination
    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)

    const { data, error, count } = await query
    if (error) throw error

    return {
      products: (data || []).map(normalizeProduct),
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    }
  },

  /**
   * Fetch a single product by slug
   */
  async getProductBySlug(slug) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        ${PRODUCT_SELECT},
        variant_options ( id, name, values, sort_order )
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .single()

    if (error) throw error
    return normalizeProduct(data)
  },

  /**
   * Fetch related products (same category, exclude current)
   */
  async getRelatedProducts(productId, categoryId, limit = 4) {
    if (!categoryId) return []
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('status', 'active')
      .eq('category_id', categoryId)
      .neq('id', productId)
      .limit(limit)
    if (error) return []
    return (data || []).map(normalizeProduct)
  },

  /**
   * Fetch featured products for homepage
   */
  async getFeaturedProducts(limit = 8) {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data || []).map(normalizeProduct)
  },

  /**
   * Quick search — for the search modal (name only, fast)
   */
  async quickSearch(term, limit = 8) {
    if (!term?.trim()) return []
    const { data } = await supabase
      .from('products')
      .select('id, name, slug, price, product_images(url, is_primary)')
      .eq('status', 'active')
      .ilike('name', `%${term.trim()}%`)
      .limit(limit)
    return (data || []).map(p => ({
      ...p,
      primaryImage: p.product_images?.find(i => i.is_primary)?.url
        || p.product_images?.[0]?.url || null,
    }))
  },
}

/* ── Normalize product from DB shape ── */
function normalizeProduct(p) {
  if (!p) return null
  const images = (p.product_images || []).sort((a, b) => a.sort_order - b.sort_order)
  const primaryImage = images.find(i => i.is_primary)?.url || images[0]?.url || null
  const variants = (p.product_variants || []).filter(v => v.is_active)
  const inStock = variants.length
    ? variants.some(v => v.stock_qty > 0)
    : true // products without variants assumed in stock
  const totalStock = variants.length
    ? variants.reduce((sum, v) => sum + (v.stock_qty || 0), 0)
    : null

  return {
    ...p,
    images,
    primaryImage,
    variants,
    inStock,
    totalStock,
    discountPercent: p.compare_price && p.compare_price > p.price
      ? Math.round(((p.compare_price - p.price) / p.compare_price) * 100)
      : null,
  }
}

export default productService
