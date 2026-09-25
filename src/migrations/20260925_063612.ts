import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "search_text" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_search_text" varchar;
  ALTER TABLE "posts" ADD COLUMN "search_text" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_search_text" varchar;
  CREATE INDEX "pages_search_text_fts_idx" ON "pages" USING GIN (to_tsvector('english', coalesce("search_text", '')));
  CREATE INDEX "posts_search_text_fts_idx" ON "posts" USING GIN (to_tsvector('english', coalesce("search_text", '')));`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "pages_search_text_fts_idx";
   DROP INDEX IF EXISTS "posts_search_text_fts_idx";
   ALTER TABLE "pages" DROP COLUMN "search_text";
  ALTER TABLE "_pages_v" DROP COLUMN "version_search_text";
  ALTER TABLE "posts" DROP COLUMN "search_text";
  ALTER TABLE "_posts_v" DROP COLUMN "version_search_text";`)
}
