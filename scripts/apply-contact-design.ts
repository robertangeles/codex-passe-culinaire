import { mkdir, writeFile } from 'node:fs/promises'
import { getPayload, type Payload } from 'payload'
import type { Page, Post } from '../src/payload-types'
import { assertLocalC4Target, layoutsMatch } from './homepage-content'

const boilerplate = 'Tell us what you need. The contact form appears below.'

function rich(text: string): NonNullable<Post['body']> {
  return {
    root: {
      type: 'root', version: 1, direction: 'ltr', format: '', indent: 0,
      children: [{
        type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0,
        children: [{ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' }],
      }],
    },
  }
}

function seededContactLayout(): Page['layout'] {
  return [
    { blockType: 'hero', heading: 'Contact', style: 'quiet' },
    { blockType: 'prose', body: rich(boilerplate) },
  ]
}

function approvedContactLayout(hero: Extract<Page['layout'][number], { blockType: 'hero' }>): Page['layout'] {
  return [{
    ...hero,
    heading: 'A conversation.\nA place to begin.',
    eyebrow: 'Contact',
    summary: 'Tell us what’s happening in your kitchen, or what you have in mind.',
  }]
}

process.loadEnvFile('.env')
let payload: Payload | undefined

try {
  assertLocalC4Target(
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
    process.env.DATABASE_URI || '',
    process.env.MEDIA_STORAGE || 'local',
  )
  const { default: config } = await import('../src/payload.config')
  payload = await getPayload({ config })

  const query = { collection: 'pages' as const, overrideAccess: true, depth: 0, limit: 1, where: { slug: { equals: 'contact' } } }
  const published = (await payload.find({ ...query, draft: false })).docs[0]
  const latest = (await payload.find({ ...query, draft: true })).docs[0]
  if (!published || published._status !== 'published') throw new Error('No published contact page is available.')
  if (!latest || latest._status !== 'published' || latest.updatedAt !== published.updatedAt) {
    throw new Error('An unpublished contact page edit exists. Preserve it before applying this update.')
  }

  const expected = approvedContactLayout({ blockType: 'hero', heading: 'Contact', style: 'quiet' })
  if (layoutsMatch(published.layout, expected)) {
    console.log('The approved contact design is already applied. No content changed.')
  } else {
    if (!layoutsMatch(published.layout, seededContactLayout())) {
      throw new Error('The contact page differs from its original seeded layout. Aborting to preserve editorial changes.')
    }

    const hero = published.layout[0]
    if (hero.blockType !== 'hero') throw new Error('The contact page hero is not in the expected position.')
    const nextLayout = approvedContactLayout(hero)

    await mkdir('.local/contact-design-backups', { recursive: true })
    const backup = `.local/contact-design-backups/contact-${Date.now()}.json`
    const unpopulated = await payload.findByID({ collection: 'pages', id: published.id, depth: 0, overrideAccess: true })
    await writeFile(backup, JSON.stringify(unpopulated, null, 2), { mode: 0o600, flag: 'wx' })

    const fresh = (await payload.find({ ...query, draft: true })).docs[0]
    if (!fresh || fresh._status !== 'published' || fresh.updatedAt !== latest.updatedAt) {
      throw new Error('The contact page changed during backup. Aborting before the page update.')
    }

    await payload.update({ collection: 'pages', id: published.id, overrideAccess: true, data: { layout: nextLayout } })
    console.log(`The approved contact design was applied locally. Previous content saved at ${backup}.`)
  }
} catch {
  console.error('The contact design update failed. No page content or private error details were logged.')
  process.exitCode = 1
} finally {
  if (payload) await payload.destroy()
}

process.exit(process.exitCode ?? 0)
