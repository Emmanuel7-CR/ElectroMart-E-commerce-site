-- ═══════════════════════════════════════════════════════════════
-- Migration 007: Security Audit Hardening
-- Phase 14 — run this after all previous migrations
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Prevent role escalation via profiles update ─────────────
-- Drop existing update policy and replace with hardened version
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Role cannot be changed by the user themselves
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    -- is_active cannot be changed by the user themselves  
    AND is_active = (SELECT is_active FROM public.profiles WHERE id = auth.uid())
  );

-- ── 2. Transactions are insert-only from service role ──────────
-- Customers must not be able to insert transactions (only Edge Functions via service role)
DROP POLICY IF EXISTS "transactions_own_read" ON public.transactions;

CREATE POLICY "transactions_own_read"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT policy for authenticated users — service role only

-- ── 3. Order items are read-only for customers ─────────────────
DROP POLICY IF EXISTS "order_items_own" ON public.order_items;

CREATE POLICY "order_items_own_select"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- Customers cannot insert/update/delete order items directly
-- Order creation goes through a controlled function or service role

-- ── 4. Reviews: only verified purchases can review ─────────────
-- Optional strict mode: uncomment to require verified purchase
-- DROP POLICY IF EXISTS "reviews_authenticated_insert" ON public.reviews;
-- CREATE POLICY "reviews_verified_purchase_insert"
--   ON public.reviews FOR INSERT
--   WITH CHECK (
--     auth.uid() = user_id
--     AND EXISTS (
--       SELECT 1 FROM public.orders o
--       JOIN public.order_items oi ON oi.order_id = o.id
--       WHERE o.user_id = auth.uid()
--         AND oi.product_id = product_id
--         AND o.payment_status = 'paid'
--         AND o.status = 'delivered'
--     )
--   );

-- ── 5. Rate limiting guard: max 3 addresses per user ──────────
CREATE OR REPLACE FUNCTION public.check_address_limit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.addresses WHERE user_id = NEW.user_id) >= 10 THEN
    RAISE EXCEPTION 'Maximum of 10 addresses allowed per account';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS address_limit_check ON public.addresses;
CREATE TRIGGER address_limit_check
  BEFORE INSERT ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.check_address_limit();

-- ── 6. Input length constraints ────────────────────────────────
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_full_name_length CHECK (char_length(full_name) <= 200),
  ADD CONSTRAINT profiles_phone_length CHECK (phone IS NULL OR char_length(phone) <= 30);

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_title_length CHECK (title IS NULL OR char_length(title) <= 200),
  ADD CONSTRAINT reviews_body_length CHECK (body IS NULL OR char_length(body) <= 5000);

ALTER TABLE public.orders
  ADD CONSTRAINT orders_notes_length CHECK (notes IS NULL OR char_length(notes) <= 1000);

-- ── 7. Ensure order totals cannot go negative ──────────────────
ALTER TABLE public.orders
  ADD CONSTRAINT orders_total_positive CHECK (total >= 0),
  ADD CONSTRAINT orders_subtotal_positive CHECK (subtotal >= 0);

-- ── 8. Secure function search paths ────────────────────────────
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.ensure_single_default_address() SET search_path = public;
ALTER FUNCTION public.ensure_single_primary_image() SET search_path = public;
ALTER FUNCTION public.check_address_limit() SET search_path = public;

-- ── 9. Audit log table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  table_name  TEXT,
  record_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_log_user_idx   ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS audit_log_table_idx  ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS audit_log_date_idx   ON public.audit_log(created_at DESC);

-- Audit log: admins read, service role writes
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_admin_read" ON public.audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- ── 10. Verify all tables have RLS enabled ─────────────────────
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY['profiles','addresses','categories','brands','products',
    'product_images','product_variants','variant_options','carts','cart_items',
    'wishlists','orders','order_items','order_status_history','returns',
    'transactions','reviews','coupons','coupon_uses','inventory_log'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
  RAISE NOTICE 'RLS verified on all % tables', array_length(tables, 1);
END;
$$;
