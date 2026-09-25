import { describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'
import type { SiteSetting } from '../src/payload-types'
import { llmsIndex } from '../src/lib/llms'
const origin = 'https://example.test'
const settings: SiteSetting = { id: 1, name: 'Passe Culinaire', description: 'A company for kitchens.' }
function reader() {
  const find = vi.fn(async (options: { where: { slug?: { equals: string }; and?: { slug?: { equals: string } }[] } }) => {
    const slug = options.where.slug?.equals || options.where.and?.[0]?.slug?.equals
    return { docs: slug === 'missing' ? [] : [{ slug, _status: 'published', noIndex: slug === 'excluded', seo: { excludeFromSitemap: slug === 'sitemap-only' } }] }
  })
  return { payload: { find } as unknown as Payload, find }
}
describe('curated LLM index', () => {
  it('uses nine real initial destinations and never invents a tenth', async () => {
    const { payload, find } = reader()
    const result = await llmsIndex(payload, settings, origin)
    expect(result.count).toBe(9)
    expect(result.markdown).toContain('/culinaire-kitchen')
    expect(result.markdown).not.toContain('Published')
    expect(result.markdown).toContain('Training information and enquiries')
    for (const [options] of find.mock.calls) expect(options).toMatchObject({ overrideAccess: false })
  })
  it('supports exactly ten genuine editable links once published content exists', async () => {
    const result = await llmsIndex(reader().payload, { ...settings, curatedLinks: Array.from({ length: 10 }, (_, index) => ({ path: `/entry-${index}`, title: `Entry ${index}`, summary: 'A published page.' })) }, origin)
    expect(result.count).toBe(10)
  })
  it('removes missing, noIndex, duplicate and private paths but keeps sitemap-only exclusions', async () => {
    const links = ['/excluded', '/missing', '/sitemap-only', '/sitemap-only', '/api/users', '/home', '/constructor/foo']
    const result = await llmsIndex(reader().payload, { ...settings, curatedLinks: links.map(path => ({ path, title: '<script>Title', summary: 'A summary.' })) }, origin)
    expect(result.count).toBe(1)
    expect(result.markdown).toContain('/sitemap-only')
    expect(result.markdown).not.toContain('<script>')
  })
})
