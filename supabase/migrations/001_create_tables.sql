-- ============================================================
-- 001_create_tables.sql
-- Run this first in Supabase SQL Editor
-- ============================================================

-- ── profiles (extends auth.users) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  avatar_url  text,
  phone       text,
  role        text NOT NULL DEFAULT 'customer'
                CHECK (role IN ('customer','admin')),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- ── restaurants ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.restaurants (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  slug              text NOT NULL UNIQUE,
  description       text,
  logo_url          text,
  cover_url         text,
  category          text NOT NULL,
  rating            numeric(3,1) DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5),
  delivery_time_min integer DEFAULT 25,
  delivery_fee      numeric(8,2) DEFAULT 2.99,
  min_order         numeric(8,2) DEFAULT 0,
  is_active         boolean DEFAULT true,
  created_at        timestamptz DEFAULT now()
);

-- ── menu_items ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.menu_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name            text NOT NULL,
  description     text,
  price           numeric(8,2) NOT NULL CHECK (price >= 0),
  image_url       text,
  category        text NOT NULL,
  badge_type      text CHECK (badge_type IN ('new','popular','sale')),
  badge_label     text,
  rating          numeric(3,1) DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5),
  delivery_time   text DEFAULT '25',
  is_available    boolean DEFAULT true,
  sort_order      integer DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

-- ── addresses ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.addresses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label       text NOT NULL DEFAULT 'Home',
  street      text NOT NULL,
  city        text NOT NULL,
  zip         text,
  is_default  boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- ── orders ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id),
  status              text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','confirmed','preparing','on_the_way','delivered','cancelled')),
  subtotal            numeric(8,2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee        numeric(8,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  total               numeric(8,2) NOT NULL CHECK (total >= 0),
  address_snapshot    jsonb,
  notes               text,
  estimated_minutes   integer DEFAULT 30,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- ── order_items ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id    uuid REFERENCES public.menu_items(id) ON DELETE SET NULL,
  qty             integer NOT NULL CHECK (qty > 0),
  unit_price      numeric(8,2) NOT NULL CHECK (unit_price >= 0),
  item_name       text NOT NULL,
  item_image      text,
  created_at      timestamptz DEFAULT now()
);

-- ── indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON public.menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category   ON public.menu_items(category);
CREATE INDEX IF NOT EXISTS idx_addresses_user        ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user           ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status         ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order     ON public.order_items(order_id);

-- ── updated_at trigger function ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
