-- ═══════════════════════════════════════════════════════════════
-- Migration 004: Reviews, Coupons & Inventory
-- ═══════════════════════════════════════════════════════════════

-- ── Reviews ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id      UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title         TEXT,
  body          TEXT,
  is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','rejected')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS reviews_product_idx ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS reviews_user_idx    ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS reviews_status_idx  ON public.reviews(status);

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Materialized avg rating view per product (refresh on review change)
CREATE OR REPLACE VIEW public.product_ratings AS
  SELECT
    product_id,
    COUNT(*)                                        AS review_count,
    ROUND(AVG(rating)::numeric, 1)                 AS avg_rating,
    COUNT(*) FILTER (WHERE rating = 5)             AS five_star,
    COUNT(*) FILTER (WHERE rating = 4)             AS four_star,
    COUNT(*) FILTER (WHERE rating = 3)             AS three_star,
    COUNT(*) FILTER (WHERE rating = 2)             AS two_star,
    COUNT(*) FILTER (WHERE rating = 1)             AS one_star
  FROM public.reviews
  WHERE status = 'approved'
  GROUP BY product_id;


-- ── Coupons ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coupons (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code              TEXT NOT NULL UNIQUE,
  description       TEXT,
  type              TEXT NOT NULL CHECK (type IN ('percentage','fixed','free_shipping')),
  value             NUMERIC(10,2) NOT NULL CHECK (value > 0),
  min_order_amount  NUMERIC(12,2) NOT NULL DEFAULT 0,
  max_uses          INTEGER,
  used_count        INTEGER NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at         TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT coupons_percentage_max CHECK (type != 'percentage' OR value <= 100)
);

CREATE INDEX IF NOT EXISTS coupons_code_idx    ON public.coupons(code);
CREATE INDEX IF NOT EXISTS coupons_active_idx  ON public.coupons(is_active);

CREATE TRIGGER coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── Coupon Uses ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coupon_uses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id     UUID NOT NULL REFERENCES public.coupons(id),
  user_id       UUID NOT NULL REFERENCES public.profiles(id),
  order_id      UUID REFERENCES public.orders(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (coupon_id, user_id)
);

CREATE INDEX IF NOT EXISTS coupon_uses_coupon_idx ON public.coupon_uses(coupon_id);
CREATE INDEX IF NOT EXISTS coupon_uses_user_idx   ON public.coupon_uses(user_id);


-- ── Inventory Log ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.inventory_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id    UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  type          TEXT NOT NULL
                  CHECK (type IN ('purchase','sale','return','adjustment','restock')),
  quantity      INTEGER NOT NULL,
  note          TEXT,
  reference_id  UUID,
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS inventory_log_variant_idx ON public.inventory_log(variant_id);
CREATE INDEX IF NOT EXISTS inventory_log_type_idx    ON public.inventory_log(type);
CREATE INDEX IF NOT EXISTS inventory_log_date_idx    ON public.inventory_log(created_at DESC);


-- ════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════

-- Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')
  ));

CREATE POLICY "reviews_authenticated_insert" ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "reviews_own_update" ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_admin_all" ON public.reviews FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')));

-- Coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coupons_authenticated_read" ON public.coupons FOR SELECT
  USING (auth.uid() IS NOT NULL AND (is_active = TRUE OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')
  )));

CREATE POLICY "coupons_admin_write" ON public.coupons FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')));

-- Coupon uses
ALTER TABLE public.coupon_uses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coupon_uses_own" ON public.coupon_uses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "coupon_uses_admin" ON public.coupon_uses FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin'))
);

-- Inventory log: admin write, no customer access
ALTER TABLE public.inventory_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inventory_log_admin_all" ON public.inventory_log FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')));
