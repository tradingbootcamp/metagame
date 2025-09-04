create type "public"."AGES" as enum ('ADULTS', 'KIDS', 'ALL');

create type "public"."OPENNODE_CHARGE_STATUS" as enum ('underpaid', 'refunded', 'processing', 'paid', 'expired');

create type "public"."SESSION_CATEGORY" as enum ('talk', 'workshop', 'game', 'other');

create type "public"."TEAM_COLORS" as enum ('orange', 'purple', 'green', 'unassigned');

create type "public"."ticket_type" as enum ('volunteer', 'player', 'supporter', 'friday', 'saturday', 'sunday', 'student');

create table "public"."coupon_emails" (
    "coupon_id" uuid not null,
    "email" text not null,
    "max_uses" integer not null default 1,
    "uses" bigint not null default '0'::bigint
);


alter table "public"."coupon_emails" enable row level security;

create table "public"."coupons" (
    "created_at" timestamp with time zone not null default now(),
    "coupon_code" text not null,
    "email_for" boolean not null default false,
    "max_uses" bigint,
    "used_count" bigint not null default '0'::bigint,
    "discount_amount_cents" bigint not null default '0'::bigint,
    "description" text default ''::text,
    "enabled" boolean not null default true,
    "id" uuid not null default gen_random_uuid()
);


alter table "public"."coupons" enable row level security;

create table "public"."locations" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null default 'default'::text,
    "lh_name" text,
    "capacity" bigint,
    "campus_location" text,
    "image_url" text,
    "thumbnail_url" text,
    "display_in_schedule" boolean not null default false,
    "schedule_display_order" bigint not null default '100'::bigint
);


alter table "public"."locations" enable row level security;

create table "public"."opennode_orders" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "status" text not null,
    "opennode_order_id" text not null,
    "purchaser_email" text,
    "satoshis" double precision not null,
    "ticket_type" ticket_type,
    "is_test" boolean not null,
    "purchaser_name" text
);


alter table "public"."opennode_orders" enable row level security;

create table "public"."profiles" (
    "id" uuid not null,
    "first_name" text,
    "last_name" text,
    "discord_handle" text,
    "email" text,
    "opted_in_to_homepage_display" boolean default false,
    "is_admin" boolean not null default false,
    "homepage_order" smallint,
    "site_name" text,
    "site_url" text,
    "site_name_2" text,
    "site_url_2" text,
    "profile_pictures_url" text,
    "dismissed_info_request" boolean not null default false,
    "minor" boolean,
    "bringing_kids" boolean,
    "team" "TEAM_COLORS" not null default 'unassigned'::"TEAM_COLORS",
    "bio" text
);


alter table "public"."profiles" enable row level security;

create table "public"."session_bookmarks" (
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "session_id" uuid not null
);


alter table "public"."session_bookmarks" enable row level security;

create table "public"."session_rsvps" (
    "created_at" timestamp with time zone not null default now(),
    "session_id" uuid not null,
    "user_id" uuid not null,
    "on_waitlist" boolean not null default false
);


alter table "public"."session_rsvps" enable row level security;

create table "public"."sessions" (
    "id" uuid not null default gen_random_uuid(),
    "title" text,
    "host_1_id" uuid,
    "start_time" timestamp with time zone,
    "end_time" timestamp with time zone,
    "description" text,
    "max_capacity" integer,
    "location_id" uuid,
    "host_2_id" uuid,
    "host_3_id" uuid,
    "min_capacity" bigint,
    "ages" "AGES",
    "megagame" boolean not null default false,
    "reserved_spots" integer not null default 0,
    "category" "SESSION_CATEGORY"
);


alter table "public"."sessions" enable row level security;

create table "public"."tickets" (
    "created_at" timestamp with time zone not null default now(),
    "purchaser_email" text,
    "owner_id" uuid default gen_random_uuid(),
    "ticket_type" ticket_type not null,
    "price_paid" double precision,
    "coupons_used" text[] not null default '{}'::text[],
    "ticket_code" text not null,
    "id" uuid not null default gen_random_uuid(),
    "stripe_payment_id" text,
    "is_test" boolean not null,
    "opennode_order" uuid,
    "satoshis_paid" bigint,
    "admin_issued" boolean not null default false,
    "purchaser_name" text
);


