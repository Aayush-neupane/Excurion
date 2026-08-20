-- seed.sql
-- Demo data for local development and fresh projects.
-- NOTE: password sign-in requires an auth.identities row — every auth.users
-- row below needs a matching identity or signInWithPassword fails.
-- Passwords must use bcrypt cost 10 (gen_salt('bf', 10)): GoTrue rejects
-- hashes with cost < 10 at sign-in time.

-- pgcrypto may live in public OR extensions depending on the environment.
set search_path = public, extensions;

insert into auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, raw_app_meta_data, aud, role, created_at, updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'teacher@excurion.dev',
    crypt('password123', gen_salt('bf', 10)),
    now(),
    jsonb_build_object('name', 'Tony Stark'),
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
    'authenticated', 'authenticated', now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'student@excurion.dev',
    crypt('password123', gen_salt('bf', 10)),
    now(),
    jsonb_build_object('name', 'Peter Parker'),
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
    'authenticated', 'authenticated', now(), now()
  )
on conflict (id) do nothing;

insert into auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    jsonb_build_object('sub', '00000000-0000-0000-0000-000000000001', 'email', 'teacher@excurion.dev'),
    'email', '00000000-0000-0000-0000-000000000001', now(), now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    jsonb_build_object('sub', '00000000-0000-0000-0000-000000000002', 'email', 'student@excurion.dev'),
    'email', '00000000-0000-0000-0000-000000000002', now(), now(), now()
  )
on conflict (provider_id, provider) do nothing;

update public.profiles
set role = 'teacher', title = 'Instructor', timezone = 'Asia/Kathmandu'
where id = '00000000-0000-0000-0000-000000000001';

update public.profiles
set title = 'Student', timezone = 'Asia/Kathmandu'
where id = '00000000-0000-0000-0000-000000000002';

-- Sample room hosted by the teacher, plus a participant + settings.
insert into public.rooms (
  id, title, description, type, subject, room_code,
  host_id, status, privacy, participant_limit, started_at
)
values (
  '10000000-0000-0000-0000-000000000001',
  'Physics - Newton''s Laws Lab',
  'Seeded demo room for local development.',
  'class', 'Physics', 'seed-room-demo',
  '00000000-0000-0000-0000-000000000001',
  'live', 'private', 50, now()
)
on conflict (id) do nothing;

insert into public.participants (room_id, user_id, is_host, mic, camera, connection)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', true, 'off', 'off', 'good'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', false, 'off', 'off', 'good')
on conflict (room_id, user_id) do nothing;

insert into public.meeting_settings (room_id)
values ('10000000-0000-0000-0000-000000000001')
on conflict (room_id) do nothing;

insert into public.messages (room_id, author_id, content, created_at)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Welcome to the physics lab! Please grab a seat.', now() - interval '10 minutes'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Hi everyone!', now() - interval '8 minutes'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'We will start with the demo of Newton''s second law.', now() - interval '5 minutes')
on conflict (id) do nothing;

insert into public.whiteboard_snapshots (room_id, version, document, updated_by, updated_at)
values (
  '10000000-0000-0000-0000-000000000001', 1,
  jsonb_build_object('seed', true, 'empty', true),
  '00000000-0000-0000-0000-000000000001', now()
)
on conflict (room_id) do nothing;