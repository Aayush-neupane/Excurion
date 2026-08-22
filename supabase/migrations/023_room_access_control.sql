-- 023_room_access_control.sql
-- 1) Password-protected rooms: join_password stores a bf-crypt hash.
--    create_room gains p_join_password; join_room gains p_password and
--    rejects wrong/missing passwords with ROOM_PASSWORD_REQUIRED /
--    ROOM_PASSWORD_WRONG.
-- 2) Anyone authenticated may SEE which classes are LIVE right now
--    (needed for "ongoing classes" on member profiles). Full participation
--    still requires joining via code/password through the RPCs.

alter table public.rooms
  add column if not exists join_password text;

-- ---------------------------------------------------------------------------
-- CREATE ROOM: optional password
-- ---------------------------------------------------------------------------
create or replace function public.create_room(
  p_title text,
  p_description text default null,
  p_type public.room_type default 'class',
  p_subject text default null,
  p_privacy public.room_privacy default 'private',
  p_scheduled_at timestamptz default null,
  p_duration_minutes int default null,
  p_participant_limit int default 100,
  p_join_password text default null
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
    status, privacy, scheduled_at, duration_minutes, participant_limit,
    started_at, join_password
  )
  values (
    trim(p_title), nullif(trim(coalesce(p_description, '')), ''),
    p_type, nullif(trim(coalesce(p_subject, '')), ''),
    public.generate_room_code(), v_uid,
    case when p_scheduled_at is null then 'live'::public.room_status else 'scheduled'::public.room_status end,
    p_privacy, p_scheduled_at, p_duration_minutes, p_participant_limit,
    case when p_scheduled_at is null then now() else null end,
    case
      when p_join_password is null or length(trim(p_join_password)) = 0 then null
      else crypt(left(trim(p_join_password), 72), gen_salt('bf'))
    end
  )
  returning * into result;

  insert into public.participants (room_id, user_id, is_host, mic, camera, connection, last_seen_at)
  values (result.id, v_uid, true, 'off', 'off', 'good', now());

  insert into public.meeting_settings (room_id)
  values (result.id);

  return result;
end;
$$;

-- ---------------------------------------------------------------------------
-- JOIN ROOM: enforce password when set
-- ---------------------------------------------------------------------------
create or replace function public.join_room(p_code text, p_password text default null)
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

  -- Password gate (hash stored via pgcrypto bf).
  if target.join_password is not null then
    if p_password is null or length(trim(p_password)) = 0 then
      raise exception 'ROOM_PASSWORD_REQUIRED' using errcode = 'P0001';
    end if;
    if target.join_password <> crypt(left(trim(p_password), 72), target.join_password) then
      raise exception 'ROOM_PASSWORD_WRONG' using errcode = 'P0001';
    end if;
  end if;

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
-- Public visibility of LIVE rooms (profile "ongoing classes" listing).
-- Participation is still gated by join_room (code + optional password).
-- ---------------------------------------------------------------------------
drop policy if exists "rooms_select_live" on public.rooms;
create policy "rooms_select_live"
  on public.rooms for select
  to authenticated
  using (status = 'live' and deleted_at is null);
