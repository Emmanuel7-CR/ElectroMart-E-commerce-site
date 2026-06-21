// supabase/functions/verify-payment/index.ts
// Deploy with: supabase functions deploy verify-payment

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PAYSTACK_SECRET = Deno.env.get('PAYSTACK_SECRET_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { reference, orderId } = await req.json()
    if (!reference || !orderId) {
      return new Response(JSON.stringify({ error: 'Missing reference or orderId' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // Verify with Paystack
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    })
    const paystackData = await paystackRes.json()

    if (!paystackRes.ok || !paystackData.status || paystackData.data?.status !== 'success') {
      return new Response(JSON.stringify({ error: 'Payment verification failed', paystack: paystackData }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const amount = paystackData.data.amount / 100 // Convert from kobo

    // Record transaction
    await supabase.from('transactions').upsert({
      order_id: orderId,
      reference,
      amount,
      currency: paystackData.data.currency,
      status: 'success',
      gateway: 'paystack',
      gateway_response: paystackData.data,
      paid_at: new Date().toISOString(),
    }, { onConflict: 'reference' })

    // Update order to confirmed + paid
    await supabase.from('orders').update({
      payment_status: 'paid',
      status: 'confirmed',
      updated_at: new Date().toISOString(),
    }).eq('id', orderId)

    // Add status history
    await supabase.from('order_status_history').insert({
      order_id: orderId,
      status: 'confirmed',
      note: `Payment verified via Paystack. Ref: ${reference}`,
    })

    // Deduct stock for order items
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('variant_id, quantity')
      .eq('order_id', orderId)
      .not('variant_id', 'is', null)

    for (const item of orderItems || []) {
      await supabase.rpc('decrement_stock', {
        p_variant_id: item.variant_id,
        p_quantity: item.quantity,
      })
    }

    // Get order + user email for confirmation email
    const { data: order } = await supabase
      .from('orders')
      .select('*, profiles(email, full_name), order_items(*)')
      .eq('id', orderId)
      .single()

    // Fire order confirmation email (best-effort)
    if (order?.profiles?.email) {
      await supabase.functions.invoke('send-email', {
        body: {
          to: order.profiles.email,
          subject: `Order confirmed — ${order.order_number}`,
          template: 'order-confirmation',
          data: { order },
        },
      }).catch(console.error)
    }

    return new Response(JSON.stringify({ success: true, amount }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
