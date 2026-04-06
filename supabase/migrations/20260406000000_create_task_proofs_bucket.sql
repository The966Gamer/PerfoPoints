insert into storage.buckets (id, name, public)
values ('task-proofs', 'task-proofs', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload task proofs"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'task-proofs');

create policy "Anyone can view task proofs"
on storage.objects
for select
to public
using (bucket_id = 'task-proofs');
