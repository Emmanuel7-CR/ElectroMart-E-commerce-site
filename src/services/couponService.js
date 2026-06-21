import { supabase } from '@/lib/supabase'

export const couponService = {
  /**
   * Validate a coupon code and return discount details
   */
  async validate(code, subtotal) {
    if (!code?.trim()) throw new Error('Please enter a coupon code')

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .eq('is_active', true)
      .single()

    if (error || !coupon) throw new Error('Invalid coupon code')

    const now = new Date()
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      throw new Error('This coupon is not active yet')
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      throw new Error('This coupon has expired')
    }
    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      throw new Error('This coupon has reached its usage limit')
    }
    if (subtotal < coupon.min_order_amount) {
      throw new Error(`Minimum order amount of ₦${coupon.min_order_amount.toLocaleString()} required`)
    }

    // Check per-user usage
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: existing } = await supabase
        .from('coupon_uses')
        .select('id')
        .eq('coupon_id', coupon.id)
        .eq('user_id', user.id)
        .single()
      if (existing) throw new Error('You have already used this coupon')
    }

    // Calculate discount
    let discountAmount = 0
    if (coupon.type === 'percentage') {
      discountAmount = (subtotal * coupon.value) / 100
    } else if (coupon.type === 'fixed') {
      discountAmount = Math.min(coupon.value, subtotal)
    } else if (coupon.type === 'free_shipping') {
      discountAmount = 0 // Applied to shipping at checkout
    }

    return { coupon, discountAmount: Math.round(discountAmount * 100) / 100 }
  },
}

export default couponService
