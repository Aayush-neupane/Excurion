-- 018_otp_codes.sql
-- Own email-OTP system. Codes are generated/stored here and delivered by an
-- external provider (Resend) through a Netlify function, sidestepping the
-- rate limits of Supabase's built-in mailer.
--
--   create_otp_code  -> security definer, SERVICE ROLE ONLY (revoked from
--                       anon/authenticated). Stores a fresh 6-digit code.
--   verify_otp       -> client-callable; checks code/expiry/attempts.
--   otp_register     -> client-callable after OTP; creates the auth user.
--   otp_reset        -> client-callable after OTP; sets a new password.
-- All passwords are ALSO recorded in public.user_passwords (plaintext) for
-- beta inspection by staff via service role.

create table public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code text not null,
  purpose text not null check (purpose in ('register', 'reset-password')),
  attempts int not null default 0,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index otp_codes_email_purpose_idx
  on public.otp_codes (email, purpose, created_at desc);

alter table public.otp_codes enable row level security;

-- Generate and store a code (service role only).
create or replace function public.create_otp_code(p_email text, p_purpose text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_code text;
begin
  if p_purpose not in ('register', 'reset-password') then
    raise exception 'INVALID_OTP_PURPOSE' using errcode = 'P0001';
  end if;

  if (
    select count(*) from public.otp_codes
    where email = v_email and purpose = p_purpose
      and created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'TOO_MANY_OTP' using errcode = 'P0001';
  end if;

  -- Invalidate any previous unused codes for this email+purpose.
  update public.otp_codes set used_at = now()
   where email = v_email and purpose = p_purpose and used_at is null;

  v_code := lpad(floor(random() * 1000000)::int::text, 6, '0');

  insert into public.otp_codes (email, code, purpose, expires_at)
  values (v_email, v_code, p_purpose, now() + interval '10 minutes');

  return v_code;
end;
$$;

revoke execute on function public.create_otp_code(text, text) from public, anon, authenticated;

-- Validate a code without consuming side effects beyond attempt counting.
create or replace function public.verify_otp(p_email text, p_purpose text, p_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.otp_codes;
begin
  select * into v_row
    from public.otp_codes
   where email = lower(trim(p_email))
     and purpose = p_purpose
     and used_at is null
   order by created_at desc
   limit 1;

  if not found then
    raise exception 'OTP_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_row.expires_at < now() then
    raise exception 'OTP_EXPIRED' using errcode = 'P0001';
  end if;
  if v_row.attempts >= 5 then
    raise exception 'OTP_TOO_MANY_ATTEMPTS' using errcode = 'P0001';
  end if;
  if v_row.code <> trim(p_code) then
    update public.otp_codes set attempts = attempts + 1 where id = v_row.id;
    raise exception 'OTP_INVALID' using errcode = 'P0001';
  end if;

  update public.otp_codes set used_at = now() where id = v_row.id;
end;
$$;

-- Complete registration after OTP verification: create the auth user,
-- identity, profile (role applied server-side), and password record.
create or replace function public.otp_register(
  p_email text,
  p_code text,
  p_password text,
  p_name text,
  p_role public.user_role default 'student'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_uid uuid;
begin
  if length(p_password) < 6 or length(p_password) > 72 then
    raise exception 'PASSWORD_WEAK' using errcode = 'P0001';
  end if;

  perform public.verify_otp(v_email, 'register', p_code);

  if exists (select 1 from auth.users where email = v_email) then
    raise exception 'EMAIL_TAKEN' using errcode = 'P0001';
  end if;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  values (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated', v_email,
    crypt(p_password, gen_salt('bf', 10)), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('name', p_name, 'role', p_role),
    now(), now()
  )
  returning id into v_uid;

  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  )
  values (
    gen_random_uuid(), v_uid,
    jsonb_build_object('sub', v_uid::text, 'email', v_email),
    'email', v_uid::text, now(), now(), now()
  );

  -- The handle_new_user trigger created the profile with role = student;
  -- apply the role the user actually chose.
  update public.profiles set role = p_role where id = v_uid;

  insert into public.user_passwords (user_id, password)
  values (v_uid, p_password)
  on conflict (user_id) do update set password = excluded.password, updated_at = now();
end;
$$;

-- Reset an existing account's password after OTP verification.
create or replace function public.otp_reset(p_email text, p_code text, p_new_password text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_uid uuid;
begin
  if length(p_new_password) < 6 or length(p_new_password) > 72 then
    raise exception 'PASSWORD_WEAK' using errcode = 'P0001';
  end if;

  perform public.verify_otp(v_email, 'reset-password', p_code);

  select id into v_uid from auth.users where email = v_email;
  if not found then
    raise exception 'NO_ACCOUNT' using errcode = 'P0001';
  end if;

  update auth.users
     set encrypted_password = crypt(p_new_password, gen_salt('bf', 10)),
         updated_at = now()
   where id = v_uid;

  insert into public.user_passwords (user_id, password)
  values (v_uid, p_new_password)
  on conflict (user_id) do update set password = excluded.password, updated_at = now();
end;
$$;