-- ================================================================
-- CONSOLIDATED MIGRATION: Profiles, Friendships, and Task Assignees
-- Integrates fixes from 002_fix_fk.sql directly.
-- ================================================================

-- 1. PROFILES
create table if not exists profiles (
  id            uuid references auth.users on delete cascade primary key,
  email         text not null,
  display_name  text,
  friend_code   varchar(9) unique not null,
  created_at    timestamptz default now()
);

alter table profiles enable row level security;

create policy "profiles_select" on profiles
  for select to authenticated using (true);

create policy "profiles_insert" on profiles
  for insert to authenticated with check (auth.uid() = id);

create policy "profiles_update" on profiles
  for update to authenticated using (auth.uid() = id);

-- 2. FRIENDSHIPS
-- Recreated to reference public.profiles(id) for PostgREST join capability
drop table if exists friendships;

create table friendships (
  id            uuid default gen_random_uuid() primary key,
  requester_id  uuid references public.profiles(id) on delete cascade not null,
  addressee_id  uuid references public.profiles(id) on delete cascade not null,
  status        text not null default 'pending'
                  check (status in ('pending', 'accepted', 'rejected')),
  created_at    timestamptz default now(),
  unique (requester_id, addressee_id)
);

alter table friendships enable row level security;

create policy "friendships_select" on friendships
  for select to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "friendships_insert" on friendships
  for insert to authenticated
  with check (auth.uid() = requester_id);

create policy "friendships_update" on friendships
  for update to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "friendships_delete" on friendships
  for delete to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- 3. TASK ASSIGNEES
-- Recreated to reference public.profiles(id) for PostgREST join capability
drop table if exists task_assignees;

create table task_assignees (
  task_id  uuid references tasks on delete cascade not null,
  user_id  uuid references public.profiles(id) on delete cascade not null,
  primary key (task_id, user_id)
);

alter table task_assignees enable row level security;

-- Owner of the task can manage assignees
create policy "task_assignees_owner" on task_assignees
  for all to authenticated
  using (
    exists (
      select 1 from tasks
      where tasks.id = task_id
        and tasks.user_id = auth.uid()
    )
  );

-- Assignees can see their own assignments
create policy "task_assignees_self_select" on task_assignees
  for select to authenticated
  using (user_id = auth.uid());
