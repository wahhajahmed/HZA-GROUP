-- =============================================
-- PATCH 12: Product Images Table + Review product_id
-- Run in Supabase Dashboard → SQL Editor
-- =============================================

-- 1) product_images table  —  one-to-many relation with products
CREATE TABLE IF NOT EXISTS public.product_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id
  ON public.product_images(product_id);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Everyone can read images of active products
CREATE POLICY "Product images are publicly readable"
  ON public.product_images FOR SELECT
  USING (true);

-- Admins can manage product images
CREATE POLICY "Admins can manage product images"
  ON public.product_images FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2) Add product_id to reviews (nullable for backward-compat with seeded reviews)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'product_id'
  ) THEN
    ALTER TABLE public.reviews
      ADD COLUMN product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_reviews_product_id
  ON public.reviews(product_id);

-- 3) Unique constraint: one review per order (prevents duplicates)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_order_id_unique'
  ) THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT reviews_order_id_unique UNIQUE (order_id);
  END IF;
END
$$;
