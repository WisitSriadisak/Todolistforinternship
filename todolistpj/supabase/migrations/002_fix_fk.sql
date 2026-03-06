-- ================================================================
-- PATCH 002 — แก้ FK ให้ PostgREST join ได้ + สร้าง friendships table
-- รันใน Supabase SQL Editor
-- ================================================================

-- ----------------------------------------------------------------
-- A) task_assignees.user_id → profiles(id)  (แทน auth.users)
--    PostgREST ต้องการ FK ตรง ไปยัง profiles ถึงจะ join ได้
-- ----------------------------------------------------------------
ALTER TABLE public.task_assignees
  DROP CONSTRAINT IF EXISTS task_assignees_user_id_fkey;

ALTER TABLE public.task_assignees
  ADD CONSTRAINT task_assignees_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ----------------------------------------------------------------
-- B) สร้าง friendships table (code ใช้ชื่อนี้)
--    requester_id / addressee_id → profiles(id)  ให้ PostgREST join
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.friendships (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status        TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (requester_id, addressee_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "friendships_select" ON public.friendships;
DROP POLICY IF EXISTS "friendships_insert" ON public.friendships;
DROP POLICY IF EXISTS "friendships_update" ON public.friendships;
DROP POLICY IF EXISTS "friendships_delete" ON public.friendships;

CREATE POLICY "friendships_select" ON public.friendships
  FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "friendships_insert" ON public.friendships
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "friendships_update" ON public.friendships
  FOR UPDATE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "friendships_delete" ON public.friendships
  FOR DELETE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
