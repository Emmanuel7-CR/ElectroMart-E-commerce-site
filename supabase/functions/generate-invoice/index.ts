// supabase/functions/generate-invoice/index.ts
// Deploy: supabase functions deploy generate-invoice
// Generates a simple text invoice and returns it as JSON
// (In production, extend with a PDF library like pdfmake for Deno)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const APP_NAME = Deno.env.get('APP_NAME') || 'StoreFront Pro'
const APP_URL = Deno.env.get('APP_URL') || 'https://yourdomain.com'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { orderId } = await req.json()
    if (!orderId) throw new Error('orderId is required')

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *, profiles(full_name, email, phone),
        order_items(*), transactions(reference, paid_at)
      `)
      .eq('id', orderId)
      .single()

    if (error || !order) throw new Error('Order not found')

    // Build invoice text
    const lines = [
      `${APP_NAME} — INVOICE`,
      `${'='.repeat(50)}`,
      `Order Number : ${order.order_number}`,
      `Date         : ${new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      `Status       : ${order.status}`,
      `Payment      : ${order.payment_status}`,
      ``,
      `CUSTOMER`,
      `-`.repeat(30),
      order.profiles?.full_name || 'N/A',
      order.profiles?.email || '',
      order.profiles?.phone || '',
      ``,
      `SHIPPING ADDRESS`,
      `-`.repeat(30),
      order.shipping_address?.full_name,
      order.shipping_address?.address_line1,
      order.shipping_address?.address_line2 || '',
      `${order.shipping_address?.city}, ${order.shipping_address?.state}`,
      order.shipping_address?.phone,
      ``,
      `ITEMS`,
      `-`.repeat(50),
      ...(order.order_items || []).map((item: any) =>
        `${item.product_name.padEnd(30)} x${item.quantity}  ₦${Number(item.total_price).toLocaleString()}`
      ),
      ``,
      `${'='.repeat(50)}`,
      `Subtotal      : ₦${Number(order.subtotal).toLocaleString()}`,
      order.discount_amount > 0 ? `Discount      : -₦${Number(order.discount_amount).toLocaleString()}` : '',
      `Shipping      : ${order.shipping_amount > 0 ? '₦' + Number(order.shipping_amount).toLocaleString() : 'Free'}`,
      `TOTAL         : ₦${Number(order.total).toLocaleString()}`,
      ``,
      order.transactions?.[0]?.reference ? `Payment Ref   : ${order.transactions[0].reference}` : '',
      ``,
      `Thank you for shopping with ${APP_NAME}`,
      APP_URL,
    ].filter(l => l !== null && l !== undefined)

    const invoiceText = lines.join('\n')

    return new Response(
      JSON.stringify({ success: true, invoice: invoiceText, order_number: order.order_number }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})