alter table "public"."tickets" enable row level security;

CREATE UNIQUE INDEX coupon_emails_pkey ON public.coupon_emails USING btree (coupon_id, email);

CREATE UNIQUE INDEX coupons_coupon_code_key ON public.coupons USING btree (coupon_code);

CREATE UNIQUE INDEX coupons_pkey ON public.coupons USING btree (id);

CREATE UNIQUE INDEX locations_pkey ON public.locations USING btree (id);

CREATE UNIQUE INDEX opennode_orders_pkey ON public.opennode_orders USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX session_rsvps_pkey ON public.session_rsvps USING btree (session_id, user_id);

CREATE UNIQUE INDEX sessions_pkey ON public.sessions USING btree (id);

CREATE UNIQUE INDEX tickets_pkey ON public.tickets USING btree (id);

CREATE UNIQUE INDEX tickets_ticket_code_key ON public.tickets USING btree (ticket_code);

CREATE UNIQUE INDEX user_starred_sessions_pkey ON public.session_bookmarks USING btree (user_id, session_id);

alter table "public"."coupon_emails" add constraint "coupon_emails_pkey" PRIMARY KEY using index "coupon_emails_pkey";

alter table "public"."coupons" add constraint "coupons_pkey" PRIMARY KEY using index "coupons_pkey";

alter table "public"."locations" add constraint "locations_pkey" PRIMARY KEY using index "locations_pkey";

alter table "public"."opennode_orders" add constraint "opennode_orders_pkey" PRIMARY KEY using index "opennode_orders_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."session_bookmarks" add constraint "user_starred_sessions_pkey" PRIMARY KEY using index "user_starred_sessions_pkey";

alter table "public"."session_rsvps" add constraint "session_rsvps_pkey" PRIMARY KEY using index "session_rsvps_pkey";

alter table "public"."sessions" add constraint "sessions_pkey" PRIMARY KEY using index "sessions_pkey";

alter table "public"."tickets" add constraint "tickets_pkey" PRIMARY KEY using index "tickets_pkey";

alter table "public"."coupon_emails" add constraint "coupon_emails_coupon_id_fkey" FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."coupon_emails" validate constraint "coupon_emails_coupon_id_fkey";

