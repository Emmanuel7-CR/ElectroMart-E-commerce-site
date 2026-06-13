-- ═══════════════════════════════════════════════════════════════
-- Migration 002: Products Catalog
-- ═══════════════════════════════════════════════════════════════

-- ── Categories ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  image_url     TEXT,
  parent_id     UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  meta_title        TEXT,
  meta_description  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS categories_slug_idx   ON public.categories(slug);
CREATE INDEX IF NOT EXISTS categories_parent_idx ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS categories_active_idx ON public.categories(is_active);

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── Brands ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.brands (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  logo_url      TEXT,
  website_url   TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS brands_slug_idx   ON public.brands(slug);
CREATE INDEX IF NOT EXISTS brands_active_idx ON public.brands(is_active);

CREATE TRIGGER brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── Products ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  description       TEXT,
  sku               TEXT UNIQUE,
  brand_id          UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  category_id       UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  price             NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  compare_price     NUMERIC(12,2) CHECK (compare_price IS NULL OR compare_price >= 0),
  cost_price        NUMERIC(12,2) CHECK (cost_price IS NULL OR cost_price >= 0),
  is_taxable        BOOLEAN NOT NULL DEFAULT TRUE,
  tax_rate          NUMERIC(5,2) NOT NULL DEFAULT 0,
  weight            NUMERIC(8,2),
  status            TEXT NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft', 'active', 'archived')),
  is_featured       BOOLEAN NOT NULL DEFAULT FALSE,
  tags              TEXT[] NOT NULL DEFAULT '{}',
  meta_title        TEXT,
  meta_description  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS products_slug_idx        ON public.products(slug);
CREATE INDEX IF NOT EXISTS products_status_idx      ON public.products(status);
CREATE INDEX IF NOT EXISTS products_category_idx    ON public.products(category_id);
CREATE INDEX IF NOT EXISTS products_brand_idx       ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS products_featured_idx    ON public.products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS products_tags_idx        ON public.products USING GIN(tags);
-- Full-text search index
CREATE INDEX IF NOT EXISTS products_fts_idx
  ON public.products
  USING GIN(to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,'')));

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── Product Images ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  alt_text      TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS product_images_product_idx ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS product_images_primary_idx ON public.product_images(product_id) WHERE is_primary = TRUE;

-- Ensure only one primary image per product
CREATE OR REPLACE FUNCTION public.ensure_single_primary_image()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_primary = TRUE THEN
    UPDATE public.product_images
    SET is_primary = FALSE
    WHERE product_id = NEW.product_id
      AND id <> NEW.id
      AND is_primary = TRUE;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER single_primary_image
  BEFORE INSERT OR UPDATE ON public.product_images
  FOR EACH ROW EXECUTE FUNCTION public.ensure_single_primary_image();


-- ── Variant Options (e.g. Color, Size) ───────────────────────
CREATE TABLE IF NOT EXISTS public.variant_options (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  values        TEXT[] NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS variant_options_product_idx ON public.variant_options(product_id);


-- ── Product Variants ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_variants (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id            UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  sku                   TEXT UNIQUE,
  price                 NUMERIC(12,2) CHECK (price IS NULL OR price >= 0),
  compare_price         NUMERIC(12,2) CHECK (compare_price IS NULL OR compare_price >= 0),
  stock_qty             INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold   INTEGER NOT NULL DEFAULT 5,
  weight                NUMERIC(8,2),
  image_url             TEXT,
  options               JSONB NOT NULL DEFAULT '{}',
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS variants_product_idx   ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS variants_sku_idx       ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS variants_stock_idx     ON public.product_variants(stock_qty);
CREATE INDEX IF NOT EXISTS variants_active_idx    ON public.product_variants(is_active);

CREATE TRIGGER variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════

-- Categories: public read, admin write
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_read"
  ON public.categories FOR SELECT
  USING (is_active = TRUE OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')
  ));

CREATE POLICY "categories_admin_write"
  ON public.categories FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')));

-- Brands: public read, admin write
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brands_public_read"
  ON public.brands FOR SELECT
  USING (is_active = TRUE OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')
  ));

CREATE POLICY "brands_admin_write"
  ON public.brands FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')));

-- Products: active products public, admin sees all
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_public_read"
  ON public.products FOR SELECT
  USING (status = 'active' OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')
  ));

CREATE POLICY "products_admin_write"
  ON public.products FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')));

-- Product images: inherit product visibility
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_images_public_read" ON public.product_images FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.products pr WHERE pr.id = product_id AND (pr.status = 'active' OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')
  )))
);
CREATE POLICY "product_images_admin_write" ON public.product_images FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')));

-- Variant options: same as products
ALTER TABLE public.variant_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "variant_options_public_read" ON public.variant_options FOR SELECT USING (TRUE);
CREATE POLICY "variant_options_admin_write" ON public.variant_options FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')));

-- Product variants
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "variants_public_read"
  ON public.product_variants FOR SELECT
  USING (is_active = TRUE OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')
  ));

CREATE POLICY "variants_admin_write"
  ON public.product_variants FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')));
