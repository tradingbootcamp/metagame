-- Add megagame_location column to sessions table
alter table "public"."sessions" 
add column "megagame_location" uuid references "public"."megagame_locations"("id");