alter table "public"."coupons" add constraint "coupons_coupon_code_key" UNIQUE using index "coupons_coupon_code_key";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."session_bookmarks" add constraint "session_bookmarks_session_id_fkey" FOREIGN KEY (session_id) REFERENCES sessions(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."session_bookmarks" validate constraint "session_bookmarks_session_id_fkey";

alter table "public"."session_bookmarks" add constraint "session_bookmarks_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."session_bookmarks" validate constraint "session_bookmarks_user_id_fkey";

alter table "public"."session_rsvps" add constraint "session_rsvps_session_id_fkey" FOREIGN KEY (session_id) REFERENCES sessions(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."session_rsvps" validate constraint "session_rsvps_session_id_fkey";

alter table "public"."session_rsvps" add constraint "session_rsvps_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."session_rsvps" validate constraint "session_rsvps_user_id_fkey";

alter table "public"."sessions" add constraint "sessions_host_1_id_fkey" FOREIGN KEY (host_1_id) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."sessions" validate constraint "sessions_host_1_id_fkey";

alter table "public"."sessions" add constraint "sessions_host_2_id_fkey" FOREIGN KEY (host_2_id) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."sessions" validate constraint "sessions_host_2_id_fkey";

alter table "public"."sessions" add constraint "sessions_host_3_id_fkey" FOREIGN KEY (host_3_id) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."sessions" validate constraint "sessions_host_3_id_fkey";

alter table "public"."sessions" add constraint "sessions_location_id_fkey" FOREIGN KEY (location_id) REFERENCES locations(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."sessions" validate constraint "sessions_location_id_fkey";

alter table "public"."tickets" add constraint "tickets_opennode_order_fkey" FOREIGN KEY (opennode_order) REFERENCES opennode_orders(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."tickets" validate constraint "tickets_opennode_order_fkey";

alter table "public"."tickets" add constraint "tickets_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."tickets" validate constraint "tickets_owner_id_fkey";

alter table "public"."tickets" add constraint "tickets_ticket_code_key" UNIQUE using index "tickets_ticket_code_key";

set check_function_bodies = off;

create or replace view "public"."coupon_emails_view" as  SELECT ce.coupon_id,
    ce.email,
    ce.max_uses,
    ce.uses,
    c.coupon_code
   FROM (coupon_emails ce
     LEFT JOIN coupons c ON ((c.id = ce.coupon_id)));


CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$begin
  insert into public.profiles (id, first_name, last_name, email)
  values (new.id, new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name', new.email );
  return new;
end;$function$
;

create or replace view "public"."session_rsvps_view" as  SELECT sr.created_at,
    sr.session_id,
    sr.user_id,
    u.email,
    s.title
   FROM ((session_rsvps sr
     LEFT JOIN auth.users u ON ((sr.user_id = u.id)))
     LEFT JOIN sessions s ON ((sr.session_id = s.id)));


create or replace view "public"."sessions_view" as  SELECT s.id,
    s.title,
    s.host_1_id,
    s.start_time,
    s.end_time,
    s.description,
    s.max_capacity,
    s.location_id,
    s.host_2_id,
    s.host_3_id,
    s.min_capacity,
    s.ages,
    s.megagame,
    p1.first_name AS host_1_first_name,
    p1.last_name AS host_1_last_name,
    p1.email AS host_1_email,
    p2.first_name AS host_2_first_name,
    p2.last_name AS host_2_last_name,
    p2.email AS host_2_email,
    p3.first_name AS host_3_first_name,
    p3.last_name AS host_3_last_name,
    p3.email AS host_3_email,
    l.name AS location_name,
    count(sr.session_id) AS rsvp_count
   FROM (((((sessions s
     LEFT JOIN profiles p1 ON ((p1.id = s.host_1_id)))
     LEFT JOIN profiles p2 ON ((p2.id = s.host_2_id)))
     LEFT JOIN profiles p3 ON ((p3.id = s.host_3_id)))
     LEFT JOIN locations l ON ((l.id = s.location_id)))
     LEFT JOIN session_rsvps sr ON ((sr.session_id = s.id)))
  GROUP BY s.id, p1.first_name, p1.last_name, p1.email, p2.first_name, p2.last_name, p2.email, p3.first_name, p3.last_name, p3.email, l.name;


CREATE OR REPLACE FUNCTION public.sync_user_profile_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  update profiles
  set email = new.email
  where id = new.id; -- or your join key
  return new;
end;
$function$
;

grant delete on table "public"."coupon_emails" to "anon";

grant insert on table "public"."coupon_emails" to "anon";

grant references on table "public"."coupon_emails" to "anon";

grant select on table "public"."coupon_emails" to "anon";

grant trigger on table "public"."coupon_emails" to "anon";

grant truncate on table "public"."coupon_emails" to "anon";

grant update on table "public"."coupon_emails" to "anon";

grant delete on table "public"."coupon_emails" to "authenticated";

grant insert on table "public"."coupon_emails" to "authenticated";

grant references on table "public"."coupon_emails" to "authenticated";

grant select on table "public"."coupon_emails" to "authenticated";

grant trigger on table "public"."coupon_emails" to "authenticated";

grant truncate on table "public"."coupon_emails" to "authenticated";

grant update on table "public"."coupon_emails" to "authenticated";

grant delete on table "public"."coupon_emails" to "service_role";

grant insert on table "public"."coupon_emails" to "service_role";

grant references on table "public"."coupon_emails" to "service_role";

grant select on table "public"."coupon_emails" to "service_role";

grant trigger on table "public"."coupon_emails" to "service_role";

grant truncate on table "public"."coupon_emails" to "service_role";

grant update on table "public"."coupon_emails" to "service_role";

grant delete on table "public"."coupons" to "anon";

grant insert on table "public"."coupons" to "anon";

grant references on table "public"."coupons" to "anon";

grant select on table "public"."coupons" to "anon";

grant trigger on table "public"."coupons" to "anon";

grant truncate on table "public"."coupons" to "anon";

grant update on table "public"."coupons" to "anon";

grant delete on table "public"."coupons" to "authenticated";

grant insert on table "public"."coupons" to "authenticated";

grant references on table "public"."coupons" to "authenticated";

grant select on table "public"."coupons" to "authenticated";

grant trigger on table "public"."coupons" to "authenticated";

grant truncate on table "public"."coupons" to "authenticated";

grant update on table "public"."coupons" to "authenticated";

grant delete on table "public"."coupons" to "service_role";

grant insert on table "public"."coupons" to "service_role";

grant references on table "public"."coupons" to "service_role";

grant select on table "public"."coupons" to "service_role";

grant trigger on table "public"."coupons" to "service_role";

grant truncate on table "public"."coupons" to "service_role";

grant update on table "public"."coupons" to "service_role";

grant delete on table "public"."locations" to "anon";

grant insert on table "public"."locations" to "anon";

grant references on table "public"."locations" to "anon";

grant select on table "public"."locations" to "anon";

grant trigger on table "public"."locations" to "anon";

grant truncate on table "public"."locations" to "anon";

grant update on table "public"."locations" to "anon";

grant delete on table "public"."locations" to "authenticated";

grant insert on table "public"."locations" to "authenticated";

grant references on table "public"."locations" to "authenticated";

grant select on table "public"."locations" to "authenticated";

grant trigger on table "public"."locations" to "authenticated";

grant truncate on table "public"."locations" to "authenticated";

grant update on table "public"."locations" to "authenticated";

grant delete on table "public"."locations" to "service_role";

grant insert on table "public"."locations" to "service_role";

grant references on table "public"."locations" to "service_role";

grant select on table "public"."locations" to "service_role";

grant trigger on table "public"."locations" to "service_role";

grant truncate on table "public"."locations" to "service_role";

grant update on table "public"."locations" to "service_role";

grant delete on table "public"."opennode_orders" to "anon";

grant insert on table "public"."opennode_orders" to "anon";

grant references on table "public"."opennode_orders" to "anon";

grant select on table "public"."opennode_orders" to "anon";

grant trigger on table "public"."opennode_orders" to "anon";

grant truncate on table "public"."opennode_orders" to "anon";

grant update on table "public"."opennode_orders" to "anon";

grant delete on table "public"."opennode_orders" to "authenticated";

grant insert on table "public"."opennode_orders" to "authenticated";

grant references on table "public"."opennode_orders" to "authenticated";

grant select on table "public"."opennode_orders" to "authenticated";

grant trigger on table "public"."opennode_orders" to "authenticated";

grant truncate on table "public"."opennode_orders" to "authenticated";

grant update on table "public"."opennode_orders" to "authenticated";

grant delete on table "public"."opennode_orders" to "service_role";

grant insert on table "public"."opennode_orders" to "service_role";

grant references on table "public"."opennode_orders" to "service_role";

grant select on table "public"."opennode_orders" to "service_role";

grant trigger on table "public"."opennode_orders" to "service_role";

grant truncate on table "public"."opennode_orders" to "service_role";

grant update on table "public"."opennode_orders" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."session_bookmarks" to "anon";

grant insert on table "public"."session_bookmarks" to "anon";

grant references on table "public"."session_bookmarks" to "anon";

grant select on table "public"."session_bookmarks" to "anon";

grant trigger on table "public"."session_bookmarks" to "anon";

grant truncate on table "public"."session_bookmarks" to "anon";

grant update on table "public"."session_bookmarks" to "anon";

grant delete on table "public"."session_bookmarks" to "authenticated";

grant insert on table "public"."session_bookmarks" to "authenticated";

grant references on table "public"."session_bookmarks" to "authenticated";

grant select on table "public"."session_bookmarks" to "authenticated";

grant trigger on table "public"."session_bookmarks" to "authenticated";

grant truncate on table "public"."session_bookmarks" to "authenticated";

grant update on table "public"."session_bookmarks" to "authenticated";

grant delete on table "public"."session_bookmarks" to "service_role";

grant insert on table "public"."session_bookmarks" to "service_role";

grant references on table "public"."session_bookmarks" to "service_role";

grant select on table "public"."session_bookmarks" to "service_role";

grant trigger on table "public"."session_bookmarks" to "service_role";

grant truncate on table "public"."session_bookmarks" to "service_role";

grant update on table "public"."session_bookmarks" to "service_role";

grant delete on table "public"."session_rsvps" to "anon";

grant insert on table "public"."session_rsvps" to "anon";

grant references on table "public"."session_rsvps" to "anon";

grant select on table "public"."session_rsvps" to "anon";

grant trigger on table "public"."session_rsvps" to "anon";

grant truncate on table "public"."session_rsvps" to "anon";

grant update on table "public"."session_rsvps" to "anon";

grant delete on table "public"."session_rsvps" to "authenticated";

grant insert on table "public"."session_rsvps" to "authenticated";

grant references on table "public"."session_rsvps" to "authenticated";

grant select on table "public"."session_rsvps" to "authenticated";

grant trigger on table "public"."session_rsvps" to "authenticated";

grant truncate on table "public"."session_rsvps" to "authenticated";

grant update on table "public"."session_rsvps" to "authenticated";

grant delete on table "public"."session_rsvps" to "service_role";

grant insert on table "public"."session_rsvps" to "service_role";

grant references on table "public"."session_rsvps" to "service_role";

grant select on table "public"."session_rsvps" to "service_role";

grant trigger on table "public"."session_rsvps" to "service_role";

grant truncate on table "public"."session_rsvps" to "service_role";

grant update on table "public"."session_rsvps" to "service_role";

grant delete on table "public"."sessions" to "anon";

grant insert on table "public"."sessions" to "anon";

grant references on table "public"."sessions" to "anon";

grant select on table "public"."sessions" to "anon";

grant trigger on table "public"."sessions" to "anon";

grant truncate on table "public"."sessions" to "anon";

grant update on table "public"."sessions" to "anon";

grant delete on table "public"."sessions" to "authenticated";

grant insert on table "public"."sessions" to "authenticated";

grant references on table "public"."sessions" to "authenticated";

grant select on table "public"."sessions" to "authenticated";

grant trigger on table "public"."sessions" to "authenticated";

grant truncate on table "public"."sessions" to "authenticated";

grant update on table "public"."sessions" to "authenticated";

grant delete on table "public"."sessions" to "service_role";

grant insert on table "public"."sessions" to "service_role";

grant references on table "public"."sessions" to "service_role";

grant select on table "public"."sessions" to "service_role";

grant trigger on table "public"."sessions" to "service_role";

grant truncate on table "public"."sessions" to "service_role";

grant update on table "public"."sessions" to "service_role";

grant delete on table "public"."tickets" to "anon";

grant insert on table "public"."tickets" to "anon";

grant references on table "public"."tickets" to "anon";

grant select on table "public"."tickets" to "anon";

grant trigger on table "public"."tickets" to "anon";

grant truncate on table "public"."tickets" to "anon";

grant update on table "public"."tickets" to "anon";

grant delete on table "public"."tickets" to "authenticated";

grant insert on table "public"."tickets" to "authenticated";

grant references on table "public"."tickets" to "authenticated";

grant select on table "public"."tickets" to "authenticated";

grant trigger on table "public"."tickets" to "authenticated";

grant truncate on table "public"."tickets" to "authenticated";

grant update on table "public"."tickets" to "authenticated";

grant delete on table "public"."tickets" to "service_role";

grant insert on table "public"."tickets" to "service_role";

grant references on table "public"."tickets" to "service_role";

grant select on table "public"."tickets" to "service_role";

grant trigger on table "public"."tickets" to "service_role";

grant truncate on table "public"."tickets" to "service_role";

grant update on table "public"."tickets" to "service_role";



