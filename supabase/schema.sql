

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."user_role" AS ENUM (
    'user',
    'admin',
    'super_admin',
    'editor',
    'viewer'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_permission"("user_uuid" "uuid", "permission" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_uuid
    AND (
      role = 'super_admin' OR
      (role IN ('admin', 'editor') AND permissions->>permission = 'true')
    )
    AND is_active = true
  );
END;
$$;


ALTER FUNCTION "public"."has_permission"("user_uuid" "uuid", "permission" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("user_uuid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_uuid
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  );
END;
$$;


ALTER FUNCTION "public"."is_admin"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_modified_column"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  IF (NEW.* IS DISTINCT FROM OLD.*) THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_modified_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "id" integer NOT NULL,
    "tour_id" integer,
    "customer_name" character varying(255) NOT NULL,
    "customer_email" character varying(255) NOT NULL,
    "customer_phone" character varying(50),
    "number_of_guests" integer NOT NULL,
    "booking_date" "date" NOT NULL,
    "special_requests" "text",
    "status" character varying(50) DEFAULT 'pending'::character varying,
    "booking_reference" character varying(100),
    "total_amount" numeric(10,2),
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "payment_status" character varying(50) DEFAULT 'pending'::character varying,
    CONSTRAINT "bookings_payment_status_check" CHECK ((("payment_status")::"text" = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'refunded'::character varying])::"text"[])))
);


ALTER TABLE "public"."bookings" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."bookings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."bookings_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."bookings_id_seq" OWNED BY "public"."bookings"."id";



CREATE TABLE IF NOT EXISTS "public"."clients" (
    "id" integer NOT NULL,
    "name" character varying(255) NOT NULL,
    "email" character varying(255) NOT NULL,
    "phone" character varying(50),
    "country" character varying(100),
    "total_bookings" integer DEFAULT 0,
    "total_spent" numeric(10,2) DEFAULT 0,
    "last_booking_date" "date",
    "preferences" "text"[],
    "notes" "text",
    "status" character varying(50) DEFAULT 'active'::character varying,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "clients_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::"text"[])))
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."clients_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."clients_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."clients_id_seq" OWNED BY "public"."clients"."id";



CREATE TABLE IF NOT EXISTS "public"."contact_messages" (
    "id" integer NOT NULL,
    "name" character varying(255) NOT NULL,
    "email" character varying(255) NOT NULL,
    "subject" character varying(255) NOT NULL,
    "message" "text" NOT NULL,
    "status" character varying(50) DEFAULT 'new'::character varying,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."contact_messages" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."contact_messages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."contact_messages_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."contact_messages_id_seq" OWNED BY "public"."contact_messages"."id";



CREATE TABLE IF NOT EXISTS "public"."international_driving_license_applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text",
    "email" "text",
    "payment_status" "text",
    "tracking_id" "text",
    "license_front_url" "text",
    "passport_page_url" "text",
    "personal_photo_url" "text",
    "type" "text",
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "address" "text",
    "dateOfBirth" "date",
    "idCopyUrl" "text",
    "nationality" "text",
    "phone" numeric,
    "status" "text"
);


ALTER TABLE "public"."international_driving_license_applications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."newsletter_subscribers" (
    "id" integer NOT NULL,
    "email" character varying(255) NOT NULL,
    "status" character varying(50) DEFAULT 'active'::character varying,
    "subscribed_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."newsletter_subscribers" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."newsletter_subscribers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."newsletter_subscribers_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."newsletter_subscribers_id_seq" OWNED BY "public"."newsletter_subscribers"."id";



CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" integer NOT NULL,
    "title" character varying(255) NOT NULL,
    "content" "text" NOT NULL,
    "excerpt" "text",
    "featured_image" character varying(500),
    "author_id" integer,
    "author_name" character varying(255),
    "category" character varying(100),
    "tags" "text"[],
    "published" boolean DEFAULT false,
    "featured" boolean DEFAULT false,
    "seo_title" character varying(255),
    "seo_description" "text",
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."posts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."posts_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."posts_id_seq" OWNED BY "public"."posts"."id";



CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" integer NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "price" numeric(10,2) NOT NULL,
    "category" character varying(100) NOT NULL,
    "images" "text"[],
    "specifications" "jsonb",
    "stock_quantity" integer DEFAULT 0,
    "sku" character varying(100),
    "featured" boolean DEFAULT false,
    "status" character varying(50) DEFAULT 'active'::character varying,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "products_category_check" CHECK ((("category")::"text" = ANY ((ARRAY['esim'::character varying, 'gear'::character varying, 'souvenir'::character varying, 'guide'::character varying])::"text"[]))),
    CONSTRAINT "products_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'out_of_stock'::character varying])::"text"[])))
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."products_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."products_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."products_id_seq" OWNED BY "public"."products"."id";



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tours" (
    "id" integer NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "price" numeric(10,2) NOT NULL,
    "duration" character varying(100),
    "image" character varying(500),
    "featured" boolean DEFAULT false,
    "category" character varying(100),
    "itinerary" "text"[],
    "included" "text"[],
    "max_guests" integer DEFAULT 10,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "gallery" "text"[],
    "excluded" "text"[],
    "difficulty_level" character varying(50),
    "location" character varying(255),
    "available_dates" "date"[],
    "status" character varying(50) DEFAULT 'active'::character varying,
    CONSTRAINT "tours_difficulty_level_check" CHECK ((("difficulty_level")::"text" = ANY ((ARRAY['easy'::character varying, 'moderate'::character varying, 'challenging'::character varying, 'extreme'::character varying])::"text"[]))),
    CONSTRAINT "tours_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'draft'::character varying])::"text"[])))
);


