import { describe, expect, it } from 'vitest'
import type { Page } from '../src/payload-types'
import { applySchemaOverride, breadcrumbSchema, buildPageGraph } from '../src/lib/seo/page'
const page: Page = { id: 1, title: 'CulinAIre Kitchen', slug: 'culinaire-kitchen', layout: [], _status: 'published', createdAt: '', updatedAt: '' }
const origin = 'https://example.test'
describe('page structured data', () => {
  it('links the product to its company without invented pricing, ratings or capabilities', () => {
    const graph = buildPageGraph(page, origin)
    expect(graph[0].mainEntity).toEqual({ '@id': `${origin}/culinaire-kitchen#software` })
    expect(graph[2]).toEqual({ '@type': 'SoftwareApplication', '@id': `${origin}/culinaire-kitchen#software`, name: 'CulinAIre Kitchen', url: `${origin}/culinaire-kitchen`, publisher: { '@id': `${origin}/#organisation` } })
    expect(buildPageGraph({ ...page, _status: 'draft' }, origin)).toEqual([])
  })
  it('preserves generated properties and rejects unsafe overrides', () => {
    const node = { '@type': 'WebPage', name: 'Confirmed title' }
    expect(applySchemaOverride(node, { name: 'Replacement', alternateName: 'Another title' })).toEqual({ ...node, alternateName: 'Another title' })
    expect(() => applySchemaOverride(node, { '@id': '/other' })).toThrow()
    expect(() => applySchemaOverride(node, { description: '<script>' })).toThrow()
  })
  it('gives paginated breadcrumbs their own stable identity and ordered destinations', () => {
    const node = breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Journal', path: '/journal' }, { name: 'Page 2', path: '/journal/page/2' }], origin)
    expect(node['@id']).toBe(`${origin}/journal/page/2#breadcrumb`)
    expect(node.itemListElement).toEqual(expect.arrayContaining([{ '@type': 'ListItem', position: 3, name: 'Page 2', item: `${origin}/journal/page/2` }]))
  })
})
