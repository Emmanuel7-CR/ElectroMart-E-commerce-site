/**
 * Email service — triggers Supabase Edge Function which calls Resend.
 * All email sending is server-side to protect the API key.
 */
import { supabase } from '@/lib/supabase'

export const emailService = {
  async send({ to, subject, template, data }) {
    const { data: result, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, template, data },
    })
    if (error) throw error
    return result
  },

  async sendOrderConfirmation(order, userEmail) {
    return emailService.send({
      to: userEmail,
      subject: `Order confirmed — ${order.order_number}`,
      template: 'order-confirmation',
      data: { order },
    })
  },

  async sendShippingUpdate(order, userEmail, trackingNumber) {
    return emailService.send({
      to: userEmail,
      subject: `Your order ${order.order_number} has shipped!`,
      template: 'shipping-update',
      data: { order, trackingNumber },
    })
  },

  async sendWelcome(userEmail, fullName) {
    return emailService.send({
      to: userEmail,
      subject: `Welcome to StoreFront Pro!`,
      template: 'welcome',
      data: { fullName },
    })
  },
}

export default emailService
