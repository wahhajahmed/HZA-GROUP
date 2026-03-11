-- =============================================
-- PATCH 13: Product Variants, Sizes & Cart Variant Support
-- Run in Supabase Dashboard → SQL Editor
-- This patch adds everything required for the colour/size
-- variant system across both hza-admin and hza-store.
-- =============================================


-- ─────────────────────────────────────────────
-- 1. Products: has_colors + has_sizes flags
-- ─────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'has_colors'
  ) THEN
    ALTER TABLE public.products ADD COLUMN has_colors BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'has_sizes'
  ) THEN
    ALTER TABLE public.products ADD COLUMN has_sizes BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;


-- ─────────────────────────────────────────────
-- 2. product_variants table
--    One row per colour variant per product.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_variants (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color_name  TEXT        NOT NULL,
  color_hex   TEXT        NOT NULL,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id
  ON public.product_variants(product_id);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Product variants are publicly readable" ON public.product_variants;
CREATE POLICY "Product variants are publicly readable"
  ON public.product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE id = product_id AND is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "Admins can manage product variants" ON public.product_variants;
CREATE POLICY "Admins can manage product variants"
  ON public.product_variants FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ─────────────────────────────────────────────
-- 3. variant_images table
--    Many images per colour variant.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.variant_images (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id  UUID        NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  image_url   TEXT        NOT NULL,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_variant_images_variant_id
  ON public.variant_images(variant_id);

ALTER TABLE public.variant_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Variant images are publicly readable" ON public.variant_images;
CREATE POLICY "Variant images are publicly readable"
  ON public.variant_images FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage variant images" ON public.variant_images;
CREATE POLICY "Admins can manage variant images"
  ON public.variant_images FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ─────────────────────────────────────────────
-- 4. product_sizes table
--    Available sizes per product (when has_sizes = true).
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_sizes (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID    NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size        TEXT    NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id
  ON public.product_sizes(product_id);

ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Product sizes are publicly readable" ON public.product_sizes;
CREATE POLICY "Product sizes are publicly readable"
  ON public.product_sizes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage product sizes" ON public.product_sizes;
CREATE POLICY "Admins can manage product sizes"
  ON public.product_sizes FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ─────────────────────────────────────────────
-- 5. cart_items: add variant columns + fix unique constraint
-- ─────────────────────────────────────────────

-- Add selected_color / selected_size / selected_image columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'selected_color'
  ) THEN
    ALTER TABLE public.cart_items ADD COLUMN selected_color TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'selected_size'
  ) THEN
    ALTER TABLE public.cart_items ADD COLUMN selected_size TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'selected_image'
  ) THEN
    ALTER TABLE public.cart_items ADD COLUMN selected_image TEXT;
  END IF;
END $$;

-- Drop the old UNIQUE(user_id, product_id) constraint that breaks variant carts.
-- PostgreSQL names auto-generated unique constraints as <table>_<col1>_<col2>_key.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cart_items_user_id_product_id_key'
      AND conrelid = 'public.cart_items'::regclass
  ) THEN
    ALTER TABLE public.cart_items DROP CONSTRAINT cart_items_user_id_product_id_key;
  END IF;
END $$;

-- New unique index that supports NULL colours/sizes via COALESCE.
-- Ensures a user cannot have two identical variant combinations for the same product.
DROP INDEX IF EXISTS public.uq_cart_items_variant;
CREATE UNIQUE INDEX uq_cart_items_variant
  ON public.cart_items (
    user_id,
    product_id,
    COALESCE(selected_color, ''),
    COALESCE(selected_size,  '')
  );


-- ─────────────────────────────────────────────
-- 6. order_items: add selected_color + selected_size
-- ─────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'selected_color'
  ) THEN
    ALTER TABLE public.order_items ADD COLUMN selected_color TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'selected_size'
  ) THEN
    ALTER TABLE public.order_items ADD COLUMN selected_size TEXT;
  END IF;
END $$;


-- ─────────────────────────────────────────────
-- 7. support_queries: add is_read flag
--    Used by markAllQueriesRead() in query.service.ts
-- ─────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_queries' AND column_name = 'is_read'
  ) THEN
    ALTER TABLE public.support_queries
      ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;

-- Mark all existing queries as read so the counter starts clean
UPDATE public.support_queries SET is_read = TRUE WHERE is_read = FALSE;


-- ─────────────────────────────────────────────
-- 8. Storage bucket: product-images
--    Used for both plain product images AND variant images.
--    Skip if already created in the Supabase dashboard.
-- ─────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
DROP POLICY IF EXISTS "Public read product-images"    ON storage.objects;
DROP POLICY IF EXISTS "Admin upload product-images"   ON storage.objects;
DROP POLICY IF EXISTS "Admin delete product-images"   ON storage.objects;

CREATE POLICY "Public read product-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admin upload product-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admin update product-images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admin delete product-images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.is_admin());


-- ─────────────────────────────────────────────
-- 9. Performance indexes
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id_product_id
  ON public.cart_items(user_id, product_id);

CREATE INDEX IF NOT EXISTS idx_order_items_selected_color
  ON public.order_items(selected_color)
  WHERE selected_color IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_has_colors
  ON public.products(has_colors)
  WHERE has_colors = TRUE;

CREATE INDEX IF NOT EXISTS idx_products_has_sizes
  ON public.products(has_sizes)
  WHERE has_sizes = TRUE;


-- ─────────────────────────────────────────────
-- 10. Verify (run to confirm everything is present)
-- ─────────────────────────────────────────────
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'products'         ORDER BY ordinal_position;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'cart_items'       ORDER BY ordinal_position;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'order_items'      ORDER BY ordinal_position;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'support_queries'  ORDER BY ordinal_position;
-- SELECT table_name  FROM information_schema.tables  WHERE table_schema = 'public' AND table_name IN ('product_variants','variant_images','product_sizes');
