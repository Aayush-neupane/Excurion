-- 016_fix_message_author.sql
-- The client inserts messages without author_id (it is derived from the
-- session). RLS required author_id = auth.uid(), so those inserts were
-- rejected. A BEFORE INSERT trigger stamps the caller's id before the
-- RLS check runs; mirrors the pattern for chat as 013 did for notifications.

create or replace function public.messages_stamp_author()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.author_id is null then
    new.author_id := auth.uid();
  end if;
  return new;
end;
$$;

create trigger messages_stamp_author_trigger
  before insert on public.messages
  for each row execute function public.messages_stamp_author();