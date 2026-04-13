-- ============================================================
-- 006_rls_unified_policies.sql
-- Replace overlapping permissive policies with one policy
-- per action per table — eliminates all multiple_permissive_policies
-- auth.uid() wrapped in (select ...) to avoid per-row re-evaluation
-- ============================================================

-- ── profiles ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select_own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_all_admin"    ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (
    (select auth.uid()) = id
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (select auth.uid()) AND p.role = 'admin')
  );

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (
    (select auth.uid()) = id
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (select auth.uid()) AND p.role = 'admin')
  );

CREATE POLICY "profiles_delete_admin" ON public.profiles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (select auth.uid()) AND p.role = 'admin')
  );

-- ── restaurants ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "restaurants_select_public" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_write_admin"   ON public.restaurants;

CREATE POLICY "restaurants_select" ON public.restaurants
  FOR SELECT USING (is_active = true);

CREATE POLICY "restaurants_insert_admin" ON public.restaurants
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND role = 'admin')
  );

CREATE POLICY "restaurants_update_admin" ON public.restaurants
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND role = 'admin')
  );

CREATE POLICY "restaurants_delete_admin" ON public.restaurants
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND role = 'admin')
  );

-- ── menu_items ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "menu_items_select_public" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_write_admin"   ON public.menu_items;

CREATE POLICY "menu_items_select" ON public.menu_items
  FOR SELECT USING (is_available = true);

CREATE POLICY "menu_items_insert_admin" ON public.menu_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND role = 'admin')
  );

CREATE POLICY "menu_items_update_admin" ON public.menu_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND role = 'admin')
  );

CREATE POLICY "menu_items_delete_admin" ON public.menu_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND role = 'admin')
  );

-- ── orders ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "orders_select_own"   ON public.orders;
DROP POLICY IF EXISTS "orders_insert_own"   ON public.orders;
DROP POLICY IF EXISTS "orders_write_admin"  ON public.orders;

CREATE POLICY "orders_select" ON public.orders
  FOR SELECT USING (
    (select auth.uid()) = user_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND role = 'admin')
  );

CREATE POLICY "orders_insert" ON public.orders
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "orders_update_admin" ON public.orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND role = 'admin')
  );

CREATE POLICY "orders_delete_admin" ON public.orders
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND role = 'admin')
  );

-- ── order_items ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "order_items_select_own"   ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert_own"   ON public.order_items;
DROP POLICY IF EXISTS "order_items_write_admin"  ON public.order_items;

CREATE POLICY "order_items_select" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = (select auth.uid()))
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND role = 'admin')
  );

CREATE POLICY "order_items_insert" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = (select auth.uid()))
  );

CREATE POLICY "order_items_update_admin" ON public.order_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND role = 'admin')
  );

CREATE POLICY "order_items_delete_admin" ON public.order_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND role = 'admin')
  );
