-- Add optional map_info JSON column to locations table
DO $$ BEGIN
    ALTER TABLE "public"."locations" ADD COLUMN "map_info" jsonb;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

COMMENT ON COLUMN "public"."locations"."map_info" IS 'JSON data containing map display information including id, name, path, center coordinates, and description';
