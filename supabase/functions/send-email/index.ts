// supabase/functions/send-email/index.ts
// Deploy with: supabase functions deploy send-email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'orders@yourdomain.com'
const APP_NAME = Deno.env.get('APP_NAME') || 'StoreFront Pro'
const APP_URL = Deno.env.get('APP_URL') || 'https://yourdomain.com'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/* ── Email templates ── */
function welcomeTemplate(data: { fullName: string }) {
  return `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#f8fafc">
      <div style="background:#fff;border-radius:16px;padding:40px;border:1px solid #e2e8f0">
        <h1 style="color:#0f172a;font-size:24px;margin:0 0 8px">Welcome to ${APP_NAME}, ${data.fullName}! 🎉</h1>
        <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 24px">
          Your account is all set. Start exploring thousands of premium products.
        </p>
        <a href="${APP_URL}/products" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
          Start Shopping
        </a>
        <p style="color:#94a3b8;font-size:13px;margin:32px 0 0">
          Use code <strong>WELCOME10</strong> for 10% off your first order.
        </p>
      </div>
    </div>`
}

function orderConfirmationTemplate(data: { order: any }) {
  const { order } = data
  const items = (order.order_items || []).map((item: any) =>
    `<tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:14px">${item.product_name} × ${item.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right;color:#0f172a;font-size:14px;font-weight:600">₦${Number(item.total_price).toLocaleString()}</td></tr>`
  ).join('')

  return `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#f8fafc">
      <div style="background:#fff;border-radius:16px;padding:40px;border:1px solid #e2e8f0">
        <div style="text-align:center;margin-bottom:32px">
          <div style="width:56px;height:56px;background:#dcfce7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px">
            <span style="font-size:24px">✓</span>
          </div>
          <h1 style="color:#0f172a;font-size:22px;margin:0 0 4px">Order Confirmed!</h1>
          <p style="color:#64748b;margin:0;font-size:14px">${order.order_number}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">${items}</table>
        <div style="border-top:2px solid #0f172a;padding-top:12px;text-align:right;font-size:16px;font-weight:700;color:#0f172a">
          Total: ₦${Number(order.total).toLocaleString()}
        </div>
        <div style="margin-top:32px;text-align:center">
          <a href="${APP_URL}/orders/${order.id}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
            Track Your Order
          </a>
        </div>
      </div>
    </div>`
}

function shippingTemplate(data: { order: any; trackingNumber: string }) {
  return `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#f8fafc">
      <div style="background:#fff;border-radius:16px;padding:40px;border:1px solid #e2e8f0">
        <h1 style="color:#0f172a;font-size:22px;margin:0 0 8px">Your order has shipped! 🚚</h1>
        <p style="color:#64748b;font-size:15px;margin:0 0 8px">Order: <strong>${data.order.order_number}</strong></p>
        ${data.trackingNumber ? `<p style="color:#64748b;font-size:15px;margin:0 0 24px">Tracking: <strong>${data.trackingNumber}</strong></p>` : ''}
        <a href="${APP_URL}/orders/${data.order.id}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
          Track Shipment
        </a>
      </div>
    </div>`
}

const TEMPLATES: Record<string, (data: any) => string> = {
  'welcome': welcomeTemplate,
  'order-confirmation': orderConfirmationTemplate,
  'shipping-update': shippingTemplate,
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { to, subject, template, data } = await req.json()

    if (!to || !subject || !template) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const renderFn = TEMPLATES[template]
    if (!renderFn) {
      return new Response(JSON.stringify({ error: `Unknown template: ${template}` }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const html = renderFn(data || {})

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${APP_NAME} <${FROM_EMAIL}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    })

    const result = await res.json()
    if (!res.ok) throw new Error(result.message || 'Resend API error')

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
