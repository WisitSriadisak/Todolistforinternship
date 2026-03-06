-- ================================================================
-- STEP 1: profiles table (เก็บ friend_code ของแต่ละ user)
-- ================================================================
create table if not exists profiles (
  id            uuid references auth.users on delete cascade primary key,
  email         text not null,
  display_name  text,
  friend_code   varchar(9) unique not null,  -- format: XXXX-XXXX
  created_at    timestamptz default now()
);

alter table profiles enable row level security;

-- ทุก user ที่ login เห็น profile คนอื่นได้ (เพื่อค้นด้วย friend_code)
create policy "profiles_select" on profiles
  for select to authenticated using (true);

create policy "profiles_insert" on profiles
  for insert to authenticated with check (auth.uid() = id);

create policy "profiles_update" on profiles
  for update to authenticated using (auth.uid() = id);

-- ================================================================
-- STEP 2: friendships table
-- ================================================================
create table if not exists friendships (
  id            uuid default gen_random_uuid() primary key,
  requester_id  uuid references auth.users on delete cascade not null,
  addressee_id  uuid references auth.users on delete cascade not null,
  status        text not null default 'pending'
                  check (status in ('pending', 'accepted', 'rejected')),
  created_at    timestamptz default now(),
  unique (requester_id, addressee_id)
);

alter table friendships enable row level security;

-- เห็นเฉพาะ friendship ที่ตัวเองเกี่ยวข้อง
create policy "friendships_select" on friendships
  for select to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- ส่ง request ได้เฉพาะในฐานะ requester
create policy "friendships_insert" on friendships
  for insert to authenticated
  with check (auth.uid() = requester_id);

-- อัปเดต status ได้ทั้งสองฝ่าย (accept/reject/remove)
create policy "friendships_update" on friendships
  for update to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "friendships_delete" on friendships
  for delete to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- ================================================================
-- STEP 3: ปรับ task_assignees ให้ใช้ user_id (uuid) แทน user_tag (text)
-- ================================================================
drop table if exists task_assignees;

create table task_assignees (
  task_id  uuid references tasks on delete cascade not null,
  user_id  uuid references auth.users on delete cascade not null,
  primary key (task_id, user_id)
);

alter table task_assignees enable row level security;

-- เจ้าของ task จัดการ assignees ได้
create policy "task_assignees_owner" on task_assignees
  for all to authenticated
  using (
    exists (
      select 1 from tasks
      where tasks.id = task_id
        and tasks.user_id = auth.uid()
    )
  );

-- คนที่ถูก assign เห็นงานของตัวเองได้
create policy "task_assignees_self_select" on task_assignees
  for select to authenticated
  using (user_id = auth.uid());
