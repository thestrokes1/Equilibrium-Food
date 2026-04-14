-- ── favorites ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.favorites (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id  uuid NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  created_at    timestamptz DEFAULT now(),
  UNIQUE(user_id, menu_item_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);

CREATE POLICY "favorites_select" ON public.favorites
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "favorites_insert" ON public.favorites
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "favorites_delete" ON public.favorites
  FOR DELETE USING ((select auth.uid()) = user_id);
