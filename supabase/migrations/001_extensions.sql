-- 001_extensions.sql
-- Core extensions required by the schema.

create extension if not exists pgcrypto;

-- gen_random_uuid() is built into Postgres 13+, pgcrypto is kept for
-- crypt() usage in seed data and any future password-related tooling.