ALTER TABLE "public"."tours" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."tours_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."tours_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."tours_id_seq" OWNED BY "public"."tours"."id";



CREATE TABLE IF NOT EXISTS "public"."travel_packages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "destination" "text" NOT NULL,
    "price" numeric NOT NULL,
    "duration" "text" NOT NULL,
    "cover_photo_url" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."travel_packages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trip_com_bookings" (
    "id" bigint NOT NULL,
    "booking_id" "text" NOT NULL,
    "user_id" "uuid",
    "destination" "text" NOT NULL,
    "check_in_date" "date" NOT NULL,
    "check_out_date" "date" NOT NULL,
    "guests" integer NOT NULL,
    "rooms" integer NOT NULL,
    "package_id" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "total_price" numeric(10,2),
    "currency" "text" DEFAULT 'USD'::"text",
    "confirmation_code" "text",
    "hotel_details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."trip_com_bookings" OWNER TO "postgres";


ALTER TABLE "public"."trip_com_bookings" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."trip_com_bookings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."trip_com_search_logs" (
    "id" bigint NOT NULL,
    "user_id" "uuid",
    "destination" "text" NOT NULL,
    "check_in_date" "date" NOT NULL,
    "check_out_date" "date" NOT NULL,
    "guests" integer NOT NULL,
    "rooms" integer NOT NULL,
    "price_range" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."trip_com_search_logs" OWNER TO "postgres";


ALTER TABLE "public"."trip_com_search_logs" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."trip_com_search_logs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" integer NOT NULL,
    "email" character varying(255) NOT NULL,
    "name" character varying(255) NOT NULL,
    "password_hash" character varying(255) NOT NULL,
    "role" character varying(50) DEFAULT 'admin'::character varying,
    "avatar" character varying(500),
    "status" character varying(50) DEFAULT 'active'::character varying,
    "last_login" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_role_check" CHECK ((("role")::"text" = ANY ((ARRAY['super_admin'::character varying, 'admin'::character varying, 'editor'::character varying, 'client'::character varying])::"text"[]))),
    CONSTRAINT "users_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'suspended'::character varying])::"text"[])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."users_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."users_id_seq" OWNED BY "public"."users"."id";



CREATE TABLE IF NOT EXISTS "public"."visa-offers" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "country" "text",
    "cover_photo_url" "text",
    "duration" "text",
    "price" numeric,
    "requirements" "text",
    "visa_type" "text"
);


