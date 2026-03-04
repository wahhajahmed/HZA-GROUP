-- =============================================
-- HZA STORE — PRODUCTION PATCHES
-- Run these in Supabase Dashboard → SQL Editor
-- =============================================

-- ─────────────────────────────────────────────
-- PATCH 1: Add missing order statuses to DB enum
-- The TypeScript type includes 'processing' and 'refunded'
-- but the original schema did not. This adds them.
-- ─────────────────────────────────────────────
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'processing';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'refunded';


-- ─────────────────────────────────────────────
-- PATCH 2: Atomic stock decrement RPC (IMPROVED)
-- Used by order.service.ts when a customer places an order.
-- Prevents race conditions (two customers buying last item simultaneously).
-- Uses WHERE stock >= quantity to prevent negative stock.
-- Raises exception if insufficient stock.
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.decrement_stock(
  p_product_id UUID,
  p_quantity    INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_stock INTEGER;
BEGIN
  UPDATE public.products
  SET    stock = stock - p_quantity
  WHERE  id    = p_product_id
    AND  stock >= p_quantity
  RETURNING stock INTO new_stock;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INSUFFICIENT_STOCK: Product % has insufficient stock', p_product_id;
  END IF;

  RETURN new_stock;
END;
$$;

-- Batch stock validation + decrement in a single transaction
-- Accepts arrays of product IDs and quantities
CREATE OR REPLACE FUNCTION public.validate_and_decrement_stock(
  p_product_ids UUID[],
  p_quantities  INTEGER[]
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  i INTEGER;
  prod RECORD;
BEGIN
  IF array_length(p_product_ids, 1) != array_length(p_quantities, 1) THEN
    RAISE EXCEPTION 'Arrays must have same length';
  END IF;

  FOR i IN 1..array_length(p_product_ids, 1) LOOP
    -- Lock the row for update to prevent race conditions
    SELECT id, name, stock INTO prod
    FROM public.products
    WHERE id = p_product_ids[i]
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found: %', p_product_ids[i];
    END IF;

    IF prod.stock < p_quantities[i] THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK:You are trying to purchase "%", but only % units are available.',
        prod.name, prod.stock;
    END IF;

    UPDATE public.products
    SET stock = stock - p_quantities[i]
    WHERE id = p_product_ids[i];
  END LOOP;

  RETURN TRUE;
END;
$$;


-- ─────────────────────────────────────────────
-- PATCH 3: Fix recursive RLS on profiles table
--
-- The original admin policies do:
--   EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
-- from WITHIN a profiles policy — this is a self-referential subquery on the same
-- table being guarded, which can cause a recursion loop in PostgreSQL.
--
-- Fix: create a SECURITY DEFINER function that bypasses RLS for the admin check,
-- then rewrite all admin policies to use it.
-- ─────────────────────────────────────────────

-- Helper: returns TRUE if the calling user has is_admin = true (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1),
    FALSE
  );
$$;

-- Rewrite profiles admin policies to use the helper function
DROP POLICY IF EXISTS "Admins can view all profiles"   ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- Also add admin INSERT/DELETE on profiles (needed for admin user management)
DROP POLICY IF EXISTS "Admins can insert profiles"  ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles"  ON public.profiles;

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.is_admin());


-- Rewrite all other table admin policies to use the helper too
-- (removes recursive subqueries from every table)

-- Categories
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin());

-- Products
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (public.is_admin());

-- Delivery charges
DROP POLICY IF EXISTS "Admins can manage delivery charges" ON public.delivery_charges;
CREATE POLICY "Admins can manage delivery charges"
  ON public.delivery_charges FOR ALL
  USING (public.is_admin());

-- Orders
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders"
  ON public.orders FOR ALL
  USING (public.is_admin());

-- Order items
DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;
CREATE POLICY "Admins can manage all order items"
  ON public.order_items FOR ALL
  USING (public.is_admin());


-- ─────────────────────────────────────────────
-- PATCH 4: Enable Realtime on orders table
-- Required for AdminOrderAlert.tsx to receive live INSERT events.
-- ─────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;


