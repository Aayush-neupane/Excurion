-- 013_fix_rpc_bugs.sql
-- 1) create_room: literal room status strings must be cast to room_status.
-- 2) create_own_notification: RPC is security invoker but notifications have
--    no client insert policy -> must be security definer (the function
--    hardcodes user_id = auth.uid(), so it cannot write another user's rows).
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
    case when p_scheduled_at is null then 'live'::public.room_status else 'scheduled'::public.room_status end,
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

drop function if exists public.create_own_notification(public.notification_kind, text, text, text);

create or replace function public.create_own_notification(
  p_kind public.notification_kind,
  p_title text,
  p_body text default '',
  p_link text default null
)
returns public.notifications
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.notifications;
begin
  insert into public.notifications (user_id, kind, title, body, link)
  values (auth.uid(), p_kind, p_title, p_body, p_link)
  returning * into result;
  return result;
end;
$$;