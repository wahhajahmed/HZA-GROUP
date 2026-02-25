-- =============================================
-- HZA STORE - SUPABASE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE (extends auth.users)
-- =============================================
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT,
  is_admin      BOOLEAN NOT NULL DEFAULT FALSE,
  is_blocked    BOOLEAN NOT NULL DEFAULT FALSE,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable"
  ON public.categories FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE public.products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  price           DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  discount_price  DECIMAL(10,2) CHECK (discount_price >= 0),
  stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku             TEXT UNIQUE,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  category_id     UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  images          TEXT[] NOT NULL DEFAULT '{}',
  meta_title      TEXT,
  meta_description TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active products are publicly readable"
  ON public.products FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- =============================================
-- DELIVERY CHARGES TABLE
-- =============================================
CREATE TABLE public.delivery_charges (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city                TEXT NOT NULL,
  charge              DECIMAL(10,2) NOT NULL DEFAULT 0,
  free_delivery_above DECIMAL(10,2),
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.delivery_charges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Delivery charges are publicly readable"
  ON public.delivery_charges FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage delivery charges"
  ON public.delivery_charges FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- =============================================
-- CART ITEMS TABLE
-- =============================================
CREATE TABLE public.cart_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cart"
  ON public.cart_items FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TYPE order_status AS ENUM (
  'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'
);

CREATE TABLE public.orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number     TEXT NOT NULL UNIQUE,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status           order_status NOT NULL DEFAULT 'pending',
  customer_name    TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  customer_email   TEXT NOT NULL,
  address          TEXT NOT NULL,
  city             TEXT NOT NULL,
  notes            TEXT,
  subtotal         DECIMAL(10,2) NOT NULL,
  delivery_charge  DECIMAL(10,2) NOT NULL DEFAULT 0,
  total            DECIMAL(10,2) NOT NULL,
  tracking_number  TEXT,
  payment_method   TEXT NOT NULL DEFAULT 'cash_on_delivery',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders"
  ON public.orders FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- =============================================
-- ORDER ITEMS TABLE
-- =============================================
CREATE TABLE public.order_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name    TEXT NOT NULL,
  product_image   TEXT,
  price           DECIMAL(10,2) NOT NULL,
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  subtotal        DECIMAL(10,2) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items of own orders"
  ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert order items"
  ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all order items"
  ON public.order_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delivery_charges_updated_at BEFORE UPDATE ON public.delivery_charges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Generate order number function
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
  order_num TEXT;
  exists_flag BOOLEAN;
BEGIN
  LOOP
    order_num := 'HZA-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                 LPAD(FLOOR(RANDOM() * 9999 + 1)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM public.orders WHERE order_number = order_num) INTO exists_flag;
    EXIT WHEN NOT exists_flag;
  END LOOP;
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- STORAGE BUCKETS (run after creating buckets in Supabase dashboard)
-- =============================================
-- Create buckets: products, categories, avatars
-- Set them as public

-- RLS for storage
-- INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('categories', 'categories', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_is_featured ON public.products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

-- =============================================
-- SEED DATA (sample delivery cities)
-- =============================================
INSERT INTO public.delivery_charges (city, charge, free_delivery_above) VALUES
  ('Karachi', 150, 2000),
  ('Lahore', 200, 2500),
  ('Islamabad', 200, 2500),
  ('Rawalpindi', 200, 2500),
  ('Faisalabad', 200, 2500),
  ('Multan', 250, 3000),
  ('Peshawar', 250, 3000),
  ('Quetta', 300, 3500),
  ('Hyderabad', 200, 2500),
  ('Sialkot', 200, 2500);
