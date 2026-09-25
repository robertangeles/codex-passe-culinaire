import type { Payload } from 'payload'
import type { Media, SiteSetting } from '../payload-types'
import { isoDate, publicMediaUrl } from './seo/core'
import { iterateExportContent, type ExportCollection } from './export-content'
import { renderRichTextExport } from './rich-text-export'

export const sitemapKinds = ['pages', 'posts', 'taxonomies', 'authors', 'services', 'training'] as const
export type SitemapKind = (typeof sitemapKinds)[number]

const changeFrequencies = new Set(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'])
const defaultFrequencies = new Set(['daily', 'weekly', 'monthly', 'yearly'])
const priorities = new Set(['0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0'])
const builtInPages = ['/journal', '/services', '/training']
const collectionsByKind: Record<SitemapKind, ExportCollection[]> = {
  pages: ['pages'], posts: ['posts'], taxonomies: ['categories', 'tags'], authors: ['users'],
  services: ['services'], training: ['events'],
}

function originUrl(origin: string): string {
  const url = new URL(origin)
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('The public origin is invalid.')
  return url.origin
}

function xml(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

function urlFor(kind: SitemapKind, collection: ExportCollection, document: Record<string, unknown>, origin: string): string | undefined {
  if (typeof document.slug !== 'string' || !document.slug.trim()) return undefined
  const slug = encodeURIComponent(document.slug)
  let path: string
  if (collection === 'pages') path = document.slug === 'home' ? '/' : `/${slug}`
  else if (collection === 'posts') path = `/journal/${slug}`
  else if (collection === 'categories') path = `/journal/category/${slug}`
  else if (collection === 'tags') path = `/journal/tag/${slug}`
  else if (collection === 'users') path = `/journal/author/${slug}`
  else if (collection === 'services') path = `/services/${slug}`
  else if (collection === 'events') path = `/training/${slug}`
  else return undefined
  if (kind === 'pages' && builtInPages.includes(path)) return undefined
  return new URL(path, origin).href
}

function documentOptions(document: Record<string, unknown>, settings: SiteSetting, allowOverrides: boolean): { lastmod?: string; priority: string; frequency: string } {
  const seo = document.seo && typeof document.seo === 'object' ? document.seo as Record<string, unknown> : undefined
  const configuredPriority = settings.defaultSitemap?.priority
  const configuredFrequency = settings.defaultSitemap?.changeFrequency
  const documentPriority = allowOverrides ? seo?.sitemapPriority : undefined
  const documentFrequency = allowOverrides ? seo?.sitemapChangeFrequency : undefined
  return {
    lastmod: isoDate(document.updatedAt),
    priority: typeof documentPriority === 'string' && priorities.has(documentPriority)
      ? documentPriority
      : typeof configuredPriority === 'string' && priorities.has(configuredPriority) ? configuredPriority : '0.5',
    frequency: typeof documentFrequency === 'string' && changeFrequencies.has(documentFrequency)
      ? documentFrequency
      : typeof configuredFrequency === 'string' && defaultFrequencies.has(configuredFrequency) ? configuredFrequency : 'monthly',
  }
}

function sitemapEntry(loc: string, options: { lastmod?: string; priority: string; frequency: string }, images: Array<{ url: string; alt: string }> = []): string {
  const imageXml = images.map(({ url, alt }) => `<image:image><image:loc>${xml(url)}</image:loc><image:title>${xml(alt)}</image:title></image:image>`).join('')
  return `<url><loc>${xml(loc)}</loc>${options.lastmod ? `<lastmod>${xml(options.lastmod)}</lastmod>` : ''}<changefreq>${options.frequency}</changefreq><priority>${options.priority}</priority>${imageXml}</url>`
}

function postImages(document: Record<string, unknown>, origin: string): Array<{ url: string; alt: string }> {
  const images = new Map<string, string>()
  const add = (url: string | undefined, alt: unknown) => {
    if (url && !images.has(url)) images.set(url, typeof alt === 'string' ? alt : '')
  }
  const hero = document.heroImage
  if (hero && typeof hero === 'object') {
    const media = hero as Media
    add(publicMediaUrl(media, origin), media.alt)
  }
  for (const image of renderRichTextExport(document.body, origin).images) add(image.url, image.alt)
  return [...images].map(([url, alt]) => ({ url, alt }))
}

export function sitemapIndex(origin: string): string {
  const base = originUrl(origin)
  const children = sitemapKinds.map(kind => `<sitemap><loc>${xml(new URL(`/sitemap-${kind}.xml`, base).href)}</loc></sitemap>`).join('')
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${children}</sitemapindex>`
}

export async function* sitemapChunks(payload: Payload, kind: SitemapKind, settings: SiteSetting, origin: string): AsyncGenerator<string> {
  const base = originUrl(origin)
  const imageNamespace = kind === 'posts' ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : ''
  yield `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${imageNamespace}>`
  if (kind === 'pages') {
    for (const path of builtInPages) {
      const options = {
        priority: typeof settings.defaultSitemap?.priority === 'string' && priorities.has(settings.defaultSitemap.priority) ? settings.defaultSitemap.priority : '0.5',
        frequency: typeof settings.defaultSitemap?.changeFrequency === 'string' && defaultFrequencies.has(settings.defaultSitemap.changeFrequency) ? settings.defaultSitemap.changeFrequency : 'monthly',
      }
      yield sitemapEntry(new URL(path, base).href, options)
    }
  }
  for (const collection of collectionsByKind[kind]) {
    for await (const item of iterateExportContent(payload, collection, true)) {
      const document = item as unknown as Record<string, unknown>
      const loc = urlFor(kind, collection, document, base)
      if (!loc) continue
      const options = documentOptions(document, settings, !['categories', 'tags', 'users'].includes(collection))
      const images = kind === 'posts' ? postImages(document, base) : []
      yield sitemapEntry(loc, options, images)
    }
  }
  yield '</urlset>'
}
