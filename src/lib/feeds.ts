import type { Payload } from 'payload'
import type { Category, Media, Post, SiteSetting, Tag, User } from '../payload-types'
import { iterateExportContent } from './export-content'
import { confirmedText, isoDate, publicMediaUrl } from './seo/core'
import { renderRichTextExport } from './rich-text-export'

function xml(value: string): string {
  const xmlSafe = value.replace(/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu, '')
  return xmlSafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

function text(value: unknown): string | undefined {
  return confirmedText(value)
}

function populated<T extends { id: number }>(value: number | T | null | undefined): value is T {
  return typeof value === 'object' && value !== null && typeof value.id === 'number'
}

function names<T extends { id: number; name: string }>(values: Array<number | T> | null | undefined): string[] {
  if (!Array.isArray(values)) return []
  return values.flatMap((value) => populated(value) ? [text(value.name)].filter((name): name is string => Boolean(name)) : [])
}

function authors(values: Post['authors'], origin: string): Array<{ name: string; url?: string }> {
  if (!Array.isArray(values)) return []
  return values.flatMap((value) => {
    if (!populated<User>(value) || value.publicProfile === false) return []
    const name = text(value.name)
    if (!name) return []
    const slug = text(value.slug)
    return [{ name, ...(slug && value.noIndex !== true ? { url: new URL(`/journal/author/${encodeURIComponent(slug)}`, origin).href } : {}) }]
  })
}

function articleHtml(post: Post, origin: string): string {
  const children: unknown[] = []
  if (populated<Media>(post.heroImage)) {
    const media = post.heroImage
    const caption = media.placeholder === true
      ? ['Placeholder image', text(media.caption)].filter(Boolean).join('. ')
      : text(media.caption)
    children.push({
      type: 'upload', version: 1, relationTo: 'media', value: media,
      ...(caption ? { fields: { caption } } : {}),
    })
  }
  const bodyRoot = post.body?.root
  if (bodyRoot && Array.isArray(bodyRoot.children)) children.push(...bodyRoot.children)
  const rich = renderRichTextExport({ root: {
    type: 'root', direction: 'ltr', format: '', indent: 0, version: 1, children,
  } }, origin)
  return rich.html
}

function articleUrl(post: Post, origin: string): string {
  return new URL(`/journal/${encodeURIComponent(post.slug)}`, origin).href
}

function feedTitle(settings: SiteSetting): string {
  return text(settings.name) ?? 'Passe Culinaire'
}

function feedDescription(settings: SiteSetting): string | undefined {
  return text(settings.description) ?? text(settings.tagline)
}

function rssChannel(settings: SiteSetting, origin: string): string {
  const title = feedTitle(settings)
  const description = feedDescription(settings) ?? title
  return `<channel><title>${xml(title)}</title><description>${xml(description)}</description><link>${xml(origin)}</link><language>en-au</language><atom:link href="${xml(new URL('/feed.xml', origin).href)}" rel="self" type="application/rss+xml"/>`
}

function rssItem(post: Post, origin: string): string {
  const title = text(post.title) ?? 'Untitled'
  const url = articleUrl(post, origin)
  const excerpt = text(post.excerpt)
  const date = isoDate(post.publishedAt)
  const creators = authors(post.authors, origin).map((author) => `<dc:creator>${xml(author.name)}</dc:creator>`).join('')
  const categories = [...names<Category>(post.categories), ...names<Tag>(post.tags)].map((name) => `<category>${xml(name)}</category>`).join('')
  return `<item><title>${xml(title)}</title><link>${xml(url)}</link><guid isPermaLink="true">${xml(url)}</guid>${excerpt ? `<description>${xml(excerpt)}</description>` : ''}<content:encoded>${xml(articleHtml(post, origin))}</content:encoded>${date ? `<pubDate>${xml(new Date(date).toUTCString())}</pubDate>` : ''}${creators}${categories}</item>`
}

function jsonItem(post: Post, origin: string): string {
  const url = articleUrl(post, origin)
  const published = isoDate(post.publishedAt)
  const modified = isoDate(post.updatedAt)
  const hero = populated<Media>(post.heroImage) && !post.heroImage.placeholder ? publicMediaUrl(post.heroImage, origin) : undefined
  const entry = {
    id: url,
    url,
    title: text(post.title) ?? 'Untitled',
    content_html: articleHtml(post, origin),
    ...(text(post.excerpt) ? { summary: text(post.excerpt) } : {}),
    ...(published ? { date_published: published } : {}),
    ...(modified ? { date_modified: modified } : {}),
    authors: authors(post.authors, origin),
    ...(hero ? { image: hero } : {}),
  }
  return JSON.stringify(entry)
}

/** Stream a complete RSS 2.0 or JSON Feed 1.1 document from bounded public cursor reads. */
export async function* feedChunks(payload: Payload, settings: SiteSetting, origin: string, format: 'rss' | 'json'): AsyncGenerator<string> {
  const parsedOrigin = new URL(origin)
  if (!['http:', 'https:'].includes(parsedOrigin.protocol) || parsedOrigin.username || parsedOrigin.password) throw new Error('Feed origin must be a public HTTP origin.')
  const base = parsedOrigin.origin

  if (format === 'rss') {
    yield '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">'
    yield rssChannel(settings, base)
    for await (const post of iterateExportContent(payload, 'posts')) yield rssItem(post, base)
    yield '</channel></rss>'
    return
  }

  const description = feedDescription(settings)
  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: feedTitle(settings),
    home_page_url: base,
    feed_url: new URL('/feed.json', base).href,
    ...(description ? { description } : {}),
    language: 'en-AU',
  }
  const prefix = JSON.stringify(feed).slice(0, -1)
  yield `${prefix},"items":[`
  let first = true
  for await (const post of iterateExportContent(payload, 'posts')) {
    yield `${first ? '' : ','}${jsonItem(post, base)}`
    first = false
  }
  yield ']}'
}
