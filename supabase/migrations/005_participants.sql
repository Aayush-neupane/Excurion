-- 005_participants.sql
-- Who is (or was) in a room. Presence/media state is ephemeral and lives in
-- Realtime Presence; this table is the durable membership + read cursor.

-- Guard: a participant must exist before the room started.
create or replace function public.rooms_created_at(room_id uuid)
returns timestamptz
language sql
stable
set search_path = public
as $$
  select created_at from public.rooms where id = room_id
$$;

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  is_host boolean not null default false,
  mic public.device_state not null default 'unavailable',
  camera public.device_state not null default 'unavailable',
  screen_share boolean not null default false,
  speaking boolean not null default false,
  raised_hand boolean not null default false,
  connection public.connection_quality not null default 'good',
  last_read_at timestamptz,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  status public.participant_status not null default 'active',
  constraint participants_room_user_unique unique (room_id, user_id),
  constraint participants_joined_after_created check (joined_at >= rooms_created_at(room_id))
);

create index if not exists participants_room_idx on public.participants (room_id, status);
create index if not exists participants_user_idx on public.participants (user_id, status);