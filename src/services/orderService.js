import { supabase } from '@/lib/supabase'
import { generateReference } from '@/utils/helpers'

export const orderService = {
  /**
   * Create a new order from cart items
   */
  async createOrder({ items, shippingAddress, billingAddress, subtotal, shippingAmount = 0, taxAmount = 0, discountAmount = 0, couponCode = null, notes = null }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Must be signed in to place an order')

    const total = subtotal - discountAmount + shippingAmount + taxAmount

    // Create order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        payment_status: 'unpaid',
        subtotal,
        discount_amount: discountAmount,
        shipping_amount: shippingAmount,
        tax_amount: taxAmount,
        total,
        currency: 'NGN',
        coupon_code: couponCode,
        notes,
        shipping_address: shippingAddress,
        billing_address: billingAddress || shippingAddress,
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Insert order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      product_name: item.name,
      variant_name: item.variant_name || null,
      sku: item.sku || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity,
      image_url: item.image_url || null,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    // Record initial status history
    await supabase.from('order_status_history').insert({
      order_id: order.id,
      status: 'pending',
      note: 'Order placed',
      created_by: user.id,
    })

    return order
  },

  /**
   * Fetch orders for current user
   */
  async getUserOrders({ page = 1, limit = 10 } = {}) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const from = (page - 1) * limit
    const { data, error, count } = await supabase
      .from('orders')
      .select(`
        id, order_number, status, payment_status, total, currency, created_at,
        order_items ( id, product_name, quantity, unit_price, image_url )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)

    if (error) throw error
    return { orders: data || [], total: count || 0 }
  },

  /**
   * Fetch a single order by ID
   */
  async getOrder(orderId) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items ( * ),
        order_status_history ( status, note, created_at )
      `)
      .eq('id', orderId)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Generate a Paystack payment reference for an order
   */
  generatePaymentReference(orderId) {
    return `PAY-${orderId.slice(0, 8).toUpperCase()}-${Date.now()}`
  },
}

export default orderService
