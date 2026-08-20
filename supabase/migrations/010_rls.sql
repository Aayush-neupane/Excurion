-- 010_rls.sql
-- Row Level Security: every user-accessible table is locked down.
-- Authorization rules live here — the frontend never bypasses them.

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.meetings enable row level security;
alter table public.meeting_settings enable row level security;
alter table public.participants enable row level security;
alter table public.messages enable row level security;
alter table public.whiteboard_snapshots enable row level security;
alter table public.notifications enable row level security;

-- ---------------------------------------------------------------------------
-- PROFILES
--   read: any authenticated user (needed for participant lists)
--   update: self only
-- ---------------------------------------------------------------------------
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_update_self"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Role changes are never allowed from the client (security definer admins only).
create or replace function public.assert_role_not_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    raise exception 'role changes must be made server-side';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role
  before update on public.profiles
  for each row execute function public.assert_role_not_changed();

-- ---------------------------------------------------------------------------
-- ROOMS
--   insert: any authenticated user (becomes host)
--   select: host, participants, or public/unlisted rooms
--   update/delete: host only
-- ---------------------------------------------------------------------------
create policy "rooms_insert_authenticated"
  on public.rooms for insert
  to authenticated
  with check (auth.uid() = host_id);

create policy "rooms_select_member"
  on public.rooms for select
  to authenticated
  using (
    host_id = auth.uid()
    or exists (
      select 1 from public.participants p
      where p.room_id = rooms.id and p.user_id = auth.uid()
    )
    or privacy in ('public', 'unlisted')
  );

create policy "rooms_update_host"
  on public.rooms for update
  to authenticated
  using (host_id = auth.uid())
  with check (host_id = auth.uid());

create policy "rooms_delete_host"
  on public.rooms for delete
  to authenticated
  using (host_id = auth.uid());

-- ---------------------------------------------------------------------------
-- MEETINGS (scheduled sessions)
--   select: room members
--   insert/update/delete: room host
-- ---------------------------------------------------------------------------
create policy "meetings_select_member"
  on public.meetings for select
  to authenticated
  using (
    exists (
      select 1 from public.rooms r
      where r.id = meetings.room_id
        and (
          r.host_id = auth.uid()
          or exists (
            select 1 from public.participants p
            where p.room_id = r.id and p.user_id = auth.uid()
          )
        )
    )
  );

create policy "meetings_insert_host"
  on public.meetings for insert
  to authenticated
  with check (
    exists (select 1 from public.rooms r where r.id = room_id and r.host_id = auth.uid())
  );

create policy "meetings_update_host"
  on public.meetings for update
  to authenticated
  using (
    exists (select 1 from public.rooms r where r.id = room_id and r.host_id = auth.uid())
  );

create policy "meetings_delete_host"
  on public.meetings for delete
  to authenticated
  using (
    exists (select 1 from public.rooms r where r.id = room_id and r.host_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- MEETING_SETTINGS
--   select: room members
--   update: room host
-- ---------------------------------------------------------------------------
create policy "meeting_settings_select_member"
  on public.meeting_settings for select
  to authenticated
  using (
    exists (
      select 1 from public.rooms r
      where r.id = meeting_settings.room_id
        and (
          r.host_id = auth.uid()
          or exists (
            select 1 from public.participants p
            where p.room_id = r.id and p.user_id = auth.uid()
          )
        )
    )
  );

create policy "meeting_settings_update_host"
  on public.meeting_settings for update
  to authenticated
  using (
    exists (select 1 from public.rooms r where r.id = room_id and r.host_id = auth.uid())
  );

create policy "meeting_settings_insert_host"
  on public.meeting_settings for insert
  to authenticated
  with check (
    exists (select 1 from public.rooms r where r.id = room_id and r.host_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- PARTICIPANTS
--   insert: joining a room (validated in join_room RPC)
--   select: room members (host or fellow participants)
--   update: self (media/presence bits, leaving) or host (manage roster)
-- ---------------------------------------------------------------------------
create policy "participants_insert_join"
  on public.participants for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.rooms r
      where r.id = room_id
        and r.status in ('live', 'scheduled')
    )
  );

create policy "participants_select_member"
  on public.participants for select
  to authenticated
  using (
    exists (
      select 1 from public.rooms r
      where r.id = participants.room_id
        and (
          r.host_id = auth.uid()
          or exists (
            select 1 from public.participants p2
            where p2.room_id = r.id and p2.user_id = auth.uid()
          )
        )
    )
  );

create policy "participants_update_self"
  on public.participants for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "participants_update_host"
  on public.participants for update
  to authenticated
  using (
    exists (select 1 from public.rooms r where r.id = room_id and r.host_id = auth.uid())
  );

create policy "participants_delete_self"
  on public.participants for delete
  to authenticated
  using (user_id = auth.uid());

create policy "participants_delete_host"
  on public.participants for delete
  to authenticated
  using (
    exists (select 1 from public.rooms r where r.id = room_id and r.host_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- MESSAGES
--   insert/select: room members
--   update: author (edit only; host may remove content via delete)
--   delete: author or host
-- ---------------------------------------------------------------------------
create policy "messages_insert_member"
  on public.messages for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.participants p
      where p.room_id = messages.room_id and p.user_id = auth.uid() and p.status = 'active'
    )
  );

create policy "messages_select_member"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.participants p
      where p.room_id = messages.room_id and p.user_id = auth.uid()
    )
  );

create policy "messages_update_author"
  on public.messages for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "messages_delete_author_or_host"
  on public.messages for delete
  to authenticated
  using (
    author_id = auth.uid()
    or exists (
      select 1 from public.rooms r
      where r.id = messages.room_id and r.host_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- WHITEBOARD_SNAPSHOTS
--   select: room members
--   insert/update: room members (via save_whiteboard_snapshot RPC)
-- ---------------------------------------------------------------------------
create policy "whiteboard_select_member"
  on public.whiteboard_snapshots for select
  to authenticated
  using (
    exists (
      select 1 from public.participants p
      where p.room_id = whiteboard_snapshots.room_id and p.user_id = auth.uid()
    )
  );

create policy "whiteboard_insert_member"
  on public.whiteboard_snapshots for insert
  to authenticated
  with check (
    exists (
      select 1 from public.participants p
      where p.room_id = whiteboard_snapshots.room_id and p.user_id = auth.uid() and p.status = 'active'
    )
  );

create policy "whiteboard_update_member"
  on public.whiteboard_snapshots for update
  to authenticated
  using (
    exists (
      select 1 from public.participants p
      where p.room_id = whiteboard_snapshots.room_id and p.user_id = auth.uid() and p.status = 'active'
    )
  );

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS
--   fully private: users only see/manage their own rows
-- ---------------------------------------------------------------------------
create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "notifications_update_own"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notifications_delete_own"
  on public.notifications for delete
  to authenticated
  using (user_id = auth.uid());

-- No insert policy: notifications originate from RPC (own) or
-- server-side functions (service role), never raw client inserts.