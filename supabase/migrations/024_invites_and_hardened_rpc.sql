-- 024_invites_and_hardened_rpc.sql
-- 1) Private rooms now REQUIRE an invitation or the password:
--    public  -> code alone is enough (password still honored if set)
--    private -> allowed only if: you are the host, OR you hold an active
--               invite (by user id or email), OR you supply the password.
-- 2) room_invites table: host can invite platform users by email.
-- 3) end_room hardened to SECURITY DEFINER with explicit host check
--    (immune to any policy/overload drift).
-- 4) list_live_rooms_by_host: stable listing for profiles, SECURITY DEFINER.

create table if not exists public.room_invites (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  invited_user_id uuid references public.profiles (id) on delete cascade,
  invited_email text,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint room_invites_target check (invited_user_id is not null or invited_email is not null),
  constraint room_invites_email_format check (invited_email is null or invited_email ~* '^[^@]+@[^@]+\.[^@]+$')
);
alter table public.room_invites enable row level security;

-- Host manages invites for rooms they own.
drop policy if exists "invites_host_manage" on public.room_invites;
create policy "invites_host_manage"
  on public.room_invites for all
  to authenticated
  using (
    exists (
      select 1 from public.rooms r
      where r.id = room_id and r.host_id = auth.uid()
    )
  )
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.rooms r
      where r.id = room_id and r.host_id = auth.uid()
    )
  );

-- Invitees can see invites addressed to them.
drop policy if exists "invites_select_invited" on public.room_invites;
create policy "invites_select_invited"
  on public.room_invites for select
  to authenticated
  using (invited_user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- JOIN ROOM v3: privacy gate + invites + password
-- ---------------------------------------------------------------------------
drop function if exists public.join_room(text);
drop function if exists public.join_room(text, text);
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

  -- ACCESS GATE ------------------------------------------------------------
  if v_uid <> target.host_id then
    if target.privacy = 'private' then
      -- Private: need invite OR password.
      if not exists (
        select 1 from public.room_invites ri
        where ri.room_id = target.id
          and (
            ri.invited_user_id = v_uid
            or lower(ri.invited_email) = lower(coalesce((select u.email from auth.users u where u.id = v_uid), ''))
          )
      ) then
        if target.join_password is null then
          raise exception 'ROOM_PRIVATE' using errcode = 'P0001';
        elsif p_password is null or length(trim(p_password)) = 0 then
          raise exception 'ROOM_PASSWORD_REQUIRED' using errcode = 'P0001';
        elsif target.join_password <> crypt(left(trim(p_password), 72), target.join_password) then
          raise exception 'ROOM_PASSWORD_WRONG' using errcode = 'P0001';
        end if;
      end if;
    else
      -- Public: password optional but enforced when set.
      if target.join_password is not null then
        if p_password is null or length(trim(p_password)) = 0 then
          raise exception 'ROOM_PASSWORD_REQUIRED' using errcode = 'P0001';
        elsif target.join_password <> crypt(left(trim(p_password), 72), target.join_password) then
          raise exception 'ROOM_PASSWORD_WRONG' using errcode = 'P0001';
        end if;
      end if;
    end if;
  end if;
  --------------------------------------------------------------------------

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
-- END ROOM: SECURITY DEFINER with explicit host check
-- ---------------------------------------------------------------------------
drop function if exists public.end_room(uuid);
create or replace function public.end_room(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = 'P0001';
  end if;
  if not exists (
    select 1 from public.rooms
    where id = p_room_id and host_id = auth.uid() and deleted_at is null
  ) then
    raise exception 'NOT_HOST' using errcode = 'P0001';
  end if;

  update public.rooms
    set status = 'ended', ended_at = now(), updated_at = now()
  where id = p_room_id;

  update public.participants
    set status = 'left', left_at = now()
  where room_id = p_room_id and status = 'active';
end;
$$;

-- ---------------------------------------------------------------------------
-- LIVE ROOM LISTING for profiles (bypasses RLS safely; read-only columns)
-- ---------------------------------------------------------------------------
create or replace function public.list_live_rooms_by_host(p_host uuid)
returns table (
  id uuid,
  title text,
  started_at timestamptz,
  participant_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select r.id,
         r.title,
         r.started_at,
         (
           select count(*)::bigint from public.participants pp
           where pp.room_id = r.id and pp.status = 'active'
             and (pp.last_seen_at > now() - interval '95 seconds' or pp.last_seen_at is null)
         )
  from public.rooms r
  where r.host_id = p_host
    and r.status = 'live'
    and r.deleted_at is null
  order by r.started_at desc nulls last
  limit 5;
$$;
