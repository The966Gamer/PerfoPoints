create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  full_name text not null default '',
  email text,
  email_verified boolean not null default false,
  role text not null default 'user' check (role in ('admin', 'user')),
  points integer not null default 0,
  is_blocked boolean not null default false,
  avatar_url text,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  points_value integer not null default 0,
  recurring boolean not null default false,
  category text,
  status text not null default 'active',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  points_cost integer not null default 0,
  requires_approval boolean not null default false,
  category text
);

create table if not exists public.point_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  task_id uuid not null,
  status text not null default 'pending',
  comment text,
  photo_url text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone
);

create table if not exists public.points_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  points integer not null,
  new_total integer not null,
  reason text,
  task_id uuid,
  task_title text,
  type text not null,
  timestamp timestamp with time zone not null default now()
);

create table if not exists public.user_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  key_type text not null,
  quantity integer not null default 0,
  unique (user_id, key_type)
);

create table if not exists public.keys_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  key_type text not null,
  quantity integer not null,
  new_total integer not null,
  type text not null,
  reason text,
  timestamp timestamp with time zone not null default now()
);

create table if not exists public.task_key_rewards (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  key_type text not null,
  quantity integer not null default 1
);

create table if not exists public.reward_key_requirements (
  id uuid primary key default gen_random_uuid(),
  reward_id uuid not null references public.rewards(id) on delete cascade,
  key_type text not null,
  quantity integer not null default 1
);

create table if not exists public.custom_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text,
  type text not null,
  status text not null default 'pending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.rewards enable row level security;
alter table public.point_requests enable row level security;
alter table public.points_history enable row level security;
alter table public.user_keys enable row level security;
alter table public.keys_history enable row level security;
alter table public.task_key_rewards enable row level security;
alter table public.reward_key_requirements enable row level security;
alter table public.custom_requests enable row level security;

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = user_id and role = 'admin'
  )
$$;

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can view all profiles" on public.profiles;
create policy "Users can view all profiles"
on public.profiles
for select
to authenticated
using (auth.uid() = id or public.is_admin(auth.uid()));

create policy "Authenticated users can view tasks"
on public.tasks
for select
to authenticated
using (true);

create policy "Admins can manage tasks"
on public.tasks
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Authenticated users can view rewards"
on public.rewards
for select
to authenticated
using (true);

create policy "Admins can manage rewards"
on public.rewards
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Users can view own point requests"
on public.point_requests
for select
to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Users can create own point requests"
on public.point_requests
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Admins can update point requests"
on public.point_requests
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Users can view own points history"
on public.points_history
for select
to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Admins can insert points history"
on public.points_history
for insert
to authenticated
with check (public.is_admin(auth.uid()) or auth.uid() = user_id);

create policy "Users can view own keys"
on public.user_keys
for select
to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Admins can manage user keys"
on public.user_keys
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Users can view own key history"
on public.keys_history
for select
to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Admins can insert key history"
on public.keys_history
for insert
to authenticated
with check (public.is_admin(auth.uid()));

create policy "Authenticated users can view task key rewards"
on public.task_key_rewards
for select
to authenticated
using (true);

create policy "Admins can manage task key rewards"
on public.task_key_rewards
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Authenticated users can view reward key requirements"
on public.reward_key_requirements
for select
to authenticated
using (true);

create policy "Admins can manage reward key requirements"
on public.reward_key_requirements
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Users can view own custom requests"
on public.custom_requests
for select
to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Users can insert own custom requests"
on public.custom_requests
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Admins can update custom requests"
on public.custom_requests
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
