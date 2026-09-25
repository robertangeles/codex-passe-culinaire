import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Users } from './payload/collections/Users'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const databaseUri = process.env.DATABASE_URI
const secret = process.env.PAYLOAD_SECRET

if (!databaseUri || !secret) {
  throw new Error('DATABASE_URI and PAYLOAD_SECRET must be set')
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: dirname },
  },
  collections: [Users],
  db: postgresAdapter({
    pool: { connectionString: databaseUri },
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  editor: lexicalEditor(),
  secret,
  sharp,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
})
