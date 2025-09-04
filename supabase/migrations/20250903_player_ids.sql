-- Step 1: Add player_id column as nullable
alter table public.profiles add column player_id integer;

-- Step 2: Create a function to generate unique 4-digit player IDs
create or replace function generate_unique_player_id()
returns integer
language plpgsql
as $$
declare
    new_id integer;
    max_attempts integer := 1000;
    attempt_count integer := 0;
begin
    loop
        -- Generate a random 4-digit number (1000-9999)
        new_id := floor(random() * 9000 + 1000)::integer;
        
        -- Check if this ID already exists
        if not exists (select 1 from profiles where player_id = new_id) then
            return new_id;
        end if;
        
        -- Prevent infinite loop
        attempt_count := attempt_count + 1;
        if attempt_count >= max_attempts then
            raise exception 'Unable to generate unique player_id after % attempts', max_attempts;
        end if;
    end loop;
end;
$$;

-- Step 3: Populate existing rows with unique player IDs
update public.profiles 
set player_id = generate_unique_player_id()
where player_id is null;

-- Step 4: Add NOT NULL constraint
alter table public.profiles alter column player_id set not null;

-- Step 5: Add UNIQUE constraint
alter table public.profiles add constraint profiles_player_id_unique unique (player_id);

-- Step 6: Create unique index for performance
create unique index profiles_player_id_idx on public.profiles using btree (player_id);

-- Step 7: Update the handle_new_user function to assign player_id on user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  insert into public.profiles (id, first_name, last_name, email, player_id)
  values (
    new.id, 
    new.raw_user_meta_data ->> 'first_name', 
    new.raw_user_meta_data ->> 'last_name', 
    new.email,
    public.generate_unique_player_id()
  );
  return new;
end;
$$;

-- Step 8: The generate_unique_player_id() function is kept for ongoing use in the signup pipeline