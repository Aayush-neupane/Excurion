-- 008_notifications.sql
-- In-app notification inbox. Realtime (Postgres Changes) delivers
-- instantly; email/push delivery hooks are future work.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind public.notification_kind not null default 'system',
  title text not null,
  body text not null default '',
  read boolean not null default false,
  link text,
  created_at timestamptz not null default now(),
  constraint notifications_title_not_blank check (length(trim(title)) > 0)
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

-- RPC that inserts a notification only for the calling user.
-- Host-triggered notifications (e.g. room invitation) go through
-- Netlify Functions with the service-role key instead.
create or replace function public.create_own_notification(
  p_kind public.notification_kind,
  p_title text,
  p_body text default '',
  p_link text default null
)
returns public.notifications
language plpgsql
security invoker
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