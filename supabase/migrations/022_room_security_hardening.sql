-- 022_room_security_hardening.sql
-- Closes the audit findings:
--   1. CRITICAL: participants_insert_join policy let ANY authenticated user
--      insert themselves into any live/scheduled room (private included),
--      bypassing join_room's privacy gate. RPCs are now the ONLY way to
--      become a participant (join_room / create_room are SECURITY DEFINER).
--   2. HIGH: membership predicates ignored participant status -> left/removed
--      users kept full read access. is_room_member now means ACTIVE member.
--   3. Room codes are the invitation: private rooms are joinable with the
--      code (the old ROOM_PRIVATE check made private rooms unjoinable).
--   4. last_seen_at on participants -> liveness/heartbeat support.
--   5. Host gets an in-app notification when someone joins their room.

alter table public.participants
  add column last_seen_at timestamptz not null default now();

-- Only RPCs can create participant rows now.
drop policy if exists "participants_insert_join" on public.participants;

-- ---------------------------------------------------------------------------
-- STATUS-AWARE MEMBERSHIP
-- ---------------------------------------------------------------------------
create or replace function public.is_room_member(p_room_id uuid)
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

-- Participants: you see your own rows (attendance history) plus only the
-- ACTIVE roster of rooms you actively belong to.
drop policy if exists "participants_select_member" on public.participants;
create policy "participants_select_member"
  on public.participants for select
  to authenticated
  using (
    user_id = auth.uid()
    or (public.is_room_member(room_id) and status = 'active')
  );

-- Whiteboard and settings selects now require ACTIVE membership (read
-- access for left/removed users is revoked).
drop policy if exists "whiteboard_select_member" on public.whiteboard_snapshots;
create policy "whiteboard_select_member"
  on public.whiteboard_snapshots for select
  to authenticated
  using (public.is_room_member(room_id));

drop policy if exists "meeting_settings_select_member" on public.meeting_settings;
create policy "meeting_settings_select_member"
  on public.meeting_settings for select
  to authenticated
  using (public.is_room_host(room_id) or public.is_room_member(room_id));

-- ---------------------------------------------------------------------------
-- JOIN ROOM: the only client path into a room.
-- ---------------------------------------------------------------------------
create or replace function public.join_room(p_code text)
returns setof public.rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.rooms;
  count_active int;
  v_uid uuid := auth.uid();
  inserted boolean := false;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = 'P0001';
  end if;

  select * into target
  from public.rooms
  where room_code = lower(trim(p_code))
    and deleted_at is null;

  if not found then
    raise exception 'ROOM_NOT_FOUND' using errcode = 'P0001';
  end if;

  if target.status not in ('live', 'scheduled') then
    raise exception 'ROOM_NOT_OPEN' using errcode = 'P0001';
  end if;

  -- Only LIVE participants count toward the limit (heartbeat-exposed).
  select count(*) into count_active
  from public.participants
  where room_id = target.id
    and status = 'active'
    and (last_seen_at > now() - interval '95 seconds' or last_seen_at is null);

  if count_active >= target.participant_limit then
    raise exception 'ROOM_FULL' using errcode = 'P0001';
  end if;

  insert into public.participants (room_id, user_id, is_host, mic, camera, connection, last_seen_at)
  values (target.id, v_uid, target.host_id = v_uid, 'off', 'off', 'good', now())
  on conflict (room_id, user_id) do update
    set status = 'active', left_at = null, raised_hand = false,
        speaking = false, screen_share = false, last_seen_at = now()
  returning (xmax = 0) into inserted;

  -- Notify the host when a brand-new participant joins (not on re-joins).
  if inserted and target.host_id <> v_uid then
    insert into public.notifications (user_id, kind, title, body, link)
    values (
      target.host_id, 'meeting', 'New participant joined',
      (select name from public.profiles where id = v_uid) || ' joined "' || target.title || '".',
      '/meeting/' || target.id::text
    );
  end if;

  return query select * from public.rooms where id = target.id;
end;
$$;

-- ---------------------------------------------------------------------------
-- CREATE ROOM: definer now (host participant insert has no client policy).
-- ---------------------------------------------------------------------------
create or replace function public.create_room(
  p_title text,
  p_description text default null,
  p_type public.room_type default 'class',
  p_subject text default null,
  p_privacy public.room_privacy default 'private',
  p_scheduled_at timestamptz default null,
  p_duration_minutes int default null,
  p_participant_limit int default 100
)
returns public.rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.rooms;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = 'P0001';
  end if;

  insert into public.rooms (
    title, description, type, subject, room_code, host_id,
    status, privacy, scheduled_at, duration_minutes, participant_limit, started_at
  )
  values (
    trim(p_title), nullif(trim(coalesce(p_description, '')), ''),
    p_type, nullif(trim(coalesce(p_subject, '')), ''),
    public.generate_room_code(), v_uid,
    case when p_scheduled_at is null then 'live'::public.room_status else 'scheduled'::public.room_status end,
    p_privacy, p_scheduled_at, p_duration_minutes, p_participant_limit,
    case when p_scheduled_at is null then now() else null end
  )
  returning * into result;

  insert into public.participants (room_id, user_id, is_host, mic, camera, connection, last_seen_at)
  values (result.id, v_uid, true, 'off', 'off', 'good', now());

  insert into public.meeting_settings (room_id)
  values (result.id);

  return result;
end;
$$;