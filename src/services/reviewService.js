import { supabase } from '@/lib/supabase'

export const reviewService = {
  async getProductReviews(productId, { page = 1, limit = 10 } = {}) {
    const from = (page - 1) * limit
    const { data, error, count } = await supabase
      .from('reviews')
      .select(`
        id, rating, title, body, is_verified, created_at,
        profiles ( full_name, avatar_url )
      `, { count: 'exact' })
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)
    if (error) throw error
    return { reviews: data || [], total: count || 0 }
  },

  async getRatingSummary(productId) {
    const { data, error } = await supabase
      .from('product_ratings')
      .select('*')
      .eq('product_id', productId)
      .single()
    if (error) return null
    return data
  },

  async submitReview(productId, { rating, title, body, orderId }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Must be signed in to leave a review')

    const { data, error } = await supabase
      .from('reviews')
      .upsert({
        product_id: productId,
        user_id: user.id,
        order_id: orderId || null,
        rating,
        title: title || null,
        body,
        status: 'pending',
      }, { onConflict: 'user_id,product_id' })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getUserReview(productId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .single()
    return data
  },
}

export default reviewService
