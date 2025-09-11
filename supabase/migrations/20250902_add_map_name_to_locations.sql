-- Add optional map_name column to locations table
DO $$ BEGIN
    ALTER TABLE "public"."locations" ADD COLUMN "map_name" text;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

COMMENT ON COLUMN "public"."locations"."map_name" IS 'Optional name identifier for the location on map displays';

-- Recreate sessions_view to include map_name
DROP VIEW IF EXISTS "public"."sessions_view";

CREATE VIEW "public"."sessions_view" WITH ("security_invoker"='on') AS
 SELECT "s"."id",
    "s"."title",
    "s"."host_1_id",
    "s"."start_time",
    "s"."end_time",
    "s"."description",
    "s"."max_capacity",
    "s"."location_id",
    "s"."host_2_id",
    "s"."host_3_id",
    "s"."min_capacity",
    "s"."ages",
    "s"."megagame",
    "s"."reserved_spots",
    "p1"."first_name" AS "host_1_first_name",
    "p1"."last_name" AS "host_1_last_name",
    "p1"."email" AS "host_1_email",
    "p2"."first_name" AS "host_2_first_name",
    "p2"."last_name" AS "host_2_last_name",
    "p2"."email" AS "host_2_email",
    "p3"."first_name" AS "host_3_first_name",
    "p3"."last_name" AS "host_3_last_name",
    "p3"."email" AS "host_3_email",
    "l"."name" AS "location_name",
    "l"."map_name" AS "location_map_name",
    "count"("sr"."session_id") AS "rsvp_count"
   FROM ((((("public"."sessions" "s"
     LEFT JOIN "public"."profiles" "p1" ON (("p1"."id" = "s"."host_1_id")))
     LEFT JOIN "public"."profiles" "p2" ON (("p2"."id" = "s"."host_2_id")))
     LEFT JOIN "public"."profiles" "p3" ON (("p3"."id" = "s"."host_3_id")))
     LEFT JOIN "public"."locations" "l" ON (("l"."id" = "s"."location_id")))
     LEFT JOIN "public"."session_rsvps" "sr" ON (("sr"."session_id" = "s"."id")))
  GROUP BY "s"."id", "p1"."first_name", "p1"."last_name", "p1"."email", "p2"."first_name", "p2"."last_name", "p2"."email", "p3"."first_name", "p3"."last_name", "p3"."email", "l"."name", "l"."map_name";