-- ─────────────────────────────────────────────
-- PATCH 5: Storage buckets (if not already created)
-- Run only if you haven't created them in the Supabase dashboard yet.
-- ─────────────────────────────────────────────
-- INSERT INTO storage.buckets (id, name, public) VALUES ('products',   'products',   true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('categories', 'categories', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars',    'avatars',    true) ON CONFLICT DO NOTHING;

-- Storage RLS: allow authenticated admins to upload; public can read
-- CREATE POLICY "Admin upload products"   ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products'   AND public.is_admin());
-- CREATE POLICY "Admin upload categories" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'categories' AND public.is_admin());
-- CREATE POLICY "Admin delete products"   ON storage.objects FOR DELETE USING (bucket_id = 'products'   AND public.is_admin());
-- CREATE POLICY "Admin delete categories" ON storage.objects FOR DELETE USING (bucket_id = 'categories' AND public.is_admin());
-- CREATE POLICY "Public read products"    ON storage.objects FOR SELECT USING (bucket_id = 'products');
-- CREATE POLICY "Public read categories"  ON storage.objects FOR SELECT USING (bucket_id = 'categories');
-- CREATE POLICY "User manage avatar"      ON storage.objects FOR ALL   USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);


-- ─────────────────────────────────────────────
-- PATCH 6: support_queries table (Contact Form → Admin Dashboard)
-- Users submit contact form → stored here → admin reads/replies in hza-admin
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.support_queries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  subject     TEXT NOT NULL DEFAULT 'General Inquiry',
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'replied', 'closed')),
  admin_reply TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.support_queries ENABLE ROW LEVEL SECURITY;

-- Anyone (even unauthenticated) can submit a query
CREATE POLICY "Anyone can submit query"
  ON public.support_queries FOR INSERT
  WITH CHECK (true);

-- Users can view their own queries
CREATE POLICY "Users view own queries"
  ON public.support_queries FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins manage queries"
  ON public.support_queries FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_support_queries_updated_at ON public.support_queries;
CREATE TRIGGER set_support_queries_updated_at
  BEFORE UPDATE ON public.support_queries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────
-- PATCH 7: Area-wise Delivery Charge System
-- Replaces city-level delivery_charges with
-- city+area granularity and per-shipping-category charges.
-- Also adds shipping_category to products and area to orders.
-- ─────────────────────────────────────────────

-- 7a: Add shipping_category to products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='products' AND column_name='shipping_category'
  ) THEN
    ALTER TABLE public.products
      ADD COLUMN shipping_category TEXT NOT NULL DEFAULT 'small_parcel'
        CHECK (shipping_category IN ('small_parcel','medium_parcel','bulky_cargo'));
  END IF;
END
$$;

-- 7b: Create area_delivery_charges table
CREATE TABLE IF NOT EXISTS public.area_delivery_charges (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city                  TEXT NOT NULL,
  area                  TEXT NOT NULL,
  small_parcel_charge   DECIMAL(10,2) NOT NULL DEFAULT 0,
  medium_parcel_charge  DECIMAL(10,2) NOT NULL DEFAULT 0,
  bulky_cargo_charge    DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(city, area)
);

ALTER TABLE public.area_delivery_charges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Area charges are publicly readable"
  ON public.area_delivery_charges FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage area charges"
  ON public.area_delivery_charges FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Auto-update updated_at on area_delivery_charges
DROP TRIGGER IF EXISTS set_area_delivery_charges_updated_at ON public.area_delivery_charges;
CREATE TRIGGER set_area_delivery_charges_updated_at
  BEFORE UPDATE ON public.area_delivery_charges
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7c: Add area column to orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='orders' AND column_name='area'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN area TEXT;
  END IF;
END
$$;

-- ─────────────────────────────────────────────
-- PATCH 8: Default Shipping Category on Categories
-- Adds default_shipping_category to categories table
-- so admin can set the default DC tier per category.
-- ─────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='categories' AND column_name='default_shipping_category'
  ) THEN
    ALTER TABLE public.categories
      ADD COLUMN default_shipping_category TEXT NOT NULL DEFAULT 'small_parcel'
        CHECK (default_shipping_category IN ('small_parcel','medium_parcel','bulky_cargo'));
  END IF;