ALTER TABLE "public"."visa-offers" OWNER TO "postgres";


ALTER TABLE "public"."visa-offers" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."visa-offers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."visa_applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text",
    "email" "text",
    "payment_status" "text",
    "tracking_id" "text",
    "application_data" "jsonb",
    "files_urls" "text"[],
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text"
);


ALTER TABLE "public"."visa_applications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."visa_offers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "country" "text" NOT NULL,
    "visa_type" "text" NOT NULL,
    "duration" "text" NOT NULL,
    "price" numeric NOT NULL,
    "requirements" "text" NOT NULL,
    "cover_photo_url" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."visa_offers" OWNER TO "postgres";


ALTER TABLE ONLY "public"."bookings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."bookings_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."clients" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."clients_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."contact_messages" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."contact_messages_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."newsletter_subscribers" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."newsletter_subscribers_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."posts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."posts_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."products" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."products_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."tours" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."tours_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."users" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."users_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_booking_reference_key" UNIQUE ("booking_reference");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_messages"
    ADD CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."international_driving_license_applications"
    ADD CONSTRAINT "international_driving_license_applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."newsletter_subscribers"
    ADD CONSTRAINT "newsletter_subscribers_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."newsletter_subscribers"
    ADD CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_sku_key" UNIQUE ("sku");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tours"
    ADD CONSTRAINT "tours_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."travel_packages"
    ADD CONSTRAINT "travel_packages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trip_com_bookings"
    ADD CONSTRAINT "trip_com_bookings_booking_id_key" UNIQUE ("booking_id");



ALTER TABLE ONLY "public"."trip_com_bookings"
    ADD CONSTRAINT "trip_com_bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trip_com_search_logs"
    ADD CONSTRAINT "trip_com_search_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."visa-offers"
    ADD CONSTRAINT "visa-offers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."visa_applications"
    ADD CONSTRAINT "visa_applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."visa_offers"
    ADD CONSTRAINT "visa_offers_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_bookings_customer_email" ON "public"."bookings" USING "btree" ("customer_email");



CREATE INDEX "idx_bookings_status" ON "public"."bookings" USING "btree" ("status");



CREATE INDEX "idx_bookings_tour_id" ON "public"."bookings" USING "btree" ("tour_id");



CREATE INDEX "idx_clients_email" ON "public"."clients" USING "btree" ("email");



CREATE INDEX "idx_clients_status" ON "public"."clients" USING "btree" ("status");



CREATE INDEX "idx_posts_author" ON "public"."posts" USING "btree" ("author_id");



CREATE INDEX "idx_posts_category" ON "public"."posts" USING "btree" ("category");



CREATE INDEX "idx_posts_featured" ON "public"."posts" USING "btree" ("featured");



CREATE INDEX "idx_posts_published" ON "public"."posts" USING "btree" ("published");



CREATE INDEX "idx_products_category" ON "public"."products" USING "btree" ("category");



CREATE INDEX "idx_products_featured" ON "public"."products" USING "btree" ("featured");



CREATE INDEX "idx_products_status" ON "public"."products" USING "btree" ("status");



CREATE INDEX "idx_tours_category" ON "public"."tours" USING "btree" ("category");



CREATE INDEX "idx_tours_featured" ON "public"."tours" USING "btree" ("featured");



CREATE INDEX "idx_trip_com_bookings_booking_id" ON "public"."trip_com_bookings" USING "btree" ("booking_id");



CREATE INDEX "idx_trip_com_bookings_status" ON "public"."trip_com_bookings" USING "btree" ("status");



CREATE INDEX "idx_trip_com_bookings_user_id" ON "public"."trip_com_bookings" USING "btree" ("user_id");



CREATE INDEX "idx_trip_com_search_logs_destination" ON "public"."trip_com_search_logs" USING "btree" ("destination");



CREATE INDEX "idx_trip_com_search_logs_user_id" ON "public"."trip_com_search_logs" USING "btree" ("user_id");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "idx_users_role" ON "public"."users" USING "btree" ("role");



