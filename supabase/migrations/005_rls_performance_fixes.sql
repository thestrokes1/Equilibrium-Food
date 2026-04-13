-- ============================================================
-- 005_rls_performance_fixes.sql
-- Fix auth.uid() init-plan, search_path, missing index,
-- and multiple permissive policy overlap
-- ============================================================

-- 1. Fix set_updated_at search_path (security)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- 2. Missing index on order_items.menu_item_id (performance)
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item
  ON public.order_items(menu_item_id);
