-- 003_profiles.sql
-- User profiles linked to Supabase Auth (auth.users is the source of truth).
-- Application role lives here, never trusted from the client.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role public.user_role not null default 'student',
  title text,
  bio text,
  timezone text not null default 'UTC',
  company text,
  avatar_url text,
  notification_preferences jsonb not null default jsonb_build_object(
    'email', jsonb_build_object('meetingReminders', true, 'recordings', true, 'weeklyDigest', false, 'account', true),
    'push', jsonb_build_object('meetingReminders', true, 'chat', false, 'raisedHands', true, 'recordings', true),
    'inApp', jsonb_build_object('meetings', true, 'chat', true, 'system', true)
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_lowercase check (email = lower(email))
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_email_idx on public.profiles (email);

-- Keep updated_at fresh on every write.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- A profile row is created automatically whenever a new auth user signs up.
-- Role defaults to student; teachers are approved by an admin or a
-- server-side function, never by the client.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    lower(new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();