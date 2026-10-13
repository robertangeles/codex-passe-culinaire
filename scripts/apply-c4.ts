import { mkdir, writeFile } from 'node:fs/promises'
import { getPayload } from 'payload'
import { assertLocalC4Target, ensureHomepageImage, homepageLayout, isOriginalHomepage, layoutsMatch } from './homepage-content'

process.loadEnvFile('.env')
assertLocalC4Target(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000', process.env.DATABASE_URI || '', process.env.MEDIA_STORAGE || 'local')
const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config })
try {
  const query = { collection: 'pages' as const, overrideAccess: true, depth: 1, limit: 1, where: { slug: { equals: 'home' } } }
  const published = (await payload.find({ ...query, draft: false })).docs[0]
  const latest = (await payload.find({ ...query, draft: true })).docs[0]
  if (!published || published._status !== 'published') throw new Error('No published homepage to update.')
  if (!latest || latest._status !== 'published' || latest.updatedAt !== published.updatedAt) throw new Error('An unpublished homepage edit exists. Preserve it before applying this update.')
  const existingImage = (await payload.find({ collection: 'media', overrideAccess: true, limit: 1, where: { filename: { equals: 'c4-pastry-concept.webp' } } })).docs[0]
  if (existingImage && layoutsMatch(published.layout, homepageLayout(existingImage))) {
    console.log('C4 is already applied. No content changed.')
  } else {
    if (!isOriginalHomepage(published.layout)) throw new Error('Homepage differs from the original seed. Aborting to preserve editorial changes.')
    await mkdir('.local/design-update', { recursive: true })
    const backup = `.local/design-update/home-before-c4-${Date.now()}.json`
    const unpopulated = await payload.findByID({ collection: 'pages', id: published.id, depth: 0, overrideAccess: true })
    await writeFile(backup, JSON.stringify(unpopulated, null, 2), { mode: 0o600, flag: 'wx' })
    const image = await ensureHomepageImage(payload)
    // Recheck after the potentially slow image upload; do not silently replace an edit made during it.
    const fresh = (await payload.find({ ...query, draft: true })).docs[0]
    if (!fresh || fresh.updatedAt !== latest.updatedAt) throw new Error('Homepage changed during image preparation. Aborting before page update.')
    await payload.update({ collection: 'pages', id: published.id, overrideAccess: true, data: { layout: homepageLayout(image.id) } })
    console.log(`C4 applied to the local homepage. Previous content saved at ${backup}.`)
  }
} finally {
  await payload.destroy()
}
process.exit(0)
