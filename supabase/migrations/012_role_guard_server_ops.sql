-- 012_role_guard_server_ops.sql
-- The role-change guard must only block CLIENT sessions. Server-side
-- operations (service-role, postgres, migration/seed scripts) carry no
-- auth.uid() and must be able to manage roles.
create or replace function public.assert_role_not_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and new.role is distinct from old.role then
    raise exception 'role changes must be made server-side';
  end if;
  return new;
end;
$$;