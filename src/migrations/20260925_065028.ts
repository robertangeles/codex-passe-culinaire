import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "form_submissions" ADD COLUMN "source_hash" varchar;
  CREATE INDEX "form_submissions_source_hash_idx" ON "form_submissions" USING btree ("source_hash");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "form_submissions_source_hash_idx";
  ALTER TABLE "form_submissions" DROP COLUMN "source_hash";`)
}
