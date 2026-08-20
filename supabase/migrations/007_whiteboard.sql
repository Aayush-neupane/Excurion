-- 007_whiteboard.sql
-- Durable canvas state. High-frequency drawing travels over Realtime
-- Broadcast (ephemeral); the client persists debounced snapshots here.

create table public.whiteboard_snapshots (
  room_id uuid primary key references public.rooms (id) on delete cascade,
  version bigint not null default 1,
  document jsonb not null default 'null'::jsonb,
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists whiteboard_snapshots_updated_idx
  on public.whiteboard_snapshots (updated_at desc);

create trigger whiteboard_snapshots_set_updated_at
  before update on public.whiteboard_snapshots
  for each row execute function public.set_updated_at();

-- Serialize snapshot writes (bespoke: upsert with version bump).
create or replace function public.save_whiteboard_snapshot(
  p_room_id uuid,
  p_document jsonb,
  p_version bigint
)
returns public.whiteboard_snapshots
language plpgsql
security invoker
set search_path = public
as $$
declare
  result public.whiteboard_snapshots;
begin
  insert into public.whiteboard_snapshots (room_id, version, document, updated_by, updated_at)
  values (p_room_id, p_version, p_document, auth.uid(), now())
  on conflict (room_id) do update
    set document = excluded.document,
        version = excluded.version,
        updated_by = excluded.updated_by,
        updated_at = now()
  returning * into result;
  return result;
end;
$$;