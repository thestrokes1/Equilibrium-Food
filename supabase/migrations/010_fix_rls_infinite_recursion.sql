-- ============================================================
-- 010_fix_rls_infinite_recursion.sql
-- The admin-check subquery inside profiles policies referenced
-- profiles itself, causing infinite recursion on any query that
-- touched the profiles RLS (orders insert, profile fetch, etc.).
-- Fix: SECURITY DEFINER function reads profiles bypassing RLS.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;

-- profiles -----------------------------------------------------------------
DROP POLICY IF EXISTS profiles_select       ON public.profiles;
DROP POLICY IF EXISTS profiles_update       ON public.profiles;
DROP POLICY IF EXISTS profiles_delete_admin ON public.profiles;

CREATE POLICY profiles_select ON public.profiles FOR SELECT
  USING ((SELECT auth.uid()) = id OR is_admin());

CREATE POLICY profiles_update ON public.profiles FOR UPDATE
  USING ((SELECT auth.uid()) = id OR is_admin());

CREATE POLICY profiles_delete_admin ON public.profiles FOR DELETE
  USING (is_admin());

-- orders -------------------------------------------------------------------
DROP POLICY IF EXISTS orders_select       ON public.orders;
DROP POLICY IF EXISTS orders_update_admin ON public.orders;
DROP POLICY IF EXISTS orders_delete_admin ON public.orders;

CREATE POLICY orders_select ON public.orders FOR SELECT
  USING ((SELECT auth.uid()) = user_id OR is_admin());

CREATE POLICY orders_update_admin ON public.orders FOR UPDATE
  USING (is_admin());

CREATE POLICY orders_delete_admin ON public.orders FOR DELETE
  USING (is_admin());

-- order_items --------------------------------------------------------------
DROP POLICY IF EXISTS order_items_select       ON public.order_items;
DROP POLICY IF EXISTS order_items_update_admin ON public.order_items;
DROP POLICY IF EXISTS order_items_delete_admin ON public.order_items;

CREATE POLICY order_items_select ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = (SELECT auth.uid())
    )
    OR is_admin()
  );

CREATE POLICY order_items_update_admin ON public.order_items FOR UPDATE
  USING (is_admin());

CREATE POLICY order_items_delete_admin ON public.order_items FOR DELETE
  USING (is_admin());

-- order_reviews ------------------------------------------------------------
DROP POLICY IF EXISTS reviews_admin_select ON public.order_reviews;

CREATE POLICY reviews_admin_select ON public.order_reviews FOR SELECT
  USING ((SELECT auth.uid()) = user_id OR is_admin());

-- menu_items ---------------------------------------------------------------
DROP POLICY IF EXISTS menu_items_insert_admin ON public.menu_items;
DROP POLICY IF EXISTS menu_items_update_admin ON public.menu_items;
DROP POLICY IF EXISTS menu_items_delete_admin ON public.menu_items;

CREATE POLICY menu_items_insert_admin ON public.menu_items FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY menu_items_update_admin ON public.menu_items FOR UPDATE
  USING (is_admin());

CREATE POLICY menu_items_delete_admin ON public.menu_items FOR DELETE
  USING (is_admin());

-- restaurants --------------------------------------------------------------
DROP POLICY IF EXISTS restaurants_insert_admin ON public.restaurants;
DROP POLICY IF EXISTS restaurants_update_admin ON public.restaurants;
DROP POLICY IF EXISTS restaurants_delete_admin ON public.restaurants;

CREATE POLICY restaurants_insert_admin ON public.restaurants FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY restaurants_update_admin ON public.restaurants FOR UPDATE
  USING (is_admin());

CREATE POLICY restaurants_delete_admin ON public.restaurants FOR DELETE
  USING (is_admin());
