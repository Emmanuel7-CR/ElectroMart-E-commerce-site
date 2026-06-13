-- ═══════════════════════════════════════════════════════════════
-- Migration 005: Storage Buckets & Seed Data
-- ═══════════════════════════════════════════════════════════════

-- ── Storage Buckets ───────────────────────────────────────────
-- Run in Supabase Dashboard → Storage or via management API

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('products',    'products',    TRUE,  5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('avatars',     'avatars',     TRUE,  2097152, ARRAY['image/jpeg','image/png','image/webp']),
  ('brands',      'brands',      TRUE,  2097152, ARRAY['image/jpeg','image/png','image/webp','image/svg+xml']),
  ('categories',  'categories',  TRUE,  2097152, ARRAY['image/jpeg','image/png','image/webp']),
  ('invoices',    'invoices',    FALSE, 5242880, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies: authenticated users can upload to products/avatars/brands/categories
-- Public read on public buckets
-- Invoices: service role only

-- Allow authenticated uploads to product images (admins only enforced at app level)
CREATE POLICY "products_storage_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

CREATE POLICY "products_storage_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'products' AND auth.uid() IS NOT NULL
  );

CREATE POLICY "products_storage_auth_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'products' AND auth.uid() IS NOT NULL);

-- Avatars: each user can only manage their own folder
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_own_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_own_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Brands & categories: public read, admin write
CREATE POLICY "brands_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'brands');
CREATE POLICY "brands_auth_write"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'brands' AND auth.uid() IS NOT NULL);

CREATE POLICY "categories_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'categories');
CREATE POLICY "categories_auth_write"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'categories' AND auth.uid() IS NOT NULL);

-- Invoices: private - service role only (no client policies needed)


-- ═══════════════════════════════════════════════════════════════
-- SEED DATA (development only)
-- ═══════════════════════════════════════════════════════════════

-- Sample categories
INSERT INTO public.categories (name, slug, description, sort_order, is_active) VALUES
  ('Electronics',   'electronics',    'Gadgets, devices and tech',            1, TRUE),
  ('Fashion',       'fashion',        'Clothing, shoes and accessories',       2, TRUE),
  ('Home & Living', 'home-living',    'Furniture, decor and kitchen',          3, TRUE),
  ('Sports',        'sports',         'Equipment and activewear',              4, TRUE),
  ('Beauty',        'beauty',         'Skincare, makeup and wellness',         5, TRUE),
  ('Books',         'books',          'Fiction, non-fiction and educational',  6, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Sample brands
INSERT INTO public.brands (name, slug, description, is_active) VALUES
  ('Nike',    'nike',    'Just Do It',                         TRUE),
  ('Apple',   'apple',   'Think Different',                    TRUE),
  ('Samsung', 'samsung', 'Inspire the World, Create the Future', TRUE),
  ('Adidas',  'adidas',  'Impossible is Nothing',              TRUE),
  ('Sony',    'sony',    'Make Believe',                       TRUE),
  ('LG',      'lg',      'Life is Good',                       TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Sample coupon for testing
INSERT INTO public.coupons (code, description, type, value, min_order_amount, max_uses, is_active) VALUES
  ('WELCOME10', 'Welcome 10% off first order', 'percentage', 10, 0, NULL, TRUE),
  ('SAVE5000',  'Save ₦5000 on orders above ₦50000', 'fixed', 5000, 50000, 100, TRUE),
  ('FREESHIP',  'Free shipping on your order', 'free_shipping', 0, 0, NULL, TRUE)
ON CONFLICT (code) DO NOTHING;
