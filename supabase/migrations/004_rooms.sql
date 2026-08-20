-- 004_rooms.sql
-- Rooms are the core collaboration unit (a "class meeting" to the UI).
-- Meetings are scheduled sessions of a room (future scheduling/recording).
-- meeting_settings holds per-room collaboration configuration.

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  type public.room_type not null default 'class',
  subject text,
  room_code text not null unique,
  host_id uuid not null references public.profiles (id) on delete cascade,
  status public.room_status not null default 'live',
  privacy public.room_privacy not null default 'private',
  scheduled_at timestamptz,
  duration_minutes int check (duration_minutes > 0 and duration_minutes <= 1440),
  participant_limit int not null default 100 check (participant_limit between 1 and 1000),
  recording_url text,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint rooms_title_not_blank check (length(trim(title)) > 0),
  constraint rooms_code_format check (room_code ~ '^[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$')
);

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  title text not null,
  status public.room_status not null default 'scheduled',
  scheduled_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  recording_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meetings_title_not_blank check (length(trim(title)) > 0)
);

create table public.meeting_settings (
  room_id uuid primary key references public.rooms (id) on delete cascade,
  allow_screen_share boolean not null default true,
  allow_chat boolean not null default true,
  allow_messages_edit boolean not null default true,
  allow_raised_hands boolean not null default true,
  mute_on_entry boolean not null default false,
  waiting_room boolean not null default false,
  record_meeting boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists rooms_code_idx on public.rooms (room_code);
create index if not exists rooms_host_idx on public.rooms (host_id, status);
create index if not exists rooms_status_idx on public.rooms (status, scheduled_at);
create index if not exists meetings_room_idx on public.meetings (room_id, scheduled_at);

create trigger rooms_set_updated_at
  before update on public.rooms
  for each row execute function public.set_updated_at();

create trigger meetings_set_updated_at
  before update on public.meetings
  for each row execute function public.set_updated_at();

create trigger meeting_settings_set_updated_at
  before update on public.meeting_settings
  for each row execute function public.set_updated_at();

-- Room codes are short, unique and never reveal database ids.
create or replace function public.generate_room_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  alphabet constant text := 'abcdefghijklmnopqrstuvwxyz0123456789';
  code text;
begin
  loop
    code := '';
    for i in 1..4 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    code := code || '-' || (
      select string_agg(
        substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1), ''
      ) from generate_series(1, 4)
    );
    code := code || '-' || (
      select string_agg(
        substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1), ''
      ) from generate_series(1, 4)
    );
    exit when not exists (select 1 from public.rooms where room_code = code);
  end loop;
  return code;
end;
$$;