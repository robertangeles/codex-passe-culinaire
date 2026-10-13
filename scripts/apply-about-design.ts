import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { getPayload, type Payload } from 'payload'
import { assertLocalC4Target } from './homepage-content'
import { runGuardedAboutUpdate } from './about-content'

if (existsSync('.env')) process.loadEnvFile('.env')
let payload: Payload | undefined

try {
  assertLocalC4Target(
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
    process.env.DATABASE_URI || '',
    process.env.MEDIA_STORAGE || 'local',
  )
  const { default: config } = await import('../src/payload.config')
  payload = await getPayload({ config })

  const query = { collection: 'pages' as const, overrideAccess: true, depth: 0, limit: 1, where: { slug: { equals: 'about' } } }
  const published = (await payload.find({ ...query, draft: false })).docs[0]
  const latest = (await payload.find({ ...query, draft: true })).docs[0]
  const result = await runGuardedAboutUpdate({
    published,
    latest,
    getMedia: async (id) => {
      try {
        const media = await payload!.findByID({ collection: 'media', id, overrideAccess: true, depth: 0 })
        return { id: media.id, placeholder: media.placeholder }
      } catch {
        return undefined
      }
    },
    backup: async () => {
      if (!published) throw new Error('No published About page is available.')
      await mkdir('.local/about-design-backups', { recursive: true })
      const backupPath = `.local/about-design-backups/about-${Date.now()}.json`
      const current = await payload!.findByID({ collection: 'pages', id: published.id, overrideAccess: true, depth: 0 })
      await writeFile(backupPath, JSON.stringify(current, null, 2), { mode: 0o600, flag: 'wx' })
    },
    reread: async () => (await payload!.find({ ...query, draft: true })).docs[0],
    update: async (id, layout) => { await payload!.update({ collection: 'pages', id, overrideAccess: true, data: { layout } }) },
  })

  if (result.changed) console.log('The approved About design was applied locally. A private backup was saved before the update.')
  else console.log('The approved About design is already applied. No content changed.')
} catch {
  console.error('The About design update failed. No page content or private error details were logged.')
  process.exitCode = 1
} finally {
  if (payload) await payload.destroy()
}

process.exit(process.exitCode ?? 0)
