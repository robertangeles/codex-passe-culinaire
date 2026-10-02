import { isDeepStrictEqual } from 'node:util'
import { readFile } from 'node:fs/promises'
import type { Payload } from 'payload'
import type { Media, Page, Post } from '../src/payload-types'
import originalLayout from './assets/home-before-c4.json' with { type: 'json' }

const rich = (text: string): NonNullable<Post['body']> => ({
  root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0,
    children: [{ type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0,
      children: [{ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' }] }] },
})

export function homepageLayout(image: Media | number): Page['layout'] {
  return [
    { blockType: 'hero', heading: 'From craft\nto what\ncomes next.', eyebrow: 'A culinary company · Melbourne', style: 'image', image,
      summary: 'Kitchen experience, carried into the tools and knowledge of today. CulinAIre Kitchen is our first place to begin.' },
    { blockType: 'productSpotlight', heading: 'CulinAIre Kitchen', body: rich('A practical place to begin: the daily prep list. CulinAIre Kitchen uses AI to help organise prep from a menu, including components shared between dishes.'), webUrl: '/culinaire-kitchen' },
    { blockType: 'founderCard', name: 'Alex Charasse', title: 'Maître Pâtissier · Maître Chocolatier', bio: rich('Founder of Almost French Patisserie in Richmond and Almost French Epicure on Little Collins Street, Melbourne.') },
    { blockType: 'founderCard', name: 'Rob Angeles', title: 'Chef · Data Architect', bio: rich('Trained in pastry and hot kitchen. A Data Architect bringing a kitchen perspective to contemporary tools.') },
    { blockType: 'cta', statement: 'CulinAIre Kitchen is the first offer from Passe Culinaire. The company brings together culinary practice, teaching and contemporary tools.', label: 'Start a conversation', url: '/contact' },
  ]
}

// Compare populated layouts, retaining every editorial field but omitting CMS row IDs and empty defaults.
function editorialValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(editorialValue)
  if (value && typeof value === 'object') {
    if ('filename' in value) return { filename: value.filename }
    return Object.fromEntries(Object.entries(value)
      .filter(([key, item]) => key !== 'id' && item != null && !(Array.isArray(item) && item.length === 0))
      .map(([key, item]) => [key, editorialValue(item)]))
  }
  return value
}

export function layoutsMatch(left: unknown, right: unknown): boolean {
  return isDeepStrictEqual(editorialValue(left), editorialValue(right))
}

export function isOriginalHomepage(layout: Page['layout']): boolean {
  return layoutsMatch(layout, originalLayout)
}

export async function ensureHomepageImage(payload: Payload): Promise<Media> {
  const filename = 'c4-pastry-concept.webp'
  const existing = await payload.find({ collection: 'media', overrideAccess: true, limit: 1, where: { filename: { equals: filename } } })
  if (existing.docs[0]) return existing.docs[0]
  const data = await readFile(new URL('./assets/c4-pastry-concept.webp', import.meta.url))
  return payload.create({ collection: 'media', overrideAccess: true,
    data: { alt: 'Concept photograph of anonymous hands finishing pear tartlets at a pastry bench.',
      caption: 'Founded by chefs. Shaped by the work.\nConcept photograph, not the founders or their premises.', focalX: 100, focalY: 50, placeholder: false },
    file: { data, mimetype: 'image/webp', name: filename, size: data.length },
  })
}


export function assertLocalC4Target(publicUrl: string, databaseUri: string, storage: string): void {
  const loopback = new Set(['localhost', '127.0.0.1', '[::1]'])
  let publicOrigin: URL
  let database: URL
  try {
    publicOrigin = new URL(publicUrl)
    database = new URL(databaseUri)
  } catch {
    throw new Error('A valid local public URL and database URI are required for the C4 update.')
  }
  if (!loopback.has(publicOrigin.hostname) || !loopback.has(database.hostname)
    || !['postgres:', 'postgresql:'].includes(database.protocol) || database.searchParams.has('host')
    || storage !== 'local') {
    throw new Error('The C4 update requires a loopback application, loopback PostgreSQL database and local media storage.')
  }
}
