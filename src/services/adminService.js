import { supabase } from '@/lib/supabase'

export const adminService = {
  /* ── Dashboard ── */
  async getDashboardStats() {
    const [orders, revenue, customers, products] = await Promise.all([
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('total').eq('payment_status', 'paid').neq('status', 'cancelled').neq('status', 'refunded'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    ])
    const totalRevenue = (revenue.data || []).reduce((s, o) => s + Number(o.total), 0)
    return {
      totalOrders: orders.count || 0,
      totalRevenue,
      totalCustomers: customers.count || 0,
      totalProducts: products.count || 0,
    }
  },

  async getRevenueChart(days = 30) {
    const since = new Date(Date.now() - days * 86400000).toISOString()
    const { data } = await supabase
      .from('orders')
      .select('total, created_at')
      .eq('payment_status', 'paid')
      .gte('created_at', since)
      .order('created_at', { ascending: true })
    // Group by day
    const map = {}
    ;(data || []).forEach(o => {
      const day = o.created_at.slice(0, 10)
      map[day] = (map[day] || 0) + Number(o.total)
    })
    return Object.entries(map).map(([date, revenue]) => ({ date, revenue }))
  },

  async getRecentOrders(limit = 8) {
    const { data } = await supabase
      .from('orders')
      .select('id, order_number, status, payment_status, total, created_at, profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(limit)
    return data || []
  },

  async getOrderStatusCounts() {
    const { data } = await supabase
      .from('orders')
      .select('status')
    const counts = {}
    ;(data || []).forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1 })
    return counts
  },

  /* ── Products ── */
  async getProducts({ page = 1, limit = 20, search = '', status = '', categoryId = '' } = {}) {
    const from = (page - 1) * limit
    let q = supabase
      .from('products')
      .select(`id, name, slug, price, compare_price, status, is_featured, created_at,
        categories(name), brands(name),
        product_images(url, is_primary),
        product_variants(stock_qty)`, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)
    if (search) q = q.ilike('name', `%${search}%`)
    if (status) q = q.eq('status', status)
    if (categoryId) q = q.eq('category_id', categoryId)
    const { data, count } = await q
    return { products: data || [], total: count || 0 }
  },

  async getProduct(id) {
    const { data, error } = await supabase
      .from('products')
      .select(`*, categories(id,name,slug), brands(id,name,slug),
        product_images(id, url, alt_text, sort_order, is_primary),
        product_variants(id, name, sku, price, compare_price, stock_qty, low_stock_threshold, options, is_active),
        variant_options(id, name, values, sort_order)`)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async createProduct(data) {
    const { data: product, error } = await supabase
      .from('products')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return product
  },

  async updateProduct(id, data) {
    const { data: product, error } = await supabase
      .from('products')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return product
  },

  async deleteProduct(id) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
  },

  async uploadProductImage(productId, file) {
    const ext = file.name.split('.').pop()
    const path = `${productId}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(path, file, { upsert: true })
    if (uploadError) throw uploadError
    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path)
    return publicUrl
  },

  async addProductImage(productId, url, isPrimary = false) {
    const { error } = await supabase.from('product_images').insert({
      product_id: productId, url, is_primary: isPrimary, sort_order: 0,
    })
    if (error) throw error
  },

  async deleteProductImage(imageId) {
    const { error } = await supabase.from('product_images').delete().eq('id', imageId)
    if (error) throw error
  },

  /* ── Categories ── */
  async getCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*, parent:parent_id(name)')
      .order('sort_order', { ascending: true })
    return data || []
  },

  async createCategory(data) {
    const { data: cat, error } = await supabase.from('categories').insert(data).select().single()
    if (error) throw error
    return cat
  },

  async updateCategory(id, data) {
    const { data: cat, error } = await supabase
      .from('categories').update(data).eq('id', id).select().single()
    if (error) throw error
    return cat
  },

  async deleteCategory(id) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
  },

  /* ── Brands ── */
  async getBrands() {
    const { data } = await supabase.from('brands').select('*').order('name')
    return data || []
  },

  async createBrand(data) {
    const { data: brand, error } = await supabase.from('brands').insert(data).select().single()
    if (error) throw error
    return brand
  },

  async updateBrand(id, data) {
    const { data: brand, error } = await supabase
      .from('brands').update(data).eq('id', id).select().single()
    if (error) throw error
    return brand
  },

  async deleteBrand(id) {
    const { error } = await supabase.from('brands').delete().eq('id', id)
    if (error) throw error
  },

  /* ── Customers ── */
  async getCustomers({ page = 1, limit = 20, search = '' } = {}) {
    const from = (page - 1) * limit
    let q = supabase
      .from('profiles')
      .select('id, email, full_name, phone, role, is_active, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)
    if (search) q = q.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    const { data, count } = await q
    return { customers: data || [], total: count || 0 }
  },

  async getCustomer(id) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`*, addresses(*),
        orders(id, order_number, status, total, created_at)`)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async updateCustomerStatus(id, isActive) {
    const { error } = await supabase
      .from('profiles').update({ is_active: isActive }).eq('id', id)
    if (error) throw error
  },

  /* ── Orders (admin) ── */
  async getOrders({ page = 1, limit = 20, status = '', search = '' } = {}) {
    const from = (page - 1) * limit
    let q = supabase
      .from('orders')
      .select(`id, order_number, status, payment_status, total, currency, created_at,
        profiles(full_name, email)`, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)
    if (status) q = q.eq('status', status)
    if (search) q = q.ilike('order_number', `%${search}%`)
    const { data, count } = await q
    return { orders: data || [], total: count || 0 }
  },

  async getOrder(id) {
    const { data, error } = await supabase
      .from('orders')
      .select(`*, profiles(full_name, email, phone),
        order_items(*),
        order_status_history(status, note, created_at, profiles(full_name))`)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async updateOrderStatus(id, status, note = '') {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('orders')
      .update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
    await supabase.from('order_status_history').insert({
      order_id: id, status, note, created_by: user?.id,
    })
  },

  /* ── Inventory ── */
  async getLowStockVariants() {
    const { data } = await supabase.from('low_stock_variants').select('*')
    return data || []
  },

  async getInventory({ page = 1, limit = 20, search = '' } = {}) {
    const from = (page - 1) * limit
    let q = supabase
      .from('product_variants')
      .select(`id, name, sku, stock_qty, low_stock_threshold, is_active,
        products(id, name, slug, status)`, { count: 'exact' })
      .order('stock_qty', { ascending: true })
      .range(from, from + limit - 1)
    if (search) q = q.ilike('name', `%${search}%`)
    const { data, count } = await q
    return { variants: data || [], total: count || 0 }
  },

  async adjustStock(variantId, qty, note) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: variant } = await supabase
      .from('product_variants').select('stock_qty').eq('id', variantId).single()
    const newQty = Math.max(0, (variant?.stock_qty || 0) + qty)
    const { error } = await supabase
      .from('product_variants').update({ stock_qty: newQty }).eq('id', variantId)
    if (error) throw error
    await supabase.from('inventory_log').insert({
      variant_id: variantId,
      type: qty > 0 ? 'restock' : 'adjustment',
      quantity: qty,
      note,
      created_by: user?.id,
    })
  },

  /* ── Coupons ── */
  async getCoupons() {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
    return data || []
  },

  async createCoupon(data) {
    const { data: coupon, error } = await supabase
      .from('coupons').insert({ ...data, code: data.code.toUpperCase() }).select().single()
    if (error) throw error
    return coupon
  },

  async updateCoupon(id, data) {
    const { data: coupon, error } = await supabase
      .from('coupons').update(data).eq('id', id).select().single()
    if (error) throw error
    return coupon
  },

  async deleteCoupon(id) {
    const { error } = await supabase.from('coupons').delete().eq('id', id)
    if (error) throw error
  },

  /* ── Reviews ── */
  async getReviews({ page = 1, limit = 20, status = 'pending' } = {}) {
    const from = (page - 1) * limit
    let q = supabase
      .from('reviews')
      .select(`id, rating, title, body, status, is_verified, created_at,
        profiles(full_name, email),
        products(name, slug)`, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)
    if (status !== 'all') q = q.eq('status', status)
    const { data, count } = await q
    return { reviews: data || [], total: count || 0 }
  },

  async updateReviewStatus(id, status) {
    const { error } = await supabase.from('reviews').update({ status }).eq('id', id)
    if (error) throw error
  },

  async deleteReview(id) {
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) throw error
  },
}

export default adminService
