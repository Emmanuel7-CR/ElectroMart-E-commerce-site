-- ═══════════════════════════════════════════════════════════════
-- Migration 006: Utility Functions & Additional Indexes
-- ═══════════════════════════════════════════════════════════════

-- Decrement stock on purchase (called after payment verified)
CREATE OR REPLACE FUNCTION public.decrement_stock(p_variant_id UUID, p_quantity INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.product_variants
  SET stock_qty = GREATEST(0, stock_qty - p_quantity)
  WHERE id = p_variant_id;

  -- Log the inventory change
  INSERT INTO public.inventory_log (variant_id, type, quantity, note)
  VALUES (p_variant_id, 'sale', -p_quantity, 'Sale deduction');
END;
$$;

-- Increment stock on return
CREATE OR REPLACE FUNCTION public.increment_stock(p_variant_id UUID, p_quantity INTEGER, p_note TEXT DEFAULT 'Return restock')
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.product_variants
  SET stock_qty = stock_qty + p_quantity
  WHERE id = p_variant_id;

  INSERT INTO public.inventory_log (variant_id, type, quantity, note)
  VALUES (p_variant_id, 'return', p_quantity, p_note);
END;
$$;

-- Get low-stock variants
CREATE OR REPLACE VIEW public.low_stock_variants AS
  SELECT
    pv.id,
    pv.name AS variant_name,
    pv.sku,
    pv.stock_qty,
    pv.low_stock_threshold,
    p.id AS product_id,
    p.name AS product_name,
    p.slug AS product_slug
  FROM public.product_variants pv
  JOIN public.products p ON p.id = pv.product_id
  WHERE pv.is_active = TRUE
    AND p.status = 'active'
    AND pv.stock_qty <= pv.low_stock_threshold
  ORDER BY pv.stock_qty ASC;

-- Revenue analytics view
CREATE OR REPLACE VIEW public.daily_revenue AS
  SELECT
    DATE_TRUNC('day', created_at) AS day,
    COUNT(*)                       AS order_count,
    SUM(total)                     AS revenue,
    AVG(total)                     AS avg_order_value
  FROM public.orders
  WHERE payment_status = 'paid'
    AND status NOT IN ('cancelled', 'refunded')
  GROUP BY DATE_TRUNC('day', created_at)
  ORDER BY day DESC;

-- Additional performance indexes
CREATE INDEX IF NOT EXISTS orders_total_idx         ON public.orders(total);
CREATE INDEX IF NOT EXISTS products_price_idx       ON public.products(price);
CREATE INDEX IF NOT EXISTS products_created_at_idx  ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_rating_idx       ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS transactions_paid_at_idx ON public.transactions(paid_at);
