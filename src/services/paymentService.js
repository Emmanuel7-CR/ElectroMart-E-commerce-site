import { supabase } from '@/lib/supabase'

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY

export const paymentService = {
  /**
   * Initialize a Paystack inline payment popup
   */
  initializePayment({ email, amount, reference, orderId, onSuccess, onClose }) {
    // Paystack amount is in kobo (smallest unit)
    const amountInKobo = Math.round(amount * 100)

    // Load Paystack inline script dynamically if not already loaded
    const load = () => {
      return new Promise((resolve) => {
        if (window.PaystackPop) { resolve(); return }
        const script = document.createElement('script')
        script.src = 'https://js.paystack.co/v1/inline.js'
        script.onload = resolve
        document.head.appendChild(script)
      })
    }

    return load().then(() => {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email,
        amount: amountInKobo,
        currency: 'NGN',
        ref: reference,
        metadata: {
          order_id: orderId,
          custom_fields: [
            { display_name: 'Order ID', variable_name: 'order_id', value: orderId },
          ],
        },
        callback: (response) => {
          onSuccess?.(response)
        },
        onClose: () => {
          onClose?.()
        },
      })
      handler.openIframe()
    })
  },

  /**
   * Record a transaction after Paystack callback
   */
  async recordTransaction({ orderId, reference, amount, status, gatewayResponse }) {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        order_id: orderId,
        user_id: user?.id,
        reference,
        amount,
        currency: 'NGN',
        status,
        gateway: 'paystack',
        gateway_response: gatewayResponse || {},
        paid_at: status === 'success' ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Update order payment status after successful payment
   */
  async markOrderPaid(orderId) {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: 'paid', status: 'confirmed' })
      .eq('id', orderId)

    if (error) throw error

    // Add to status history
    await supabase.from('order_status_history').insert({
      order_id: orderId,
      status: 'confirmed',
      note: 'Payment received via Paystack',
    })
  },

  /**
   * Reduce stock for all items in an order
   */
  async deductStock(orderItems) {
    for (const item of orderItems) {
      if (!item.variant_id) continue
      const { error } = await supabase.rpc('decrement_stock', {
        p_variant_id: item.variant_id,
        p_quantity: item.quantity,
      })
      if (error) console.error('Stock deduction failed:', error)
    }
  },
}

export default paymentService
