-- ============================================================
-- 002_rls_policies.sql
-- Run this second in Supabase SQL Editor
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ── profiles ──────────────────────────────────────────────────────────────────
-- Users can read and update their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── restaurants ───────────────────────────────────────────────────────────────
-- Anyone (including anonymous) can read active restaurants
CREATE POLICY "restaurants_select_public" ON public.restaurants
  FOR SELECT USING (is_active = true);

-- Only admins can insert/update/delete
CREATE POLICY "restaurants_all_admin" ON public.restaurants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── menu_items ────────────────────────────────────────────────────────────────
-- Anyone can read available menu items
CREATE POLICY "menu_items_select_public" ON public.menu_items
  FOR SELECT USING (is_available = true);

-- Only admins can insert/update/delete
CREATE POLICY "menu_items_all_admin" ON public.menu_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── addresses ─────────────────────────────────────────────────────────────────
-- Users manage only their own addresses
CREATE POLICY "addresses_own" ON public.addresses
  FOR ALL USING (auth.uid() = user_id);

-- ── orders ────────────────────────────────────────────────────────────────────
-- Users see their own orders
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can see and update all orders
CREATE POLICY "orders_all_admin" ON public.orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── order_items ───────────────────────────────────────────────────────────────
-- Users see items from their own orders
CREATE POLICY "order_items_select_own" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
  );

-- Users can insert items when creating an order
CREATE POLICY "order_items_insert_own" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
  );

-- Admins can manage all order items
CREATE POLICY "order_items_all_admin" ON public.order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
