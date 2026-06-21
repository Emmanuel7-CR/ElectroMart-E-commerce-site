# StoreFront Pro

A production-ready ecommerce platform — React 18 + Vite + Supabase + Paystack + Resend + PWA.

## Quick Start

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev                  # http://localhost:3000
```

Run migrations 001–007 in Supabase SQL Editor, then promote yourself to admin:
```sql
UPDATE public.profiles SET role = 'super_admin' WHERE email = 'your@email.com';
```

See **DEPLOYMENT.md** for full production setup.
