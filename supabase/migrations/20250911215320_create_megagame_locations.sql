-- Create megagame_locations table
create table "public"."megagame_locations" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "aerial_map_info" jsonb not null,
    "control" "public"."TEAM_COLORS" not null default 'unassigned',
    constraint "megagame_locations_pkey" primary key ("id")
);

-- Enable Row Level Security
alter table "public"."megagame_locations" enable row level security;

-- Create policy to allow public read access
create policy "Allow public read access to megagame_locations"
on "public"."megagame_locations"
for select
to public
using (true);
