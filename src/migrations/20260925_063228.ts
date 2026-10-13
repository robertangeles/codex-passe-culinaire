import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_pages_blocks_hero_seasonal_images_season" AS ENUM('summer', 'autumn', 'winter', 'spring');
  CREATE TYPE "public"."enum_pages_blocks_hero_style" AS ENUM('quiet', 'image');
  CREATE TYPE "public"."enum_pages_blocks_feature_image_side" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_blocks_spacer_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_pages_seo_sitemap_priority" AS ENUM('0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0');
  CREATE TYPE "public"."enum_pages_seo_sitemap_change_frequency" AS ENUM('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_seasonal_images_season" AS ENUM('summer', 'autumn', 'winter', 'spring');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_style" AS ENUM('quiet', 'image');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_image_side" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_spacer_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum__pages_v_version_seo_sitemap_priority" AS ENUM('0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0');
  CREATE TYPE "public"."enum__pages_v_version_seo_sitemap_change_frequency" AS ENUM('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_posts_seo_sitemap_priority" AS ENUM('0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0');
  CREATE TYPE "public"."enum_posts_seo_sitemap_change_frequency" AS ENUM('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_seo_sitemap_priority" AS ENUM('0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0');
  CREATE TYPE "public"."enum__posts_v_version_seo_sitemap_change_frequency" AS ENUM('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_services_format" AS ENUM('on-site', 'online', 'hybrid');
  CREATE TYPE "public"."enum_services_seo_sitemap_priority" AS ENUM('0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0');
  CREATE TYPE "public"."enum_services_seo_sitemap_change_frequency" AS ENUM('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never');
  CREATE TYPE "public"."enum_services_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_version_format" AS ENUM('on-site', 'online', 'hybrid');
  CREATE TYPE "public"."enum__services_v_version_seo_sitemap_priority" AS ENUM('0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0');
  CREATE TYPE "public"."enum__services_v_version_seo_sitemap_change_frequency" AS ENUM('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never');
  CREATE TYPE "public"."enum__services_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_events_type" AS ENUM('workshop', 'course', 'masterclass', 'talk');
  CREATE TYPE "public"."enum_events_event_status" AS ENUM('upcoming', 'sold-out', 'past', 'cancelled');
  CREATE TYPE "public"."enum_events_seo_sitemap_priority" AS ENUM('0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0');
  CREATE TYPE "public"."enum_events_seo_sitemap_change_frequency" AS ENUM('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never');
  CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_version_type" AS ENUM('workshop', 'course', 'masterclass', 'talk');
  CREATE TYPE "public"."enum__events_v_version_event_status" AS ENUM('upcoming', 'sold-out', 'past', 'cancelled');
  CREATE TYPE "public"."enum__events_v_version_seo_sitemap_priority" AS ENUM('0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0');
  CREATE TYPE "public"."enum__events_v_version_seo_sitemap_change_frequency" AS ENUM('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never');
  CREATE TYPE "public"."enum__events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_redirects_status_code" AS ENUM('301', '302', '307', '308');
  CREATE TYPE "public"."enum_form_submissions_role" AS ENUM('chef', 'owner', 'manager', 'other');
  CREATE TYPE "public"."enum_form_submissions_need" AS ENUM('training', 'advisory', 'culinaire-kitchen', 'press', 'other');
  CREATE TYPE "public"."enum_form_submissions_delivery_status" AS ENUM('saved', 'emailed', 'failed', 'handled');
  CREATE TYPE "public"."enum_site_settings_default_sitemap_priority" AS ENUM('0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0');
  CREATE TYPE "public"."enum_site_settings_default_sitemap_change_frequency" AS ENUM('daily', 'weekly', 'monthly', 'yearly');
  CREATE TABLE "media" (
    "id" serial PRIMARY KEY NOT NULL,
    "alt" varchar NOT NULL,
    "caption" varchar,
    "credit" varchar,
    "placeholder" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "url" varchar,
    "thumbnail_u_r_l" varchar,
    "filename" varchar,
    "mime_type" varchar,
    "filesize" numeric,
    "width" numeric,
    "height" numeric,
    "focal_x" numeric,
    "focal_y" numeric,
    "sizes_avif480_url" varchar,
    "sizes_avif480_width" numeric,
    "sizes_avif480_height" numeric,
    "sizes_avif480_mime_type" varchar,
    "sizes_avif480_filesize" numeric,
    "sizes_avif480_filename" varchar,
    "sizes_webp480_url" varchar,
    "sizes_webp480_width" numeric,
    "sizes_webp480_height" numeric,
    "sizes_webp480_mime_type" varchar,
    "sizes_webp480_filesize" numeric,
    "sizes_webp480_filename" varchar,
    "sizes_avif960_url" varchar,
    "sizes_avif960_width" numeric,
    "sizes_avif960_height" numeric,
    "sizes_avif960_mime_type" varchar,
    "sizes_avif960_filesize" numeric,
    "sizes_avif960_filename" varchar,
    "sizes_webp960_url" varchar,
    "sizes_webp960_width" numeric,
    "sizes_webp960_height" numeric,
    "sizes_webp960_mime_type" varchar,
    "sizes_webp960_filesize" numeric,
    "sizes_webp960_filename" varchar,
    "sizes_avif1440_url" varchar,
    "sizes_avif1440_width" numeric,
    "sizes_avif1440_height" numeric,
    "sizes_avif1440_mime_type" varchar,
    "sizes_avif1440_filesize" numeric,
    "sizes_avif1440_filename" varchar,
    "sizes_webp1440_url" varchar,
    "sizes_webp1440_width" numeric,
    "sizes_webp1440_height" numeric,
    "sizes_webp1440_mime_type" varchar,
    "sizes_webp1440_filesize" numeric,
    "sizes_webp1440_filename" varchar,
    "sizes_avif2400_url" varchar,
    "sizes_avif2400_width" numeric,
    "sizes_avif2400_height" numeric,
    "sizes_avif2400_mime_type" varchar,
    "sizes_avif2400_filesize" numeric,
    "sizes_avif2400_filename" varchar,
    "sizes_webp2400_url" varchar,
    "sizes_webp2400_width" numeric,
    "sizes_webp2400_height" numeric,
    "sizes_webp2400_mime_type" varchar,
    "sizes_webp2400_filesize" numeric,
    "sizes_webp2400_filename" varchar
  );

  CREATE TABLE "pages_blocks_hero_seasonal_images" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "season" "enum_pages_blocks_hero_seasonal_images_season",
    "image_id" integer
  );

  CREATE TABLE "pages_blocks_hero" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "heading" varchar,
    "eyebrow" varchar,
    "summary" varchar,
    "style" "enum_pages_blocks_hero_style" DEFAULT 'quiet',
    "image_id" integer,
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_prose" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "body" jsonb,
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_feature" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "heading" varchar,
    "body" jsonb,
    "image_id" integer,
    "image_side" "enum_pages_blocks_feature_image_side" DEFAULT 'left',
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_gallery_images" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "image_id" integer,
    "caption" varchar
  );

  CREATE TABLE "pages_blocks_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_pull_quote" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "quote" varchar,
    "attribution" varchar,
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_founder_card_links" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar
  );

  CREATE TABLE "pages_blocks_founder_card" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "name" varchar,
    "title" varchar,
    "portrait_id" integer,
    "bio" jsonb,
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_product_spotlight" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "heading" varchar,
    "body" jsonb,
    "image_id" integer,
    "web_url" varchar,
    "app_store_url" varchar,
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_journal_feed" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "heading" varchar,
    "limit" numeric DEFAULT 3,
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_faq_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" jsonb
  );

  CREATE TABLE "pages_blocks_faq" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_service_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "heading" varchar,
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_upcoming_events" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "heading" varchar,
    "limit" numeric DEFAULT 3,
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_testimonial" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "testimonial_id" integer,
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_plain_statement" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "statement" varchar,
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_cta" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "statement" varchar,
    "label" varchar,
    "url" varchar,
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_spacer" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "size" "enum_pages_blocks_spacer_size" DEFAULT 'medium',
    "block_name" varchar
  );

  CREATE TABLE "pages" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "slug" varchar,
    "seo_meta_title" varchar,
    "seo_meta_description" varchar,
    "seo_canonical_url" varchar,
    "seo_og_image_id" integer,
    "seo_no_index" boolean DEFAULT false,
    "seo_no_follow" boolean DEFAULT false,
    "seo_exclude_from_sitemap" boolean DEFAULT false,
    "seo_sitemap_priority" "enum_pages_seo_sitemap_priority" DEFAULT '0.7',
    "seo_sitemap_change_frequency" "enum_pages_seo_sitemap_change_frequency" DEFAULT 'monthly',
    "seo_structured_data_override" jsonb,
    "published_at" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_pages_status" DEFAULT 'draft'
  );

  CREATE TABLE "pages_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "services_id" integer
  );

  CREATE TABLE "_pages_v_blocks_hero_seasonal_images" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "season" "enum__pages_v_blocks_hero_seasonal_images_season",
    "image_id" integer,
    "_uuid" varchar
  );

  CREATE TABLE "_pages_v_blocks_hero" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "heading" varchar,
    "eyebrow" varchar,
    "summary" varchar,
    "style" "enum__pages_v_blocks_hero_style" DEFAULT 'quiet',
    "image_id" integer,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_prose" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "body" jsonb,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_feature" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "heading" varchar,
    "body" jsonb,
    "image_id" integer,
    "image_side" "enum__pages_v_blocks_feature_image_side" DEFAULT 'left',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_gallery_images" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "image_id" integer,
    "caption" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_pages_v_blocks_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_pull_quote" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "quote" varchar,
    "attribution" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_founder_card_links" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_pages_v_blocks_founder_card" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "title" varchar,
    "portrait_id" integer,
    "bio" jsonb,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_product_spotlight" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "heading" varchar,
    "body" jsonb,
    "image_id" integer,
    "web_url" varchar,
    "app_store_url" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_journal_feed" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "heading" varchar,
    "limit" numeric DEFAULT 3,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_faq_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" jsonb,
    "_uuid" varchar
  );

  CREATE TABLE "_pages_v_blocks_faq" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_service_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "heading" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_upcoming_events" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "heading" varchar,
    "limit" numeric DEFAULT 3,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_testimonial" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "testimonial_id" integer,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_plain_statement" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "statement" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_cta" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "statement" varchar,
    "label" varchar,
    "url" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_spacer" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "size" "enum__pages_v_blocks_spacer_size" DEFAULT 'medium',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_title" varchar,
    "version_slug" varchar,
    "version_seo_meta_title" varchar,
    "version_seo_meta_description" varchar,
    "version_seo_canonical_url" varchar,
    "version_seo_og_image_id" integer,
    "version_seo_no_index" boolean DEFAULT false,
    "version_seo_no_follow" boolean DEFAULT false,
    "version_seo_exclude_from_sitemap" boolean DEFAULT false,
    "version_seo_sitemap_priority" "enum__pages_v_version_seo_sitemap_priority" DEFAULT '0.7',
    "version_seo_sitemap_change_frequency" "enum__pages_v_version_seo_sitemap_change_frequency" DEFAULT 'monthly',
    "version_seo_structured_data_override" jsonb,
    "version_published_at" timestamp(3) with time zone,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__pages_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE "_pages_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "services_id" integer
  );

  CREATE TABLE "posts" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "slug" varchar,
    "excerpt" varchar,
    "hero_image_id" integer,
    "body" jsonb,
    "reading_time" numeric,
    "scheduled_publish_at" timestamp(3) with time zone,
    "seo_meta_title" varchar,
    "seo_meta_description" varchar,
    "seo_canonical_url" varchar,
    "seo_og_image_id" integer,
    "seo_no_index" boolean DEFAULT false,
    "seo_no_follow" boolean DEFAULT false,
    "seo_exclude_from_sitemap" boolean DEFAULT false,
    "seo_sitemap_priority" "enum_posts_seo_sitemap_priority" DEFAULT '0.5',
    "seo_sitemap_change_frequency" "enum_posts_seo_sitemap_change_frequency" DEFAULT 'weekly',
    "seo_structured_data_override" jsonb,
    "published_at" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_posts_status" DEFAULT 'draft'
  );

  CREATE TABLE "posts_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "users_id" integer,
    "categories_id" integer,
    "tags_id" integer
  );

  CREATE TABLE "_posts_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_title" varchar,
    "version_slug" varchar,
    "version_excerpt" varchar,
    "version_hero_image_id" integer,
    "version_body" jsonb,
    "version_reading_time" numeric,
    "version_scheduled_publish_at" timestamp(3) with time zone,
    "version_seo_meta_title" varchar,
    "version_seo_meta_description" varchar,
    "version_seo_canonical_url" varchar,
    "version_seo_og_image_id" integer,
    "version_seo_no_index" boolean DEFAULT false,
    "version_seo_no_follow" boolean DEFAULT false,
    "version_seo_exclude_from_sitemap" boolean DEFAULT false,
    "version_seo_sitemap_priority" "enum__posts_v_version_seo_sitemap_priority" DEFAULT '0.5',
    "version_seo_sitemap_change_frequency" "enum__posts_v_version_seo_sitemap_change_frequency" DEFAULT 'weekly',
    "version_seo_structured_data_override" jsonb,
    "version_published_at" timestamp(3) with time zone,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__posts_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE "_posts_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "users_id" integer,
    "categories_id" integer,
    "tags_id" integer
  );

  CREATE TABLE "categories" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "slug" varchar NOT NULL,
    "description" varchar,
    "no_index" boolean DEFAULT false,
    "exclude_from_sitemap" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "tags" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "slug" varchar NOT NULL,
    "description" varchar,
    "no_index" boolean DEFAULT false,
    "exclude_from_sitemap" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "services_faq" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" jsonb
  );

  CREATE TABLE "services" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "slug" varchar,
    "one_liner" varchar,
    "who_it_is_for" varchar,
    "what_you_get" jsonb,
    "format" "enum_services_format",
    "duration" varchar,
    "price_note" varchar,
    "hero_image_id" integer,
    "cta_label" varchar,
    "cta_url" varchar,
    "seo_meta_title" varchar,
    "seo_meta_description" varchar,
    "seo_canonical_url" varchar,
    "seo_og_image_id" integer,
    "seo_no_index" boolean DEFAULT false,
    "seo_no_follow" boolean DEFAULT false,
    "seo_exclude_from_sitemap" boolean DEFAULT false,
    "seo_sitemap_priority" "enum_services_seo_sitemap_priority" DEFAULT '0.7',
    "seo_sitemap_change_frequency" "enum_services_seo_sitemap_change_frequency" DEFAULT 'monthly',
    "seo_structured_data_override" jsonb,
    "published_at" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_services_status" DEFAULT 'draft'
  );

  CREATE TABLE "_services_v_version_faq" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" jsonb,
    "_uuid" varchar
  );

  CREATE TABLE "_services_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_title" varchar,
    "version_slug" varchar,
    "version_one_liner" varchar,
    "version_who_it_is_for" varchar,
    "version_what_you_get" jsonb,
    "version_format" "enum__services_v_version_format",
    "version_duration" varchar,
    "version_price_note" varchar,
    "version_hero_image_id" integer,
    "version_cta_label" varchar,
    "version_cta_url" varchar,
    "version_seo_meta_title" varchar,
    "version_seo_meta_description" varchar,
    "version_seo_canonical_url" varchar,
    "version_seo_og_image_id" integer,
    "version_seo_no_index" boolean DEFAULT false,
    "version_seo_no_follow" boolean DEFAULT false,
    "version_seo_exclude_from_sitemap" boolean DEFAULT false,
    "version_seo_sitemap_priority" "enum__services_v_version_seo_sitemap_priority" DEFAULT '0.7',
    "version_seo_sitemap_change_frequency" "enum__services_v_version_seo_sitemap_change_frequency" DEFAULT 'monthly',
    "version_seo_structured_data_override" jsonb,
    "version_published_at" timestamp(3) with time zone,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__services_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE "events" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "slug" varchar,
    "type" "enum_events_type",
    "description" jsonb,
    "description_summary" varchar,
    "start_date" timestamp(3) with time zone,
    "end_date" timestamp(3) with time zone,
    "timezone" varchar DEFAULT 'Australia/Melbourne',
    "venue_name" varchar,
    "venue_address" varchar,
    "venue_online" boolean,
    "capacity" numeric,
    "price" varchar,
    "booking_url" varchar,
    "hero_image_id" integer,
    "event_status" "enum_events_event_status" DEFAULT 'upcoming',
    "seo_meta_title" varchar,
    "seo_meta_description" varchar,
    "seo_canonical_url" varchar,
    "seo_og_image_id" integer,
    "seo_no_index" boolean DEFAULT false,
    "seo_no_follow" boolean DEFAULT false,
    "seo_exclude_from_sitemap" boolean DEFAULT false,
    "seo_sitemap_priority" "enum_events_seo_sitemap_priority" DEFAULT '0.7',
    "seo_sitemap_change_frequency" "enum_events_seo_sitemap_change_frequency" DEFAULT 'monthly',
    "seo_structured_data_override" jsonb,
    "published_at" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_events_status" DEFAULT 'draft'
  );

  CREATE TABLE "events_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "users_id" integer
  );

  CREATE TABLE "_events_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_title" varchar,
    "version_slug" varchar,
    "version_type" "enum__events_v_version_type",
    "version_description" jsonb,
    "version_description_summary" varchar,
    "version_start_date" timestamp(3) with time zone,
    "version_end_date" timestamp(3) with time zone,
    "version_timezone" varchar DEFAULT 'Australia/Melbourne',
    "version_venue_name" varchar,
    "version_venue_address" varchar,
    "version_venue_online" boolean,
    "version_capacity" numeric,
    "version_price" varchar,
    "version_booking_url" varchar,
    "version_hero_image_id" integer,
    "version_event_status" "enum__events_v_version_event_status" DEFAULT 'upcoming',
    "version_seo_meta_title" varchar,
    "version_seo_meta_description" varchar,
    "version_seo_canonical_url" varchar,
    "version_seo_og_image_id" integer,
    "version_seo_no_index" boolean DEFAULT false,
    "version_seo_no_follow" boolean DEFAULT false,
    "version_seo_exclude_from_sitemap" boolean DEFAULT false,
    "version_seo_sitemap_priority" "enum__events_v_version_seo_sitemap_priority" DEFAULT '0.7',
    "version_seo_sitemap_change_frequency" "enum__events_v_version_seo_sitemap_change_frequency" DEFAULT 'monthly',
    "version_seo_structured_data_override" jsonb,
    "version_published_at" timestamp(3) with time zone,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__events_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE "_events_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "users_id" integer
  );

  CREATE TABLE "testimonials" (
    "id" serial PRIMARY KEY NOT NULL,
    "quote" varchar NOT NULL,
    "name" varchar NOT NULL,
    "role" varchar,
    "venue" varchar,
    "portrait_id" integer,
    "published" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "testimonials_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "services_id" integer,
    "events_id" integer
  );

  CREATE TABLE "redirects" (
    "id" serial PRIMARY KEY NOT NULL,
    "from" varchar NOT NULL,
    "to" varchar NOT NULL,
    "status_code" "enum_redirects_status_code" DEFAULT '301' NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "forms" (
    "id" serial PRIMARY KEY NOT NULL,
    "key" varchar NOT NULL,
    "title" varchar NOT NULL,
    "enabled" boolean DEFAULT true,
    "description" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "form_submissions" (
    "id" serial PRIMARY KEY NOT NULL,
    "form_id" integer NOT NULL,
    "request_id" varchar NOT NULL,
    "name" varchar NOT NULL,
    "email" varchar NOT NULL,
    "venue" varchar,
    "role" "enum_form_submissions_role" NOT NULL,
    "need" "enum_form_submissions_need" NOT NULL,
    "message" varchar NOT NULL,
    "delivery_status" "enum_form_submissions_delivery_status" DEFAULT 'saved',
    "delivery_error" varchar,
    "emailed_at" timestamp(3) with time zone,
    "handled_at" timestamp(3) with time zone,
    "operator_notes" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "site_settings_social_links" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar
  );

  CREATE TABLE "site_settings_organisation_knows_about" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "topic" varchar
  );

  CREATE TABLE "site_settings" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "tagline" varchar,
    "description" varchar,
    "default_og_image_id" integer,
    "organisation_legal_name" varchar,
    "organisation_city" varchar,
    "organisation_region" varchar,
    "organisation_country" varchar,
    "analytics_enabled" boolean DEFAULT false,
    "robots_txt_extra" varchar,
    "default_sitemap_priority" "enum_site_settings_default_sitemap_priority" DEFAULT '0.5',
    "default_sitemap_change_frequency" "enum_site_settings_default_sitemap_change_frequency" DEFAULT 'monthly',
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );

  CREATE TABLE "site_settings_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "users_id" integer
  );

  CREATE TABLE "header_nav_items_children" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar NOT NULL,
    "url" varchar NOT NULL
  );

  CREATE TABLE "header_nav_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar NOT NULL,
    "url" varchar
  );

  CREATE TABLE "header" (
    "id" serial PRIMARY KEY NOT NULL,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );

  CREATE TABLE "footer_columns_links" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar
  );

  CREATE TABLE "footer_columns" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "heading" varchar
  );

  CREATE TABLE "footer" (
    "id" serial PRIMARY KEY NOT NULL,
    "legal_text" varchar,
    "abn" varchar,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );

  ALTER TABLE "users" ADD COLUMN "name" varchar NOT NULL;
  ALTER TABLE "users" ADD COLUMN "slug" varchar NOT NULL;
  ALTER TABLE "users" ADD COLUMN "role" "enum_users_role" DEFAULT 'editor' NOT NULL;
  ALTER TABLE "users" ADD COLUMN "public_profile" boolean DEFAULT false;
  ALTER TABLE "users" ADD COLUMN "public_title" varchar;
  ALTER TABLE "users" ADD COLUMN "public_bio" jsonb;
  ALTER TABLE "users" ADD COLUMN "portrait_id" integer;
  ALTER TABLE "users" ADD COLUMN "no_index" boolean DEFAULT false;
  ALTER TABLE "users" ADD COLUMN "exclude_from_sitemap" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tags_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "events_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "redirects_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "forms_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "form_submissions_id" integer;
  ALTER TABLE "pages_blocks_hero_seasonal_images" ADD CONSTRAINT "pages_blocks_hero_seasonal_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_seasonal_images" ADD CONSTRAINT "pages_blocks_hero_seasonal_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_prose" ADD CONSTRAINT "pages_blocks_prose_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature" ADD CONSTRAINT "pages_blocks_feature_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature" ADD CONSTRAINT "pages_blocks_feature_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_images" ADD CONSTRAINT "pages_blocks_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_images" ADD CONSTRAINT "pages_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery" ADD CONSTRAINT "pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pull_quote" ADD CONSTRAINT "pages_blocks_pull_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_founder_card_links" ADD CONSTRAINT "pages_blocks_founder_card_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_founder_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_founder_card" ADD CONSTRAINT "pages_blocks_founder_card_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_founder_card" ADD CONSTRAINT "pages_blocks_founder_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_product_spotlight" ADD CONSTRAINT "pages_blocks_product_spotlight_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_product_spotlight" ADD CONSTRAINT "pages_blocks_product_spotlight_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_journal_feed" ADD CONSTRAINT "pages_blocks_journal_feed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_service_list" ADD CONSTRAINT "pages_blocks_service_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_upcoming_events" ADD CONSTRAINT "pages_blocks_upcoming_events_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonial" ADD CONSTRAINT "pages_blocks_testimonial_testimonial_id_testimonials_id_fk" FOREIGN KEY ("testimonial_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonial" ADD CONSTRAINT "pages_blocks_testimonial_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_plain_statement" ADD CONSTRAINT "pages_blocks_plain_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_spacer" ADD CONSTRAINT "pages_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_seasonal_images" ADD CONSTRAINT "_pages_v_blocks_hero_seasonal_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_seasonal_images" ADD CONSTRAINT "_pages_v_blocks_hero_seasonal_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_prose" ADD CONSTRAINT "_pages_v_blocks_prose_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature" ADD CONSTRAINT "_pages_v_blocks_feature_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature" ADD CONSTRAINT "_pages_v_blocks_feature_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_images" ADD CONSTRAINT "_pages_v_blocks_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_images" ADD CONSTRAINT "_pages_v_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery" ADD CONSTRAINT "_pages_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pull_quote" ADD CONSTRAINT "_pages_v_blocks_pull_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_founder_card_links" ADD CONSTRAINT "_pages_v_blocks_founder_card_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_founder_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_founder_card" ADD CONSTRAINT "_pages_v_blocks_founder_card_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_founder_card" ADD CONSTRAINT "_pages_v_blocks_founder_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_product_spotlight" ADD CONSTRAINT "_pages_v_blocks_product_spotlight_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_product_spotlight" ADD CONSTRAINT "_pages_v_blocks_product_spotlight_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_journal_feed" ADD CONSTRAINT "_pages_v_blocks_journal_feed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_service_list" ADD CONSTRAINT "_pages_v_blocks_service_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_upcoming_events" ADD CONSTRAINT "_pages_v_blocks_upcoming_events_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial" ADD CONSTRAINT "_pages_v_blocks_testimonial_testimonial_id_testimonials_id_fk" FOREIGN KEY ("testimonial_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial" ADD CONSTRAINT "_pages_v_blocks_testimonial_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_plain_statement" ADD CONSTRAINT "_pages_v_blocks_plain_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_spacer" ADD CONSTRAINT "_pages_v_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_faq" ADD CONSTRAINT "services_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_version_faq" ADD CONSTRAINT "_services_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials_rels" ADD CONSTRAINT "testimonials_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials_rels" ADD CONSTRAINT "testimonials_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials_rels" ADD CONSTRAINT "testimonials_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_social_links" ADD CONSTRAINT "site_settings_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_organisation_knows_about" ADD CONSTRAINT "site_settings_organisation_knows_about_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_og_image_id_media_id_fk" FOREIGN KEY ("default_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items_children" ADD CONSTRAINT "header_nav_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_avif480_sizes_avif480_filename_idx" ON "media" USING btree ("sizes_avif480_filename");
  CREATE INDEX "media_sizes_webp480_sizes_webp480_filename_idx" ON "media" USING btree ("sizes_webp480_filename");
  CREATE INDEX "media_sizes_avif960_sizes_avif960_filename_idx" ON "media" USING btree ("sizes_avif960_filename");
  CREATE INDEX "media_sizes_webp960_sizes_webp960_filename_idx" ON "media" USING btree ("sizes_webp960_filename");
  CREATE INDEX "media_sizes_avif1440_sizes_avif1440_filename_idx" ON "media" USING btree ("sizes_avif1440_filename");
  CREATE INDEX "media_sizes_webp1440_sizes_webp1440_filename_idx" ON "media" USING btree ("sizes_webp1440_filename");
  CREATE INDEX "media_sizes_avif2400_sizes_avif2400_filename_idx" ON "media" USING btree ("sizes_avif2400_filename");
  CREATE INDEX "media_sizes_webp2400_sizes_webp2400_filename_idx" ON "media" USING btree ("sizes_webp2400_filename");
  CREATE INDEX "pages_blocks_hero_seasonal_images_order_idx" ON "pages_blocks_hero_seasonal_images" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_seasonal_images_parent_id_idx" ON "pages_blocks_hero_seasonal_images" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_seasonal_images_image_idx" ON "pages_blocks_hero_seasonal_images" USING btree ("image_id");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_image_idx" ON "pages_blocks_hero" USING btree ("image_id");
  CREATE INDEX "pages_blocks_prose_order_idx" ON "pages_blocks_prose" USING btree ("_order");
  CREATE INDEX "pages_blocks_prose_parent_id_idx" ON "pages_blocks_prose" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_prose_path_idx" ON "pages_blocks_prose" USING btree ("_path");
  CREATE INDEX "pages_blocks_feature_order_idx" ON "pages_blocks_feature" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_parent_id_idx" ON "pages_blocks_feature" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_path_idx" ON "pages_blocks_feature" USING btree ("_path");
  CREATE INDEX "pages_blocks_feature_image_idx" ON "pages_blocks_feature" USING btree ("image_id");
  CREATE INDEX "pages_blocks_gallery_images_order_idx" ON "pages_blocks_gallery_images" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_images_parent_id_idx" ON "pages_blocks_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_images_image_idx" ON "pages_blocks_gallery_images" USING btree ("image_id");
  CREATE INDEX "pages_blocks_gallery_order_idx" ON "pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_parent_id_idx" ON "pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_path_idx" ON "pages_blocks_gallery" USING btree ("_path");
  CREATE INDEX "pages_blocks_pull_quote_order_idx" ON "pages_blocks_pull_quote" USING btree ("_order");
  CREATE INDEX "pages_blocks_pull_quote_parent_id_idx" ON "pages_blocks_pull_quote" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pull_quote_path_idx" ON "pages_blocks_pull_quote" USING btree ("_path");
  CREATE INDEX "pages_blocks_founder_card_links_order_idx" ON "pages_blocks_founder_card_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_founder_card_links_parent_id_idx" ON "pages_blocks_founder_card_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_founder_card_order_idx" ON "pages_blocks_founder_card" USING btree ("_order");
  CREATE INDEX "pages_blocks_founder_card_parent_id_idx" ON "pages_blocks_founder_card" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_founder_card_path_idx" ON "pages_blocks_founder_card" USING btree ("_path");
  CREATE INDEX "pages_blocks_founder_card_portrait_idx" ON "pages_blocks_founder_card" USING btree ("portrait_id");
  CREATE INDEX "pages_blocks_product_spotlight_order_idx" ON "pages_blocks_product_spotlight" USING btree ("_order");
  CREATE INDEX "pages_blocks_product_spotlight_parent_id_idx" ON "pages_blocks_product_spotlight" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_product_spotlight_path_idx" ON "pages_blocks_product_spotlight" USING btree ("_path");
  CREATE INDEX "pages_blocks_product_spotlight_image_idx" ON "pages_blocks_product_spotlight" USING btree ("image_id");
  CREATE INDEX "pages_blocks_journal_feed_order_idx" ON "pages_blocks_journal_feed" USING btree ("_order");
  CREATE INDEX "pages_blocks_journal_feed_parent_id_idx" ON "pages_blocks_journal_feed" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_journal_feed_path_idx" ON "pages_blocks_journal_feed" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_items_order_idx" ON "pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_items_parent_id_idx" ON "pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_service_list_order_idx" ON "pages_blocks_service_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_service_list_parent_id_idx" ON "pages_blocks_service_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_service_list_path_idx" ON "pages_blocks_service_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_upcoming_events_order_idx" ON "pages_blocks_upcoming_events" USING btree ("_order");
  CREATE INDEX "pages_blocks_upcoming_events_parent_id_idx" ON "pages_blocks_upcoming_events" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_upcoming_events_path_idx" ON "pages_blocks_upcoming_events" USING btree ("_path");
  CREATE INDEX "pages_blocks_testimonial_order_idx" ON "pages_blocks_testimonial" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonial_parent_id_idx" ON "pages_blocks_testimonial" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonial_path_idx" ON "pages_blocks_testimonial" USING btree ("_path");
  CREATE INDEX "pages_blocks_testimonial_testimonial_idx" ON "pages_blocks_testimonial" USING btree ("testimonial_id");
  CREATE INDEX "pages_blocks_plain_statement_order_idx" ON "pages_blocks_plain_statement" USING btree ("_order");
  CREATE INDEX "pages_blocks_plain_statement_parent_id_idx" ON "pages_blocks_plain_statement" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_plain_statement_path_idx" ON "pages_blocks_plain_statement" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "pages_blocks_spacer_order_idx" ON "pages_blocks_spacer" USING btree ("_order");
  CREATE INDEX "pages_blocks_spacer_parent_id_idx" ON "pages_blocks_spacer" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_spacer_path_idx" ON "pages_blocks_spacer" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_seo_seo_og_image_idx" ON "pages" USING btree ("seo_og_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_services_id_idx" ON "pages_rels" USING btree ("services_id");
  CREATE INDEX "_pages_v_blocks_hero_seasonal_images_order_idx" ON "_pages_v_blocks_hero_seasonal_images" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_seasonal_images_parent_id_idx" ON "_pages_v_blocks_hero_seasonal_images" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_seasonal_images_image_idx" ON "_pages_v_blocks_hero_seasonal_images" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_image_idx" ON "_pages_v_blocks_hero" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_prose_order_idx" ON "_pages_v_blocks_prose" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_prose_parent_id_idx" ON "_pages_v_blocks_prose" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_prose_path_idx" ON "_pages_v_blocks_prose" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_feature_order_idx" ON "_pages_v_blocks_feature" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_parent_id_idx" ON "_pages_v_blocks_feature" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_path_idx" ON "_pages_v_blocks_feature" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_feature_image_idx" ON "_pages_v_blocks_feature" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_gallery_images_order_idx" ON "_pages_v_blocks_gallery_images" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_images_parent_id_idx" ON "_pages_v_blocks_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_images_image_idx" ON "_pages_v_blocks_gallery_images" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_gallery_order_idx" ON "_pages_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_parent_id_idx" ON "_pages_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_path_idx" ON "_pages_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_pull_quote_order_idx" ON "_pages_v_blocks_pull_quote" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pull_quote_parent_id_idx" ON "_pages_v_blocks_pull_quote" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pull_quote_path_idx" ON "_pages_v_blocks_pull_quote" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_founder_card_links_order_idx" ON "_pages_v_blocks_founder_card_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_founder_card_links_parent_id_idx" ON "_pages_v_blocks_founder_card_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_founder_card_order_idx" ON "_pages_v_blocks_founder_card" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_founder_card_parent_id_idx" ON "_pages_v_blocks_founder_card" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_founder_card_path_idx" ON "_pages_v_blocks_founder_card" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_founder_card_portrait_idx" ON "_pages_v_blocks_founder_card" USING btree ("portrait_id");
  CREATE INDEX "_pages_v_blocks_product_spotlight_order_idx" ON "_pages_v_blocks_product_spotlight" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_product_spotlight_parent_id_idx" ON "_pages_v_blocks_product_spotlight" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_product_spotlight_path_idx" ON "_pages_v_blocks_product_spotlight" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_product_spotlight_image_idx" ON "_pages_v_blocks_product_spotlight" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_journal_feed_order_idx" ON "_pages_v_blocks_journal_feed" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_journal_feed_parent_id_idx" ON "_pages_v_blocks_journal_feed" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_journal_feed_path_idx" ON "_pages_v_blocks_journal_feed" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_faq_items_order_idx" ON "_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_items_parent_id_idx" ON "_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_service_list_order_idx" ON "_pages_v_blocks_service_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_service_list_parent_id_idx" ON "_pages_v_blocks_service_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_service_list_path_idx" ON "_pages_v_blocks_service_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_upcoming_events_order_idx" ON "_pages_v_blocks_upcoming_events" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_upcoming_events_parent_id_idx" ON "_pages_v_blocks_upcoming_events" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_upcoming_events_path_idx" ON "_pages_v_blocks_upcoming_events" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonial_order_idx" ON "_pages_v_blocks_testimonial" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonial_parent_id_idx" ON "_pages_v_blocks_testimonial" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonial_path_idx" ON "_pages_v_blocks_testimonial" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonial_testimonial_idx" ON "_pages_v_blocks_testimonial" USING btree ("testimonial_id");
  CREATE INDEX "_pages_v_blocks_plain_statement_order_idx" ON "_pages_v_blocks_plain_statement" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_plain_statement_parent_id_idx" ON "_pages_v_blocks_plain_statement" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_plain_statement_path_idx" ON "_pages_v_blocks_plain_statement" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_spacer_order_idx" ON "_pages_v_blocks_spacer" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_spacer_parent_id_idx" ON "_pages_v_blocks_spacer" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_spacer_path_idx" ON "_pages_v_blocks_spacer" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_seo_version_seo_og_image_idx" ON "_pages_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_services_id_idx" ON "_pages_v_rels" USING btree ("services_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_hero_image_idx" ON "posts" USING btree ("hero_image_id");
  CREATE INDEX "posts_seo_seo_og_image_idx" ON "posts" USING btree ("seo_og_image_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_users_id_idx" ON "posts_rels" USING btree ("users_id");
  CREATE INDEX "posts_rels_categories_id_idx" ON "posts_rels" USING btree ("categories_id");
  CREATE INDEX "posts_rels_tags_id_idx" ON "posts_rels" USING btree ("tags_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_hero_image_idx" ON "_posts_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_posts_v_version_seo_version_seo_og_image_idx" ON "_posts_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_users_id_idx" ON "_posts_v_rels" USING btree ("users_id");
  CREATE INDEX "_posts_v_rels_categories_id_idx" ON "_posts_v_rels" USING btree ("categories_id");
  CREATE INDEX "_posts_v_rels_tags_id_idx" ON "_posts_v_rels" USING btree ("tags_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE INDEX "services_faq_order_idx" ON "services_faq" USING btree ("_order");
  CREATE INDEX "services_faq_parent_id_idx" ON "services_faq" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_hero_image_idx" ON "services" USING btree ("hero_image_id");
  CREATE INDEX "services_seo_seo_og_image_idx" ON "services" USING btree ("seo_og_image_id");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "services__status_idx" ON "services" USING btree ("_status");
  CREATE INDEX "_services_v_version_faq_order_idx" ON "_services_v_version_faq" USING btree ("_order");
  CREATE INDEX "_services_v_version_faq_parent_id_idx" ON "_services_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_services_v_parent_idx" ON "_services_v" USING btree ("parent_id");
  CREATE INDEX "_services_v_version_version_slug_idx" ON "_services_v" USING btree ("version_slug");
  CREATE INDEX "_services_v_version_version_hero_image_idx" ON "_services_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_services_v_version_seo_version_seo_og_image_idx" ON "_services_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_services_v_version_version_updated_at_idx" ON "_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_services_v_version_version_created_at_idx" ON "_services_v" USING btree ("version_created_at");
  CREATE INDEX "_services_v_version_version__status_idx" ON "_services_v" USING btree ("version__status");
  CREATE INDEX "_services_v_created_at_idx" ON "_services_v" USING btree ("created_at");
  CREATE INDEX "_services_v_updated_at_idx" ON "_services_v" USING btree ("updated_at");
  CREATE INDEX "_services_v_latest_idx" ON "_services_v" USING btree ("latest");
  CREATE INDEX "_services_v_autosave_idx" ON "_services_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_hero_image_idx" ON "events" USING btree ("hero_image_id");
  CREATE INDEX "events_seo_seo_og_image_idx" ON "events" USING btree ("seo_og_image_id");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "events__status_idx" ON "events" USING btree ("_status");
  CREATE INDEX "events_rels_order_idx" ON "events_rels" USING btree ("order");
  CREATE INDEX "events_rels_parent_idx" ON "events_rels" USING btree ("parent_id");
  CREATE INDEX "events_rels_path_idx" ON "events_rels" USING btree ("path");
  CREATE INDEX "events_rels_users_id_idx" ON "events_rels" USING btree ("users_id");
  CREATE INDEX "_events_v_parent_idx" ON "_events_v" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_version_slug_idx" ON "_events_v" USING btree ("version_slug");
  CREATE INDEX "_events_v_version_version_hero_image_idx" ON "_events_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_events_v_version_seo_version_seo_og_image_idx" ON "_events_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_events_v_version_version_updated_at_idx" ON "_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_events_v_version_version_created_at_idx" ON "_events_v" USING btree ("version_created_at");
  CREATE INDEX "_events_v_version_version__status_idx" ON "_events_v" USING btree ("version__status");
  CREATE INDEX "_events_v_created_at_idx" ON "_events_v" USING btree ("created_at");
  CREATE INDEX "_events_v_updated_at_idx" ON "_events_v" USING btree ("updated_at");
  CREATE INDEX "_events_v_latest_idx" ON "_events_v" USING btree ("latest");
  CREATE INDEX "_events_v_autosave_idx" ON "_events_v" USING btree ("autosave");
  CREATE INDEX "_events_v_rels_order_idx" ON "_events_v_rels" USING btree ("order");
  CREATE INDEX "_events_v_rels_parent_idx" ON "_events_v_rels" USING btree ("parent_id");
  CREATE INDEX "_events_v_rels_path_idx" ON "_events_v_rels" USING btree ("path");
  CREATE INDEX "_events_v_rels_users_id_idx" ON "_events_v_rels" USING btree ("users_id");
  CREATE INDEX "testimonials_portrait_idx" ON "testimonials" USING btree ("portrait_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE INDEX "testimonials_rels_order_idx" ON "testimonials_rels" USING btree ("order");
  CREATE INDEX "testimonials_rels_parent_idx" ON "testimonials_rels" USING btree ("parent_id");
  CREATE INDEX "testimonials_rels_path_idx" ON "testimonials_rels" USING btree ("path");
  CREATE INDEX "testimonials_rels_services_id_idx" ON "testimonials_rels" USING btree ("services_id");
  CREATE INDEX "testimonials_rels_events_id_idx" ON "testimonials_rels" USING btree ("events_id");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE UNIQUE INDEX "forms_key_idx" ON "forms" USING btree ("key");
  CREATE INDEX "forms_updated_at_idx" ON "forms" USING btree ("updated_at");
  CREATE INDEX "forms_created_at_idx" ON "forms" USING btree ("created_at");
  CREATE INDEX "form_submissions_form_idx" ON "form_submissions" USING btree ("form_id");
  CREATE UNIQUE INDEX "form_submissions_request_id_idx" ON "form_submissions" USING btree ("request_id");
  CREATE INDEX "form_submissions_updated_at_idx" ON "form_submissions" USING btree ("updated_at");
  CREATE INDEX "form_submissions_created_at_idx" ON "form_submissions" USING btree ("created_at");
  CREATE INDEX "site_settings_social_links_order_idx" ON "site_settings_social_links" USING btree ("_order");
  CREATE INDEX "site_settings_social_links_parent_id_idx" ON "site_settings_social_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_organisation_knows_about_order_idx" ON "site_settings_organisation_knows_about" USING btree ("_order");
  CREATE INDEX "site_settings_organisation_knows_about_parent_id_idx" ON "site_settings_organisation_knows_about" USING btree ("_parent_id");
  CREATE INDEX "site_settings_default_og_image_idx" ON "site_settings" USING btree ("default_og_image_id");
  CREATE INDEX "site_settings_rels_order_idx" ON "site_settings_rels" USING btree ("order");
  CREATE INDEX "site_settings_rels_parent_idx" ON "site_settings_rels" USING btree ("parent_id");
  CREATE INDEX "site_settings_rels_path_idx" ON "site_settings_rels" USING btree ("path");
  CREATE INDEX "site_settings_rels_users_id_idx" ON "site_settings_rels" USING btree ("users_id");
  CREATE INDEX "header_nav_items_children_order_idx" ON "header_nav_items_children" USING btree ("_order");
  CREATE INDEX "header_nav_items_children_parent_id_idx" ON "header_nav_items_children" USING btree ("_parent_id");
  CREATE INDEX "header_nav_items_order_idx" ON "header_nav_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_parent_id_idx" ON "header_nav_items" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_links_order_idx" ON "footer_columns_links" USING btree ("_order");
  CREATE INDEX "footer_columns_links_parent_id_idx" ON "footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_order_idx" ON "footer_columns" USING btree ("_order");
  CREATE INDEX "footer_columns_parent_id_idx" ON "footer_columns" USING btree ("_parent_id");
  ALTER TABLE "users" ADD CONSTRAINT "users_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_forms_fk" FOREIGN KEY ("forms_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_submissions_fk" FOREIGN KEY ("form_submissions_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "users_slug_idx" ON "users" USING btree ("slug");
  CREATE INDEX "users_portrait_idx" ON "users" USING btree ("portrait_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_forms_id_idx" ON "payload_locked_documents_rels" USING btree ("forms_id");
  CREATE INDEX "payload_locked_documents_rels_form_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("form_submissions_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_hero_seasonal_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_prose" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_feature" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_gallery_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_pull_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_founder_card_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_founder_card" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_product_spotlight" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_journal_feed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_service_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_upcoming_events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_testimonial" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_plain_statement" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_spacer" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_hero_seasonal_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_prose" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_feature" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_gallery_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_pull_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_founder_card_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_founder_card" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_product_spotlight" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_journal_feed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_service_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_upcoming_events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_testimonial" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_plain_statement" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_spacer" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "testimonials_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "redirects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "form_submissions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_social_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_organisation_knows_about" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header_nav_items_children" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header_nav_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_columns_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "media" CASCADE;
  DROP TABLE "pages_blocks_hero_seasonal_images" CASCADE;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_prose" CASCADE;
  DROP TABLE "pages_blocks_feature" CASCADE;
  DROP TABLE "pages_blocks_gallery_images" CASCADE;
  DROP TABLE "pages_blocks_gallery" CASCADE;
  DROP TABLE "pages_blocks_pull_quote" CASCADE;
  DROP TABLE "pages_blocks_founder_card_links" CASCADE;
  DROP TABLE "pages_blocks_founder_card" CASCADE;
  DROP TABLE "pages_blocks_product_spotlight" CASCADE;
  DROP TABLE "pages_blocks_journal_feed" CASCADE;
  DROP TABLE "pages_blocks_faq_items" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_service_list" CASCADE;
  DROP TABLE "pages_blocks_upcoming_events" CASCADE;
  DROP TABLE "pages_blocks_testimonial" CASCADE;
  DROP TABLE "pages_blocks_plain_statement" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages_blocks_spacer" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_seasonal_images" CASCADE;
  DROP TABLE "_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_prose" CASCADE;
  DROP TABLE "_pages_v_blocks_feature" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery_images" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery" CASCADE;
  DROP TABLE "_pages_v_blocks_pull_quote" CASCADE;
  DROP TABLE "_pages_v_blocks_founder_card_links" CASCADE;
  DROP TABLE "_pages_v_blocks_founder_card" CASCADE;
  DROP TABLE "_pages_v_blocks_product_spotlight" CASCADE;
  DROP TABLE "_pages_v_blocks_journal_feed" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_service_list" CASCADE;
  DROP TABLE "_pages_v_blocks_upcoming_events" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonial" CASCADE;
  DROP TABLE "_pages_v_blocks_plain_statement" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v_blocks_spacer" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "services_faq" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "_services_v_version_faq" CASCADE;
  DROP TABLE "_services_v" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "events_rels" CASCADE;
  DROP TABLE "_events_v" CASCADE;
  DROP TABLE "_events_v_rels" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "testimonials_rels" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "forms" CASCADE;
  DROP TABLE "form_submissions" CASCADE;
  DROP TABLE "site_settings_social_links" CASCADE;
  DROP TABLE "site_settings_organisation_knows_about" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_rels" CASCADE;
  DROP TABLE "header_nav_items_children" CASCADE;
  DROP TABLE "header_nav_items" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "footer_columns_links" CASCADE;
  DROP TABLE "footer_columns" CASCADE;
  DROP TABLE "footer" CASCADE;
  ALTER TABLE "users" DROP CONSTRAINT "users_portrait_id_media_id_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_media_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pages_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_posts_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_categories_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_tags_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_services_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_events_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_testimonials_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_redirects_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_forms_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_form_submissions_fk";

  DROP INDEX "users_slug_idx";
  DROP INDEX "users_portrait_idx";
  DROP INDEX "payload_locked_documents_rels_media_id_idx";
  DROP INDEX "payload_locked_documents_rels_pages_id_idx";
  DROP INDEX "payload_locked_documents_rels_posts_id_idx";
  DROP INDEX "payload_locked_documents_rels_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_tags_id_idx";
  DROP INDEX "payload_locked_documents_rels_services_id_idx";
  DROP INDEX "payload_locked_documents_rels_events_id_idx";
  DROP INDEX "payload_locked_documents_rels_testimonials_id_idx";
  DROP INDEX "payload_locked_documents_rels_redirects_id_idx";
  DROP INDEX "payload_locked_documents_rels_forms_id_idx";
  DROP INDEX "payload_locked_documents_rels_form_submissions_id_idx";
  ALTER TABLE "users" DROP COLUMN "name";
  ALTER TABLE "users" DROP COLUMN "slug";
  ALTER TABLE "users" DROP COLUMN "role";
  ALTER TABLE "users" DROP COLUMN "public_profile";
  ALTER TABLE "users" DROP COLUMN "public_title";
  ALTER TABLE "users" DROP COLUMN "public_bio";
  ALTER TABLE "users" DROP COLUMN "portrait_id";
  ALTER TABLE "users" DROP COLUMN "no_index";
  ALTER TABLE "users" DROP COLUMN "exclude_from_sitemap";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "media_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "posts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tags_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "services_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "events_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "redirects_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "forms_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "form_submissions_id";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_pages_blocks_hero_seasonal_images_season";
  DROP TYPE "public"."enum_pages_blocks_hero_style";
  DROP TYPE "public"."enum_pages_blocks_feature_image_side";
  DROP TYPE "public"."enum_pages_blocks_spacer_size";
  DROP TYPE "public"."enum_pages_seo_sitemap_priority";
  DROP TYPE "public"."enum_pages_seo_sitemap_change_frequency";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_hero_seasonal_images_season";
  DROP TYPE "public"."enum__pages_v_blocks_hero_style";
  DROP TYPE "public"."enum__pages_v_blocks_feature_image_side";
  DROP TYPE "public"."enum__pages_v_blocks_spacer_size";
  DROP TYPE "public"."enum__pages_v_version_seo_sitemap_priority";
  DROP TYPE "public"."enum__pages_v_version_seo_sitemap_change_frequency";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_posts_seo_sitemap_priority";
  DROP TYPE "public"."enum_posts_seo_sitemap_change_frequency";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_seo_sitemap_priority";
  DROP TYPE "public"."enum__posts_v_version_seo_sitemap_change_frequency";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_services_format";
  DROP TYPE "public"."enum_services_seo_sitemap_priority";
  DROP TYPE "public"."enum_services_seo_sitemap_change_frequency";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum__services_v_version_format";
  DROP TYPE "public"."enum__services_v_version_seo_sitemap_priority";
  DROP TYPE "public"."enum__services_v_version_seo_sitemap_change_frequency";
  DROP TYPE "public"."enum__services_v_version_status";
  DROP TYPE "public"."enum_events_type";
  DROP TYPE "public"."enum_events_event_status";
  DROP TYPE "public"."enum_events_seo_sitemap_priority";
  DROP TYPE "public"."enum_events_seo_sitemap_change_frequency";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum__events_v_version_type";
  DROP TYPE "public"."enum__events_v_version_event_status";
  DROP TYPE "public"."enum__events_v_version_seo_sitemap_priority";
  DROP TYPE "public"."enum__events_v_version_seo_sitemap_change_frequency";
  DROP TYPE "public"."enum__events_v_version_status";
  DROP TYPE "public"."enum_redirects_status_code";
  DROP TYPE "public"."enum_form_submissions_role";
  DROP TYPE "public"."enum_form_submissions_need";
  DROP TYPE "public"."enum_form_submissions_delivery_status";
  DROP TYPE "public"."enum_site_settings_default_sitemap_priority";
  DROP TYPE "public"."enum_site_settings_default_sitemap_change_frequency";`)
}
