-- ============================================================
-- Friend System Migration
-- รันทั้งหมดนี้ใน Supabase SQL Editor ครั้งเดียว
-- ============================================================

-- 1. สร้าง profiles table (เก็บ friend_code + ข้อมูล user)
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  display_name  TEXT,
  friend_code   TEXT    UNIQUE NOT NULL
                        DEFAULT upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Auto-create profile เมื่อ user sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- สร้าง profile สำหรับ user ที่มีอยู่แล้ว
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 2. สร้าง friend_requests table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id  UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id   UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status        TEXT    NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(requester_id, receiver_id)
);

ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "friend_requests_select" ON public.friend_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

CREATE POLICY "friend_requests_insert" ON public.friend_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id AND requester_id <> receiver_id);

CREATE POLICY "friend_requests_update" ON public.friend_requests
  FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id);

CREATE POLICY "friend_requests_delete" ON public.friend_requests
  FOR DELETE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);


-- ============================================================
-- 3. อัปเดต task_assignees: เปลี่ยนจาก user_tag (TEXT) → user_id (UUID)
-- WARNING: ข้อมูลเดิมใน user_tag จะถูกลบ
-- ============================================================
ALTER TABLE public.task_assignees DROP COLUMN IF EXISTS user_tag;
ALTER TABLE public.task_assignees
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- RLS สำหรับ task_assignees
ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "task_assignees_select" ON public.task_assignees;
DROP POLICY IF EXISTS "task_assignees_insert" ON public.task_assignees;
DROP POLICY IF EXISTS "task_assignees_delete" ON public.task_assignees;
DROP POLICY IF EXISTS "task_assignees_all"    ON public.task_assignees;

CREATE POLICY "task_assignees_select" ON public.task_assignees
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "task_assignees_insert" ON public.task_assignees
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "task_assignees_delete" ON public.task_assignees
  FOR DELETE TO authenticated USING (true);
