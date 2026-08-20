-- 021_otp_register_token_defaults.sql
-- otp_register left auth.users token columns NULL (email_change,
-- confirmation_token, recovery_token, ...). GoTrue sign-in then fails with
-- "Database error querying schema". The admin API writes '' for these;
-- mirror that.

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
set search_path = public, extensions
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
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    email_change, phone_change, recovery_token, confirmation_token,
    email_change_token_new, email_change_token_current,
    reauthentication_token, phone_change_token
  )
  values (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated', v_email,
    crypt(p_password, gen_salt('bf', 10)), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('name', p_name, 'role', p_role),
    now(), now(),
    '', '', '', '', '', '', '', ''
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
  -- apply the role the user actually chose (server-side bypass flag).
  perform set_config('excurion.internal_role_grant', 'on', true);
  update public.profiles set role = p_role where id = v_uid;
  perform set_config('excurion.internal_role_grant', 'off', true);

  insert into public.user_passwords (user_id, password)
  values (v_uid, p_password)
  on conflict (user_id) do update set password = excluded.password, updated_at = now();
end;
$$;