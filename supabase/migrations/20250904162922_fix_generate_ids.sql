-- Replaces generate unique player id function so it can properly reference profiles table
create or replace function public.generate_unique_player_id()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  new_id integer;
  max_attempts integer := 1000;
  attempt_count integer := 0;
begin
  loop
    attempt_count := attempt_count + 1;
    if attempt_count > max_attempts then
      raise exception 'Could not generate unique player_id after % attempts', max_attempts;
    end if;

    -- Random 4-digit number (1000–9999)
    new_id := floor(random() * 9000 + 1000)::integer;

    -- IMPORTANT: schema-qualify the table
    if not exists (select 1 from public.profiles where player_id = new_id) then
      return new_id;
    end if;
  end loop;
end;
$$;