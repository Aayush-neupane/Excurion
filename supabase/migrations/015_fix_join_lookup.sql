-- 015_fix_join_lookup.sql
-- join_room was security invoker, so its code lookup SELECT ran under RLS and
-- private rooms (which the caller cannot see before joining) resolved to
-- ROOM_NOT_FOUND. Lookup and capacity checks now run in SECURITY DEFINER
-- helpers; the privacy gate (ROOM_PRIVATE) is enforced inside the function,
-- and the participant insert still goes through RLS.

create or replace function public.get_room_by_code(p_code text)
returns public.rooms
language sql
stable
security definer
set search_path = public
as $$
  select r.*
  from public.rooms r
  where r.room_code = lower(trim(p_code))
    and r.deleted_at is null
  limit 1
$$;

create or replace function public.active_participant_count(p_room_id uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.participants
  where room_id = p_room_id and status = 'active'
$$;

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
  from public.get_room_by_code(p_code);

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
  from public.active_participant_count(target.id);

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