import type { Media, Page, Post, Service } from '../payload-types'
import type { BlockContent } from './page-view-model'
import { renderRichTextExport } from './rich-text-export'
import { isPublishedExport } from './discovery-policy'
import { absolutePublicUrl, isoDate } from './seo/core'

const text = (value?: string | null) => (value ?? '').trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([\\`*_{}\[\]()#+.!|~-])/g, '\\$1')
const heading = (value?: string | null) => value?.trim() ? `## ${text(value)}` : ''
const combine = (parts: (string | undefined)[]) => parts.filter(Boolean).join('\n\n')
const rich = (value: unknown, origin: string) => renderRichTextExport(value, origin).markdown
const limit = (value?: number | null) => typeof value === 'number' && Number.isFinite(value) ? Math.max(1, Math.min(12, Math.floor(value))) : 3
function link(label: string | null | undefined, path: unknown, origin: string): string {
  const url = absolutePublicUrl(path, origin)
  return label?.trim() && url ? `[${text(label)}](${url.replace(/[()\\]/g, '\\$&')})` : ''
}
function media(value: Media | number | null | undefined, caption: string | null | undefined, origin: string): string {
  return rich({ root: { type: 'root', children: [{ type: 'upload', relationTo: 'media', value, fields: { caption } }] } }, origin)
}

export function postMarkdown(post: Post, origin: string): string {
  if (!isPublishedExport(post)) return ''
  const authors = (post.authors ?? []).flatMap(author => typeof author === 'object' && author?.name && author.slug
    ? [link(author.name, `/journal/author/${encodeURIComponent(author.slug)}`, origin)] : [])
  return combine([
    `# ${text(post.title)}`, `Source: ${origin}/journal/${encodeURIComponent(post.slug)}`,
    authors.length ? `By ${authors.join(', ')}` : '',
    isoDate(post.publishedAt) ? `Published: ${isoDate(post.publishedAt)}` : '',
    isoDate(post.updatedAt) ? `Updated: ${isoDate(post.updatedAt)}` : '',
    text(post.excerpt), media(post.heroImage, undefined, origin), rich(post.body, origin),
  ]) + '\n'
}

/** Only page block fields visible to visitors are projected; relations retain export visibility. */
export function pageMarkdown(page: Page, origin: string, content: BlockContent, now = new Date()): string {
  if (!isPublishedExport(page)) return ''
  const parts = [`# ${text(page.title)}`, `Source: ${origin}${page.slug === 'home' ? '/' : `/${encodeURIComponent(page.slug)}`}`]
  for (const block of page.layout ?? []) {
    switch (block.blockType) {
      case 'hero': {
        const month = Number(new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Melbourne', month: 'numeric' }).format(now))
        const season = month === 12 || month <= 2 ? 'summer' : month <= 5 ? 'autumn' : month <= 8 ? 'winter' : 'spring'
        const seasonal = block.seasonalImages?.find(item => item.season === season)?.image
        const image = typeof seasonal === 'object' && seasonal?.filename && seasonal.width && seasonal.height ? seasonal : block.image
        parts.push(combine([text(block.eyebrow), block.heading === page.title ? '' : heading(block.heading), text(block.summary),
          block.style === 'image' ? media(image, undefined, origin) : '',
          page.slug === 'home' ? link('Explore CulinAIre Kitchen', '/culinaire-kitchen', origin) : '']))
        break
      }
      case 'prose': parts.push(rich(block.body, origin)); break
      case 'feature': parts.push(combine([heading(block.heading), rich(block.body, origin), media(block.image, undefined, origin)])); break
      case 'gallery': parts.push(combine((block.images ?? []).map(item => media(item.image, item.caption, origin)))); break
      case 'pullQuote': parts.push(combine([`> ${text(block.quote).replace(/\n/g, '\n> ')}`, text(block.attribution)])); break
      case 'founderCard': parts.push(combine([heading(block.name), text(block.title), rich(block.bio, origin), media(block.portrait, undefined, origin),
        ...(block.links ?? []).map(item => link(item.label, item.url, origin))])); break
      case 'productSpotlight': parts.push(combine([heading(block.heading), rich(block.body, origin), media(block.image, undefined, origin),
        link('Visit CulinAIre Kitchen', block.webUrl, origin), link('View on the App Store', block.appStoreUrl, origin)])); break
      case 'faq': parts.push(combine((block.items ?? []).map(item => combine([heading(item.question), rich(item.answer, origin)])))); break
      case 'testimonial': {
        const review = block.testimonial
        if (typeof review === 'object' && review?.published) parts.push(combine([`> ${text(review.quote)}`, text(review.name), text(review.role), text(review.venue)]))
        break
      }
      case 'plainStatement': parts.push(text(block.statement)); break
      case 'cta': parts.push(combine([text(block.statement), link(block.label, block.url, origin)])); break
      case 'spacer': break
      case 'journalFeed': {
        const posts = content.posts.filter(isPublishedExport).slice(0, limit(block.limit))
        parts.push(combine([heading(block.heading || 'Journal'), ...posts.map(post => combine([link(post.title, `/journal/${post.slug}`, origin), text(post.excerpt), isoDate(post.publishedAt), media(post.heroImage, undefined, origin)])),
          posts.length ? '' : 'There are no journal entries to read yet.']))
        break
      }
      case 'serviceList': {
        const services = (block.services?.length ? block.services.filter((item): item is Service => typeof item === 'object') : content.services).filter(isPublishedExport)
        parts.push(combine([heading(block.heading || 'Services'), ...services.map(service => combine([link(service.title, `/services/${service.slug}`, origin), text(service.oneLiner), text(service.whoItIsFor)])),
          services.length ? '' : combine(['Service details are being prepared.', link('Discuss your kitchen', '/contact', origin)])]))
        break
      }
      case 'upcomingEvents': {
        const events = content.events.filter(event => isPublishedExport(event) && ['upcoming', 'sold-out'].includes(event.eventStatus || '') && isoDate(event.startDate)).slice(0, limit(block.limit))
        parts.push(combine([heading(block.heading || 'Training'), ...events.map(event => combine([link(event.title, `/training/${event.slug}`, origin), text(event.descriptionSummary), isoDate(event.startDate), text(event.venue?.online ? 'Online' : event.venue?.name), event.eventStatus === 'sold-out' ? 'Sold out' : ''])),
          events.length ? '' : combine(['There are no upcoming training dates.', link('Ask about training', '/contact', origin)])]))
        break
      }
      default: {
        const unsupported: never = block
        throw new Error(`Unsupported page export block: ${JSON.stringify(unsupported)}`)
      }
    }
  }
  return combine(parts) + '\n'
}