END
$$;

-- ─────────────────────────────────────────────
-- PATCH 9: Hierarchical Category System
-- Adds parent_id for multi-level nested categories.
-- ─────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='categories' AND column_name='parent_id'
  ) THEN
    ALTER TABLE public.categories
      ADD COLUMN parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- ─────────────────────────────────────────────
-- PATCH 10: Reviews system
-- Adds reviews table and reviewed column on orders.
-- ─────────────────────────────────────────────

-- Add reviewed flag to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS reviewed BOOLEAN DEFAULT false;

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  order_id      UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating        INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment       TEXT,
  reviewer_name TEXT NOT NULL,
  is_visible    BOOLEAN DEFAULT true,
  is_seeded     BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can read visible reviews"
  ON public.reviews FOR SELECT USING (is_visible = true);

CREATE POLICY IF NOT EXISTS "Users can insert own review"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY IF NOT EXISTS "Admins manage reviews"
  ON public.reviews FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Insert seed reviews (run once — idempotent via UNIQUE constraint or check)
INSERT INTO public.reviews (reviewer_name, rating, comment, is_seeded, is_visible)
SELECT * FROM (VALUES
  ('Ahmed Rana',          5, 'Quality was excellent and delivery was quicker than expected. Packaging was secure too.',                         true, true),
  ('Sana Khan',           4, 'Product exactly as shown. Delivery was on time, just the box was slightly damaged but item was fine.',           true, true),
  ('Bilal Mahmood Ansari',5, 'Very satisfied with packaging and customer support. Definitely ordering again.',                                  true, true),
  ('Ayesha Tariq',        3, 'Product is good overall. Delivery took a bit longer than expected but quality is decent.',                       true, true),
  ('Farhan Munawwar',     4, 'Good experience overall. Product quality is nice, just hope for faster delivery next time.',                     true, true),
  ('Wahaj Ahmed',         5, 'Impressed with the quality and finishing. Worth the price.',                                                     true, true),
  ('Muzammil Khaliq',     4, 'Everything was fine. Smooth checkout and reasonable delivery time.',                                             true, true)
) AS v(reviewer_name, rating, comment, is_seeded, is_visible)
WHERE NOT EXISTS (SELECT 1 FROM public.reviews WHERE is_seeded = true LIMIT 1);


-- ─────────────────────────────────────────────
-- PATCH 11: Promotions / Marketing Events table
-- Supports modal popup, slide-in banner, countdown,
-- confetti, audience targeting, show frequency.
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.promotions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT        NOT NULL,
  description      TEXT,
  image_url        TEXT,
  button_text      TEXT,
  redirect_url     TEXT,
  bg_color         TEXT        DEFAULT '#2563eb',
  start_datetime   TIMESTAMPTZ NOT NULL,
  end_datetime     TIMESTAMPTZ,
  is_active        BOOLEAN     DEFAULT true,
  display_mode     TEXT        DEFAULT 'popup'    CHECK (display_mode    IN ('popup','slide')),
  audience_type    TEXT        DEFAULT 'all'      CHECK (audience_type   IN ('all','logged_in','guest')),
  celebration_mode BOOLEAN     DEFAULT false,
  show_frequency   TEXT        DEFAULT 'session'  CHECK (show_frequency  IN ('session','daily','always')),
  created_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Everyone can read currently active promotions
DROP POLICY IF EXISTS "Public read active promotions" ON public.promotions;
CREATE POLICY "Public read active promotions"
  ON public.promotions FOR SELECT
  USING (
    is_active = true
    AND start_datetime <= now()
    AND (end_datetime IS NULL OR end_datetime > now())
  );

-- Admins have full access
DROP POLICY IF EXISTS "Admins manage promotions" ON public.promotions;
CREATE POLICY "Admins manage promotions"
  ON public.promotions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
