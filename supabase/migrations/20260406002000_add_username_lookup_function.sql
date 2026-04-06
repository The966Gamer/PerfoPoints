create or replace function public.find_profile_email_by_username(login_username text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select email
  from public.profiles
  where lower(username) = lower(login_username)
    and coalesce(email, '') <> ''
  limit 1
$$;

revoke all on function public.find_profile_email_by_username(text) from public;
grant execute on function public.find_profile_email_by_username(text) to anon, authenticated;
