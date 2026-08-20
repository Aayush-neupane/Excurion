-- 014_fix_rls_recursion.sql
-- Policies that referenced public.participants from inside other policies
-- blew up with "infinite recursion detected in policy for relation
-- participants" (newer Postgres versions re-evaluate policies on RETURNING,
-- turning the rooms -> participants -> participants loops into cycles).
--
-- Fix: every membership/host/joinability predicate moves into SECURITY
-- DEFINER helpers, exactly like public.is_room_participant() in 009.

create or replace function public.is_room_host(p_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.rooms
    where id = p_room_id and host_id = auth.uid()
  )
$$;

create or replace function public.is_room_member(p_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.participants
    where room_id = p_room_id and user_id = auth.uid()
  )
$$;

create or replace function public.is_room_active_member(p_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.participants
    where room_id = p_room_id and user_id = auth.uid() and status = 'active'
  )
$$;

create or replace function public.is_joinable_room(p_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.rooms
    where id = p_room_id and status in ('live', 'scheduled')
  )
$$;

-- ---------------------------------------------------------------------------
-- ROOMS
-- ---------------------------------------------------------------------------
drop policy if exists "rooms_select_member" on public.rooms;
create policy "rooms_select_member"
  on public.rooms for select
  to authenticated
  using (
    host_id = auth.uid()
    or public.is_room_member(id)
    or privacy in ('public', 'unlisted')
  );

drop policy if exists "rooms_update_host" on public.rooms;
create policy "rooms_update_host"
  on public.rooms for update
  to authenticated
  using (public.is_room_host(id))
  with check (public.is_room_host(id));

drop policy if exists "rooms_delete_host" on public.rooms;
create policy "rooms_delete_host"
  on public.rooms for delete
  to authenticated
  using (public.is_room_host(id));

-- ---------------------------------------------------------------------------
-- MEETINGS
-- ---------------------------------------------------------------------------
drop policy if exists "meetings_select_member" on public.meetings;
create policy "meetings_select_member"
  on public.meetings for select
  to authenticated
  using (public.is_room_host(room_id) or public.is_room_member(room_id));

drop policy if exists "meetings_insert_host" on public.meetings;
create policy "meetings_insert_host"
  on public.meetings for insert
  to authenticated
  with check (public.is_room_host(room_id));

drop policy if exists "meetings_update_host" on public.meetings;
create policy "meetings_update_host"
  on public.meetings for update
  to authenticated
  using (public.is_room_host(room_id));

drop policy if exists "meetings_delete_host" on public.meetings;
create policy "meetings_delete_host"
  on public.meetings for delete
  to authenticated
  using (public.is_room_host(room_id));

-- ---------------------------------------------------------------------------
-- MEETING_SETTINGS
-- ---------------------------------------------------------------------------
drop policy if exists "meeting_settings_select_member" on public.meeting_settings;
create policy "meeting_settings_select_member"
  on public.meeting_settings for select
  to authenticated
  using (public.is_room_host(room_id) or public.is_room_member(room_id));

drop policy if exists "meeting_settings_update_host" on public.meeting_settings;
create policy "meeting_settings_update_host"
  on public.meeting_settings for update
  to authenticated
  using (public.is_room_host(room_id));

drop policy if exists "meeting_settings_insert_host" on public.meeting_settings;
create policy "meeting_settings_insert_host"
  on public.meeting_settings for insert
  to authenticated
  with check (public.is_room_host(room_id));

-- ---------------------------------------------------------------------------
-- PARTICIPANTS
-- ---------------------------------------------------------------------------
drop policy if exists "participants_insert_join" on public.participants;
create policy "participants_insert_join"
  on public.participants for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.is_joinable_room(room_id)
  );

drop policy if exists "participants_select_member" on public.participants;
create policy "participants_select_member"
  on public.participants for select
  to authenticated
  using (user_id = auth.uid() or public.is_room_member(room_id));

drop policy if exists "participants_update_host" on public.participants;
create policy "participants_update_host"
  on public.participants for update
  to authenticated
  using (public.is_room_host(room_id));

drop policy if exists "participants_delete_host" on public.participants;
create policy "participants_delete_host"
  on public.participants for delete
  to authenticated
  using (public.is_room_host(room_id));

-- ---------------------------------------------------------------------------
-- MESSAGES
-- ---------------------------------------------------------------------------
drop policy if exists "messages_insert_member" on public.messages;
create policy "messages_insert_member"
  on public.messages for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and public.is_room_active_member(room_id)
  );

drop policy if exists "messages_select_member" on public.messages;
create policy "messages_select_member"
  on public.messages for select
  to authenticated
  using (public.is_room_member(room_id));

drop policy if exists "messages_delete_author_or_host" on public.messages;
create policy "messages_delete_author_or_host"
  on public.messages for delete
  to authenticated
  using (author_id = auth.uid() or public.is_room_host(room_id));

-- ---------------------------------------------------------------------------
-- WHITEBOARD_SNAPSHOTS
-- ---------------------------------------------------------------------------
drop policy if exists "whiteboard_select_member" on public.whiteboard_snapshots;
create policy "whiteboard_select_member"
  on public.whiteboard_snapshots for select
  to authenticated
  using (public.is_room_member(room_id));

drop policy if exists "whiteboard_insert_member" on public.whiteboard_snapshots;
create policy "whiteboard_insert_member"
  on public.whiteboard_snapshots for insert
  to authenticated
  with check (public.is_room_active_member(room_id));

drop policy if exists "whiteboard_update_member" on public.whiteboard_snapshots;
create policy "whiteboard_update_member"
  on public.whiteboard_snapshots for update
  to authenticated
  using (public.is_room_active_member(room_id));