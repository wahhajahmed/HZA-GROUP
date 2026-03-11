-- =============================================
-- PATCH 13: Product Variants (Color + Size) System
-- Run in Supabase Dashboard → SQL Editor
-- =============================================

-- ─────────────────────────────────────────────
-- 1. Add variant/size flags to products table
-- ─────────────────────────────────────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS has_colors BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_sizes  BOOLEAN NOT NULL DEFAULT FALSE;

-- ─────────────────────────────────────────────
-- 2. product_variants table
--    One row per color variant per product.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_variants (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color_name  TEXT NOT NULL,
  color_hex   TEXT NOT NULL DEFAULT '#000000',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product variants are publicly readable"
  ON public.product_variants FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND is_active = TRUE)
  );

CREATE POLICY "Admins can manage product variants"
  ON public.product_variants FOR ALL USING (
    public.is_admin()
  );

CREATE INDEX IF NOT EXISTS ix_product_variants_product_id
  ON public.product_variants (product_id);

-- ─────────────────────────────────────────────
-- 3. variant_images table
--    Images that belong to a specific color variant.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.variant_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id  UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.variant_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Variant images are publicly readable"
  ON public.variant_images FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.product_variants pv
      JOIN public.products p ON p.id = pv.product_id
      WHERE pv.id = variant_id AND p.is_active = TRUE
    )
  );

CREATE POLICY "Admins can manage variant images"
  ON public.variant_images FOR ALL USING (
    public.is_admin()
  );

CREATE INDEX IF NOT EXISTS ix_variant_images_variant_id
  ON public.variant_images (variant_id);

-- ─────────────────────────────────────────────
-- 4. product_sizes table
--    Available sizes for a product.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_sizes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size        TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  UNIQUE (product_id, size)
);

ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product sizes are publicly readable"
  ON public.product_sizes FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND is_active = TRUE)
  );

CREATE POLICY "Admins can manage product sizes"
  ON public.product_sizes FOR ALL USING (
    public.is_admin()
  );

CREATE INDEX IF NOT EXISTS ix_product_sizes_product_id
  ON public.product_sizes (product_id);

-- ─────────────────────────────────────────────
-- 5. Add selected_color / selected_size to order_items
-- ─────────────────────────────────────────────
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS selected_color TEXT,
  ADD COLUMN IF NOT EXISTS selected_size  TEXT;

-- ─────────────────────────────────────────────
-- 6. Add selected_color / selected_size / selected_image to cart_items
--    And replace the simple UNIQUE(user_id, product_id) constraint
--    with a variant-aware expression index so the same product can
--    be added with different color/size combinations.
-- ─────────────────────────────────────────────
ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS selected_color TEXT,
  ADD COLUMN IF NOT EXISTS selected_size  TEXT,
  ADD COLUMN IF NOT EXISTS selected_image TEXT;

-- Drop the old simple unique constraint (may be named differently, so try both)
DO $$
BEGIN
  -- Try the default name first
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cart_items_user_id_product_id_key'
      AND conrelid = 'public.cart_items'::regclass
  ) THEN
    ALTER TABLE public.cart_items
      DROP CONSTRAINT cart_items_user_id_product_id_key;
  END IF;
END;
$$;

-- Create the new variant-aware unique index
-- COALESCE ensures NULLs are treated as '__none__' so (Red, NULL) ≠ (Red, M)
CREATE UNIQUE INDEX IF NOT EXISTS uix_cart_items_variant
  ON public.cart_items (
    user_id,
    product_id,
    COALESCE(selected_color, '__none__'),
    COALESCE(selected_size,  '__none__')
  );

-- ─────────────────────────────────────────────
-- 7. Grant Realtime access on new tables (optional but recommended)
-- ─────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_variants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.variant_images;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_sizes;
