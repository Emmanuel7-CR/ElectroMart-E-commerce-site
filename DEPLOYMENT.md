# StoreFront Pro — Deployment Guide

## Migrations (run in order in Supabase SQL Editor)
1. 001_init_users.sql
2. 002_products.sql
3. 003_orders.sql
4. 004_reviews_coupons_inventory.sql
5. 005_storage_seed.sql
6. 006_functions_views.sql
7. 007_security_audit.sql

## Environment Variables (.env.local)
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_PAYSTACK_PUBLIC_KEY=pk_test_...
VITE_APP_URL=http://localhost:3000
VITE_APP_NAME=StoreFront Pro
```

## Edge Function Secrets (supabase secrets set KEY value)
```
PAYSTACK_SECRET_KEY=sk_live_...
RESEND_API_KEY=re_...
FROM_EMAIL=orders@yourdomain.com
APP_NAME=StoreFront Pro
APP_URL=https://yourdomain.com
```

## Deploy Edge Functions
```bash
supabase link --project-ref your-ref
supabase functions deploy send-email
supabase functions deploy verify-payment
```

## Deploy Frontend (Vercel)
```bash
vercel
# Add vercel.json: { "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
```

## Production Checklist
- [ ] Live Paystack keys
- [ ] Resend domain verified
- [ ] All 7 migrations run
- [ ] Both Edge Functions deployed
- [ ] Production URL in Supabase redirect URLs
- [ ] Admin account promoted
- [ ] Test checkout with real card
