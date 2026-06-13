-- ═══════════════════════════════════════════════════════════════
-- Migration 003: Cart, Wishlist & Orders
-- ═══════════════════════════════════════════════════════════════

-- ── Carts ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.carts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT carts_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS carts_user_idx    ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS carts_session_idx ON public.carts(session_id);

CREATE TRIGGER carts_updated_at
  BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── Cart Items ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cart_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id       UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id    UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity      INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price    NUMERIC(12,2) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cart_id, product_id, variant_id)
);

CREATE INDEX IF NOT EXISTS cart_items_cart_idx ON public.cart_items(cart_id);


-- ── Wishlists ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wishlists (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS wishlists_user_idx    ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS wishlists_product_idx ON public.wishlists(product_id);


-- ── Orders ────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

CREATE TABLE IF NOT EXISTS public.orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number      TEXT NOT NULL UNIQUE DEFAULT ('ORD-' || to_char(NOW(), 'YYYY') || '-' || lpad(nextval('order_number_seq')::text, 5, '0')),
  user_id           UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  payment_status    TEXT NOT NULL DEFAULT 'unpaid'
                      CHECK (payment_status IN ('unpaid','paid','partial','refunded','failed')),
  subtotal          NUMERIC(12,2) NOT NULL,
  discount_amount   NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_amount   NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  total             NUMERIC(12,2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'NGN',
  coupon_code       TEXT,
  notes             TEXT,
  shipping_address  JSONB NOT NULL,
  billing_address   JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_user_idx           ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx         ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_payment_status_idx ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx     ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_number_idx         ON public.orders(order_number);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── Order Items ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id      UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name    TEXT NOT NULL,
  variant_name    TEXT,
  sku             TEXT,
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  unit_price      NUMERIC(12,2) NOT NULL,
  total_price     NUMERIC(12,2) NOT NULL,
  image_url       TEXT
);

CREATE INDEX IF NOT EXISTS order_items_order_idx ON public.order_items(order_id);


-- ── Order Status History ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status        TEXT NOT NULL,
  note          TEXT,
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS order_history_order_idx ON public.order_status_history(order_id);


-- ── Returns ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.returns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES public.orders(id),
  user_id         UUID NOT NULL REFERENCES public.profiles(id),
  reason          TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'requested'
                    CHECK (status IN ('requested','approved','rejected','completed')),
  refund_amount   NUMERIC(12,2),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER returns_updated_at
  BEFORE UPDATE ON public.returns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── Transactions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  user_id           UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reference         TEXT NOT NULL UNIQUE,
  amount            NUMERIC(12,2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'NGN',
  status            TEXT NOT NULL
                      CHECK (status IN ('pending','success','failed','abandoned','reversed')),
  gateway           TEXT NOT NULL DEFAULT 'paystack',
  gateway_response  JSONB,
  paid_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS transactions_order_idx     ON public.transactions(order_id);
CREATE INDEX IF NOT EXISTS transactions_ref_idx       ON public.transactions(reference);
CREATE INDEX IF NOT EXISTS transactions_status_idx    ON public.transactions(status);
CREATE INDEX IF NOT EXISTS transactions_user_idx      ON public.transactions(user_id);


-- ════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════

-- Carts: users own their cart
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "carts_own" ON public.carts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "carts_admin" ON public.carts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin'))
);

-- Cart items: via cart ownership
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cart_items_own" ON public.cart_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND c.user_id = auth.uid())
);

-- Wishlists
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wishlists_own" ON public.wishlists FOR ALL USING (auth.uid() = user_id);

-- Orders: customers see own, admins see all
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_own_read"   ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_own_insert" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_admin_all"  ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin'))
);

-- Order items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_own" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);
CREATE POLICY "order_items_admin" ON public.order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin'))
);

-- Order history
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_history_own" ON public.order_status_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);
CREATE POLICY "order_history_admin" ON public.order_status_history FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin'))
);

-- Returns
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "returns_own" ON public.returns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "returns_admin" ON public.returns FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin'))
);

-- Transactions: customers can read their own, no writes from client
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions_own_read" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions_admin_all" ON public.transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin'))
);
-- Service role handles all transaction writes (via Edge Functions)
