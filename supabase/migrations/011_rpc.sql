-- 011_rpc.sql
-- RPC functions: the only way participants join/leave rooms, so business
-- rules (code lookup, limits, host assignment) run in the database.

-- Join a room by code. Returns the room row for the caller.
-- Security invoker so RLS still applies to the returned rows.
create or replace function public.join_room(p_code text)
returns setof public.rooms
language plpgsql
security invoker
set search_path = public
as $$
declare
  target public.rooms;
  count_active int;
begin
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

  if target.privacy = 'private' and not exists (
    select 1 from public.participants p
    where p.room_id = target.id and p.user_id = auth.uid()
  ) and target.host_id <> auth.uid() then
    raise exception 'ROOM_PRIVATE' using errcode = 'P0001';
  end if;

  select count(*) into count_active
  from public.participants
  where room_id = target.id and status = 'active';

  if count_active >= target.participant_limit then
    raise exception 'ROOM_FULL' using errcode = 'P0001';
  end if;

  insert into public.participants (room_id, user_id, is_host, mic, camera, connection)
  values (target.id, auth.uid(), target.host_id = auth.uid(), 'off', 'off', 'good')
  on conflict (room_id, user_id) do update
    set status = 'active', left_at = null, raised_hand = false;

  return query select * from public.rooms where id = target.id;
end;
$$;

-- Leave a room (soft: row kept for history, status -> left).
create or replace function public.leave_room(p_room_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  update public.participants
  set status = 'left', left_at = now(), speaking = false, raised_hand = false, screen_share = false
  where room_id = p_room_id and user_id = auth.uid();
end;
$$;

-- Create a room + host participant + default settings atomically.
-- Generates a unique code server-side so no two rooms ever collide.
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
security invoker
set search_path = public
as $$
declare
  result public.rooms;
begin
  insert into public.rooms (
    title, description, type, subject, room_code, host_id,
    status, privacy, scheduled_at, duration_minutes, participant_limit, started_at
  )
  values (
    trim(p_title), nullif(trim(coalesce(p_description, '')), ''),
    p_type, nullif(trim(coalesce(p_subject, '')), ''),
    public.generate_room_code(), auth.uid(),
    case when p_scheduled_at is null then 'live' else 'scheduled' end,
    p_privacy, p_scheduled_at, p_duration_minutes, p_participant_limit,
    case when p_scheduled_at is null then now() else null end
  )
  returning * into result;

  insert into public.participants (room_id, user_id, is_host, mic, camera, connection)
  values (result.id, auth.uid(), true, 'off', 'off', 'good');

  insert into public.meeting_settings (room_id)
  values (result.id);

  return result;
end;
$$;

-- End a room (host only). Called by the host from the client or by a
-- Netlify Function; RLS guards the underlying update.
create or replace function public.end_room(p_room_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.rooms where id = p_room_id and host_id = auth.uid()
  ) then
    raise exception 'NOT_HOST' using errcode = 'P0001';
  end if;
  update public.rooms
    set status = 'ended', ended_at = now()
  where id = p_room_id;
end;
$$;

-- Promote a participant to host (host-only). Used by the Netlify Function
-- process-meeting-action; security invoker so RLS applies.
create or replace function public.promote_host(p_room_id uuid, p_user_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.rooms where id = p_room_id and host_id = auth.uid()
  ) then
    raise exception 'NOT_HOST' using errcode = 'P0001';
  end if;

  update public.participants set is_host = false
  where room_id = p_room_id and is_host;

  update public.participants set is_host = true
  where room_id = p_room_id and user_id = p_user_id;

  update public.rooms set host_id = p_user_id
  where id = p_room_id;
end;
$$;