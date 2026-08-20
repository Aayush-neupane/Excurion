-- 009_storage.sql
-- Storage buckets + policies. Buckets:
--   avatars            -> public read, owner writes own avatar
--   room-files         -> private, room members read, host writes (future: files)
--   whiteboard-exports -> private, room members read/write (future)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('room-files', 'room-files', false, 52428800, null),
  ('whiteboard-exports', 'whiteboard-exports', false, 20971520, null)
on conflict (id) do nothing;

-- avatars: public reads, owner-only writes under profiles/{userId}/...
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_owner_write"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_owner_update"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_owner_delete"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- room-files / whiteboard-exports: access controlled by room membership.
-- Path convention: {roomId}/... so membership is derivable from the path.
create or replace function public.is_room_participant(room_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.participants
    where room_id = room_id::uuid
      and user_id = auth.uid()
      and status = 'active'
  )
$$;

create policy "room_files_member_read"
  on storage.objects for select
  using (
    bucket_id in ('room-files', 'whiteboard-exports')
    and public.is_room_participant((storage.foldername(name))[1])
  );

create policy "room_files_member_insert"
  on storage.objects for insert
  with check (
    bucket_id in ('room-files', 'whiteboard-exports')
    and public.is_room_participant((storage.foldername(name))[1])
  );

create policy "room_files_member_update"
  on storage.objects for update
  using (
    bucket_id in ('room-files', 'whiteboard-exports')
    and public.is_room_participant((storage.foldername(name))[1])
  );

create policy "room_files_member_delete"
  on storage.objects for delete
  using (
    bucket_id in ('room-files', 'whiteboard-exports')
    and public.is_room_participant((storage.foldername(name))[1])
  );