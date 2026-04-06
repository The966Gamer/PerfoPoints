create table if not exists public.user_salah_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  enabled boolean not null default false,
  daily_goal integer not null default 5 check (daily_goal between 1 and 5),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.salah_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  log_date date not null default current_date,
  completed_count integer not null default 0 check (completed_count between 0 and 5),
  updated_at timestamp with time zone not null default now(),
  unique (user_id, log_date)
);

alter table public.user_salah_settings enable row level security;
alter table public.salah_logs enable row level security;

create policy "Users can view own salah settings"
on public.user_salah_settings
for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Admins can manage salah settings"
on public.user_salah_settings
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Users can view own salah logs"
on public.salah_logs
for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Users can upsert own salah logs"
on public.salah_logs
for insert
with check (auth.uid() = user_id);

create policy "Users can update own salah logs"
on public.salah_logs
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Admins can manage all salah logs"
on public.salah_logs
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
