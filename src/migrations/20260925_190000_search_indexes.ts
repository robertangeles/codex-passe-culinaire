import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE INDEX pages_public_search_idx ON pages USING gin (to_tsvector('english', coalesce(search_text, ''))) WHERE _status = 'published';
    CREATE INDEX posts_public_search_idx ON posts USING gin (to_tsvector('english', coalesce(search_text, ''))) WHERE _status = 'published';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS pages_public_search_idx;
    DROP INDEX IF EXISTS posts_public_search_idx;
  `)
}