CREATE INDEX "idx_users_status" ON "public"."users" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "update_idl_applications_updated_at" BEFORE UPDATE ON "public"."international_driving_license_applications" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "update_travel_packages_updated_at" BEFORE UPDATE ON "public"."travel_packages" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "update_visa_applications_updated_at" BEFORE UPDATE ON "public"."visa_applications" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id");



ALTER TABLE ONLY "public"."international_driving_license_applications"
    ADD CONSTRAINT "international_driving_license_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."travel_packages"
    ADD CONSTRAINT "travel_packages_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trip_com_bookings"
    ADD CONSTRAINT "trip_com_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."trip_com_search_logs"
    ADD CONSTRAINT "trip_com_search_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."visa_applications"
    ADD CONSTRAINT "visa_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visa_offers"
    ADD CONSTRAINT "visa_offers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



CREATE POLICY "idl_applications_owner_all" ON "public"."international_driving_license_applications" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."international_driving_license_applications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_owner_insert" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "profiles_owner_select" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "profiles_owner_update" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



ALTER TABLE "public"."travel_packages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "travel_packages_authenticated_insert" ON "public"."travel_packages" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "travel_packages_creator_update" ON "public"."travel_packages" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "created_by")) WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "travel_packages_public_read" ON "public"."travel_packages" FOR SELECT USING (true);



ALTER TABLE "public"."trip_com_bookings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trip_com_search_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."visa-offers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."visa_applications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "visa_applications_owner_all" ON "public"."visa_applications" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."visa_offers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "visa_offers_authenticated_insert" ON "public"."visa_offers" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "visa_offers_creator_update" ON "public"."visa_offers" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "created_by")) WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "visa_offers_public_read" ON "public"."visa_offers" FOR SELECT USING (true);





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_permission"("user_uuid" "uuid", "permission" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_permission"("user_uuid" "uuid", "permission" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_permission"("user_uuid" "uuid", "permission" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."bookings" TO "anon";
GRANT ALL ON TABLE "public"."bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."bookings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bookings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bookings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bookings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";



GRANT ALL ON SEQUENCE "public"."clients_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."clients_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."clients_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."contact_messages" TO "anon";
GRANT ALL ON TABLE "public"."contact_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_messages" TO "service_role";



GRANT ALL ON SEQUENCE "public"."contact_messages_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."contact_messages_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."contact_messages_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."international_driving_license_applications" TO "anon";
GRANT ALL ON TABLE "public"."international_driving_license_applications" TO "authenticated";
GRANT ALL ON TABLE "public"."international_driving_license_applications" TO "service_role";



GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "anon";
GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "authenticated";
GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."newsletter_subscribers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."newsletter_subscribers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."newsletter_subscribers_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."tours" TO "anon";
GRANT ALL ON TABLE "public"."tours" TO "authenticated";
GRANT ALL ON TABLE "public"."tours" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tours_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tours_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tours_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."travel_packages" TO "anon";
GRANT ALL ON TABLE "public"."travel_packages" TO "authenticated";
GRANT ALL ON TABLE "public"."travel_packages" TO "service_role";



GRANT ALL ON TABLE "public"."trip_com_bookings" TO "anon";
GRANT ALL ON TABLE "public"."trip_com_bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_com_bookings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trip_com_bookings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trip_com_bookings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trip_com_bookings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trip_com_search_logs" TO "anon";
GRANT ALL ON TABLE "public"."trip_com_search_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_com_search_logs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trip_com_search_logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trip_com_search_logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trip_com_search_logs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."visa-offers" TO "anon";
GRANT ALL ON TABLE "public"."visa-offers" TO "authenticated";
GRANT ALL ON TABLE "public"."visa-offers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."visa-offers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."visa-offers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."visa-offers_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."visa_applications" TO "anon";
GRANT ALL ON TABLE "public"."visa_applications" TO "authenticated";
GRANT ALL ON TABLE "public"."visa_applications" TO "service_role";



GRANT ALL ON TABLE "public"."visa_offers" TO "anon";
GRANT ALL ON TABLE "public"."visa_offers" TO "authenticated";
GRANT ALL ON TABLE "public"."visa_offers" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
