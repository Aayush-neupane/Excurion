-- 006_messages.sql
-- Persistent chat for a room. Realtime (Postgres Changes) streams new rows
-- to authorized participants; history is loaded with keyset pagination.

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  status public.message_status not null default 'active',
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz,
  constraint messages_content_not_blank check (length(trim(content)) > 0)
);

create index if not exists messages_room_created_idx
  on public.messages (room_id, created_at desc, id);

-- Edge-triggered helper: room participant count (used by services/stats).
create or replace function public.room_participant_count(room_id uuid)
returns int
language sql
stable
set search_path = public
as $$
  select count(*)::int
  from public.participants
  where participants.room_id = room_participant_count.room_id
    and status = 'active'
$$;