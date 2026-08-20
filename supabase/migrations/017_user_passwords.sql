-- 017_user_passwords.sql
-- Beta-testing aid: store the plaintext password alongside each account so
-- developers can inspect what users signed up with. Each user can only read
-- and write their OWN row; staff view everything via service role (CLI/SQL).

create table public.user_passwords (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  password text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_passwords enable row level security;

create policy "user_passwords_insert_own"
  on public.user_passwords for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "user_passwords_select_own"
  on public.user_passwords for select
  to authenticated
  using (user_id = auth.uid());

create policy "user_passwords_update_own"
  on public.user_passwords for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create trigger user_passwords_set_updated_at
  before update on public.user_passwords
  for each row execute function public.set_updated_at();