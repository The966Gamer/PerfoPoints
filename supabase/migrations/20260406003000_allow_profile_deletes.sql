drop policy if exists "Users can delete own profile" on public.profiles;
create policy "Users can delete own profile"
on public.profiles
for delete
to authenticated
using (auth.uid() = id);

drop policy if exists "Admins can delete all profiles" on public.profiles;
create policy "Admins can delete all profiles"
on public.profiles
for delete
to authenticated
using (public.is_admin(auth.uid()));
