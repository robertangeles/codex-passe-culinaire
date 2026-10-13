import type { Page } from '../../payload-types'
import { validStructuredDataOverride } from '../../payload/fields'
import { visibleContentText } from '../../payload/contentText'
import { confirmedText, entityIds, type JsonValue, type SchemaNode } from './core'

export type Crumb = { name: string; path: string }
export function breadcrumbSchema(items: Crumb[], origin: string): SchemaNode {
  const last = items[items.length - 1]
  return {
    '@type': 'BreadcrumbList', '@id': `${origin}${last?.path || '/'}#breadcrumb`,
    itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: new URL(item.path, origin).href })),
  }
}

/** Overrides are additive: generated facts, identity and relationships always win. */
export function applySchemaOverride(node: SchemaNode, override: unknown): SchemaNode {
  if (override == null) return node
  if (!validStructuredDataOverride(override)) throw new Error('Invalid structured data override.')
  return { ...(override as Record<string, JsonValue>), ...node }
}

export function buildPageGraph(page: Page, origin: string): SchemaNode[] {
  if (page._status !== 'published') return []
  const path = page.slug === 'home' ? '/' : `/${encodeURIComponent(page.slug)}`
  const ids = entityIds(origin)
  const node: SchemaNode = { '@type': 'WebPage', '@id': `${origin}${path}#webpage`, url: `${origin}${path}`,
    name: page.title, isPartOf: { '@id': ids.website }, inLanguage: 'en-AU' }
  const description = confirmedText(page.seo?.metaDescription)
  if (description) node.description = description
  const graph = [applySchemaOverride(node, page.seo?.structuredDataOverride)]
  if (path !== '/') graph.push(breadcrumbSchema([{ name: 'Home', path: '/' }, { name: page.title, path }], origin))
  const faqs = (page.layout ?? []).flatMap(block => block.blockType === 'faq' ? block.items ?? [] : [])
    .flatMap(item => {
      const question = confirmedText(item.question)
      const answer = confirmedText(visibleContentText('posts', { body: item.answer }))
      return question && answer ? [{ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } }] : []
    })
  if (faqs.length) graph.push({ '@type': 'FAQPage', '@id': `${origin}${path}#faq`, mainEntity: faqs })
  if (page.slug === 'culinaire-kitchen') {
    node.mainEntity = { '@id': ids.software }
    graph[0] = applySchemaOverride(node, page.seo?.structuredDataOverride)
    graph.push({ '@type': 'SoftwareApplication', '@id': ids.software, name: 'CulinAIre Kitchen',
      url: `${origin}${path}`, publisher: { '@id': ids.organisation } })
  }
  return graph
}
