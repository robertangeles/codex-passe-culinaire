import type { Payload } from 'payload'
import type { SiteSetting } from '../payload-types'
import { isIndexable, isPublishedExport } from './discovery-policy'
import { confirmedText } from './seo/core'

const defaults = [
  { path: '/', title: 'Passe Culinaire', summary: 'The company and its work.' },
  { path: '/about', title: 'About', summary: 'The founders of Passe Culinaire.' },
  { path: '/culinaire-kitchen', title: 'CulinAIre Kitchen', summary: 'The first product from Passe Culinaire.' },
  { path: '/services', title: 'Services', summary: 'Service enquiries and availability.' },
  { path: '/training', title: 'Training', summary: 'Training information and enquiries.' },
  { path: '/journal', title: 'Journal', summary: 'The company journal.' },
  { path: '/contact', title: 'Contact', summary: 'Send a message to the team.' },
  { path: '/journal/author/alex-charasse', title: 'Alex Charasse', summary: 'Public author profile.' },
  { path: '/journal/author/rob-angeles', title: 'Rob Angeles', summary: 'Public author profile.' },
]
const markdownText = (value: string) => value.replace(/\s+/g, ' ').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([\\`*_{}\[\]()#+.!|~-])/g, '\\$1')

async function eligiblePath(payload: Payload, path: string): Promise<boolean> {
  if (['/journal', '/services', '/training'].includes(path)) return true
  if (path !== '/' && !/^\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(path)) return false
  const segments = path.split('/').filter(Boolean)
  const profile = segments.length === 3 && segments[0] === 'journal' ? segments[1] : undefined
  if (profile === 'author' || profile === 'category' || profile === 'tag') {
    const collection = profile === 'author' ? 'users' : profile === 'category' ? 'categories' : 'tags'
    const result = await payload.find({ collection, overrideAccess: false, depth: 0, limit: 1,
      select: { slug: true, noIndex: true }, where: { slug: { equals: segments[2] } } })
    return Boolean(result.docs[0] && isIndexable(result.docs[0]))
  }
  const collection = segments.length <= 1 ? 'pages' : segments.length === 2
    ? (segments[0] === 'journal' ? 'posts' : segments[0] === 'services' ? 'services' : segments[0] === 'training' ? 'events' : undefined) : undefined
  if (!collection) return false
  const slug = segments.length === 0 ? 'home' : segments[segments.length - 1]
  if (path === '/home') return false
  const result = await payload.find({ collection, overrideAccess: false, draft: false, depth: 0, limit: 1,
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] } })
  return Boolean(result.docs[0] && isPublishedExport(result.docs[0]))
}

export async function llmsIndex(payload: Payload, settings: SiteSetting, origin: string): Promise<{ markdown: string; count: number }> {
  const candidates = settings.curatedLinks?.length ? settings.curatedLinks : defaults
  const links: string[] = []
  const seen = new Set<string>()
  for (const item of candidates.slice(0, 10)) {
    const title = confirmedText(item.title)
    const summary = confirmedText(item.summary)
    if (!title || !summary || seen.has(item.path) || !await eligiblePath(payload, item.path)) continue
    seen.add(item.path)
    links.push(`- [${markdownText(title)}](${origin}${item.path}): ${markdownText(summary)}`)
  }
  const name = markdownText(confirmedText(settings.name) || 'Passe Culinaire')
  const description = confirmedText(settings.description)
  return { markdown: [`# ${name}`, description ? `> ${markdownText(description)}` : '', '## Pages', links.join('\n')].filter(Boolean).join('\n\n') + '\n', count: links.length }
}
