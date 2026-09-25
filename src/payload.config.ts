import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { resendAdapter } from '@payloadcms/email-resend'
import { BlocksFeature, FixedToolbarFeature, InlineToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig, type EmailAdapter } from 'payload'
import sharp from 'sharp'

import { pageBlocks, lexicalBlocks } from './payload/blocks'
import { Categories, Events, Pages, Posts, Redirects, Services, Tags, Testimonials } from './payload/collections/content'
import { Forms, FormSubmissions } from './payload/collections/forms'
import { Media } from './payload/collections/Media'
import { Users } from './payload/collections/Users'
import { Footer, Header, SiteSettings } from './payload/globals'
import { publicationTask } from './payload/publication'
import { isAdmin } from './payload/access'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const databaseUri = process.env.DATABASE_URI
const secret = process.env.PAYLOAD_SECRET
if (!databaseUri || !secret) throw new Error('DATABASE_URI and PAYLOAD_SECRET must be set')

const storage = process.env.MEDIA_STORAGE || 'local'
if (storage !== 'local' && storage !== 's3') throw new Error('MEDIA_STORAGE must be local or s3')
const s3Bucket = process.env.S3_BUCKET
const s3Region = process.env.S3_REGION
if (storage === 's3' && (!s3Bucket || !s3Region)) throw new Error('S3_BUCKET and S3_REGION are required for S3 media storage')
if (storage === 's3' && (!process.env.S3_PUBLIC_BASE_URL || !/^https:\/\/[^/]+/.test(process.env.S3_PUBLIC_BASE_URL)))
  throw new Error('S3_PUBLIC_BASE_URL must be a public HTTPS origin for crawler-accessible media')

const mailProvider = process.env.MAIL_PROVIDER || 'smtp'
if (mailProvider !== 'smtp' && mailProvider !== 'resend') throw new Error('MAIL_PROVIDER must be smtp or resend')
const fromAddress = process.env.MAIL_FROM_ADDRESS || 'noreply@passeculinaire.com'
const unavailableEmail: EmailAdapter = () => ({ name: 'unconfigured', defaultFromAddress: fromAddress, defaultFromName: 'Passe Culinaire',
  sendEmail: async () => { throw new Error('Email delivery is not configured.') },
})
const email = mailProvider === 'resend'
  ? resendAdapter({ apiKey: process.env.RESEND_API_KEY || '', defaultFromAddress: fromAddress, defaultFromName: 'Passe Culinaire' })
  : process.env.SMTP_HOST
    ? nodemailerAdapter({ defaultFromAddress: fromAddress, defaultFromName: 'Passe Culinaire', transportOptions: { host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === 'true', auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined } })
    : unavailableEmail
if (mailProvider === 'resend' && !process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is required for Resend')

export default buildConfig({
  admin: { user: Users.slug, importMap: { baseDir: dirname } },
  collections: [Users, Media, Pages, Posts, Categories, Tags, Services, Events, Testimonials, Redirects, Forms, FormSubmissions],
  globals: [SiteSettings, Header, Footer],
  db: postgresAdapter({ pool: { connectionString: databaseUri }, push: false, migrationDir: path.resolve(dirname, 'migrations') }),
  editor: lexicalEditor({ features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    BlocksFeature({ blocks: lexicalBlocks, inlineBlocks: lexicalBlocks }),
    FixedToolbarFeature(), InlineToolbarFeature(),
  ] }),
  blocks: pageBlocks,
  email,
  upload: { limits: { fileSize: 10 * 1024 * 1024 }, requestSizeLimit: 12 * 1024 * 1024 },
  jobs: { tasks: [publicationTask], access: { queue: ({ req }) => isAdmin(req.user), run: ({ req }) => isAdmin(req.user), cancel: ({ req }) => isAdmin(req.user) }, autoRun: process.env.RUN_JOBS === 'true' && process.env.NODE_ENV === 'production' ? [{ cron: '*/10 * * * * *', limit: 20 }] : [] },
  plugins: storage === 's3' ? [s3Storage({
    collections: { media: true }, bucket: s3Bucket!,
    config: { region: s3Region!, endpoint: process.env.S3_ENDPOINT || undefined, forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true', credentials: process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY ? { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY } : undefined },
  })] : [],
  secret, sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
    postProcess: [({ compiledTypes }) =>
      // Lexical's child-node schema marks its string discriminator as tsType: 'any'.
      compiledTypes.replace(/^(\s*)type: any;$/gm, '$1type: string;')],
  },
})
