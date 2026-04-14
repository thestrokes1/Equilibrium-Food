-- ============================================================
-- 009_push_subscriptions.sql
-- Stores browser Web Push subscriptions per user.
-- The Edge Function (push-notify) reads this via service role
-- to send notifications when order status changes.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint   text        NOT NULL UNIQUE,
  p256dh     text        NOT NULL,
  auth       text        NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read/insert/delete their own subscriptions
CREATE POLICY "push_subs_own" ON public.push_subscriptions
  FOR ALL
  USING  ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Index for quick user lookup
CREATE INDEX IF NOT EXISTS push_subs_user_idx ON public.push_subscriptions (user_id);
