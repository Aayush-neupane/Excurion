-- 002_enums.sql
-- Application-level enums used across tables.

create type public.user_role as enum ('student', 'teacher', 'admin');

create type public.room_type as enum ('class', '1on1', 'webinar', 'office-hours');

create type public.room_status as enum ('live', 'scheduled', 'ended', 'recording');

create type public.room_privacy as enum ('public', 'private', 'unlisted');

create type public.participant_status as enum ('active', 'left', 'removed');

create type public.device_state as enum ('on', 'off', 'unavailable');

create type public.connection_quality as enum ('excellent', 'good', 'fair', 'poor');

create type public.notification_kind as enum (
  'meeting',
  'reminder',
  'chat',
  'recording',
  'system',
  'warning'
);

create type public.message_status as enum ('active', 'edited', 'deleted');