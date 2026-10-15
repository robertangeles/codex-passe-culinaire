import type { Payload } from 'payload'
import type { SiteSetting } from '../src/payload-types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { collectionsRead, getExportError, setExportError } = vi.hoisted(() => {
  let exportError: Error | undefined
  return { collectionsRead: vi.fn(), getExportError: () => exportError, setExportError: (error?: Error) => { exportError = error } }
})
vi.mock('../src/lib/export-content', () => ({
  iterateExportContent: async function* (_payload: Payload, collection: string, sitemap: boolean) {
    collectionsRead(collection, sitemap)
    const failure = getExportError()
    if (failure) throw failure
    for (const item of records[collection] ?? []) yield item
  },
}))

import { sitemapChunks, sitemapIndex, sitemapKinds, type SitemapKind } from '../src/lib/sitemaps'

const records: Record<string, Array<Record<string, unknown>>> = {}
const settings = (overrides: Partial<SiteSetting> = {}): SiteSetting => ({
  id: 1,
  name: 'Passe & <Culinaire>',
  defaultSitemap: { priority: '0.7', changeFrequency: 'weekly' },
  ...overrides,
})
const generate = async (kind: SitemapKind, config = settings()) => {
  const chunks: string[] = []
  for await (const chunk of sitemapChunks({} as Payload, kind, config, 'https://example.test')) chunks.push(chunk)
  return chunks.join('')
}

beforeEach(() => {
  collectionsRead.mockClear()
  setExportError()
  for (const collection of Object.keys(records)) delete records[collection]
})

describe('sitemap generation', () => {
  it('publishes all six required child sitemap URLs in the index', () => {
    const index = sitemapIndex('https://example.test')
    expect(sitemapKinds).toEqual(['pages', 'posts', 'taxonomies', 'authors', 'services', 'training'])
    for (const kind of sitemapKinds) expect(index).toContain(`https://example.test/sitemap-${kind}.xml`)
    expect(index).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
  })

  it('includes built-in listing roots, maps CMS pages, and skips duplicate listing paths', async () => {
    records.pages = [
      { slug: 'home', updatedAt: '2026-01-02T03:04:05Z' },
      { slug: 'about-us', updatedAt: 'invalid-date' },
      { slug: 'journal', updatedAt: '2026-01-01' },
    ]
    const xml = await generate('pages')
    expect(xml).toContain('<loc>https://example.test/</loc>')
    expect(xml).toContain('<loc>https://example.test/about-us</loc>')
    expect(xml).toContain('<loc>https://example.test/journal</loc>')
    expect(xml).toContain('<loc>https://example.test/about/privacy-policy</loc>')
    expect(xml).toContain('<loc>https://example.test/about/terms-and-conditions</loc>')
    expect(xml.match(/<loc>https:\/\/example\.test\/journal<\/loc>/g)).toHaveLength(1)
    expect(xml).toContain('<lastmod>2026-01-02T03:04:05.000Z</lastmod>')
    expect(xml).toContain('<changefreq>weekly</changefreq><priority>0.7</priority>')
    expect(xml).not.toContain('invalid-date')
    expect(collectionsRead).toHaveBeenCalledWith('pages', true)
  })

  it('escapes XML text and URLs and applies document SEO overrides before settings defaults', async () => {
    records.posts = [{
      slug: 'chef & <notes>', title: 'unused & <title>', updatedAt: '2026-02-03T04:05:06+11:00',
      seo: { sitemapPriority: '0.9', sitemapChangeFrequency: 'daily' },
      heroImage: { id: 2, filename: 'sauce&salt.jpg', alt: 'Sauce <salt> & oil', placeholder: false },
      body: { root: { type: 'root', children: [
        { type: 'inlineBlock', fields: { blockType: 'inlineImage', image: { id: 3, filename: 'sauce&salt.jpg', alt: 'duplicate', width: 400, height: 300 } } },
        { type: 'upload', relationTo: 'media', value: { id: 4, filename: 'steam.jpg', alt: 'Steam & pan', width: 800, height: 600 } },
      ] } },
    }]
    const xml = await generate('posts')
    expect(xml).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"')
    expect(xml).toContain('<loc>https://example.test/journal/chef%20%26%20%3Cnotes%3E</loc>')
    expect(xml).toContain('<lastmod>2026-02-02T17:05:06.000Z</lastmod>')
    expect(xml).toContain('<changefreq>daily</changefreq><priority>0.9</priority>')
    expect(xml).toContain('<image:loc>https://example.test/media/sauce%26salt.jpg</image:loc><image:title>Sauce &lt;salt&gt; &amp; oil</image:title>')
    expect(xml).toContain('<image:title>Steam &amp; pan</image:title>')
    expect(xml.match(/sauce%26salt\.jpg/g)).toHaveLength(1)
    expect(xml).not.toContain('unused &')
    expect(collectionsRead).toHaveBeenCalledWith('posts', true)
  })

  it('uses approved collection to route mappings and global defaults for taxonomy and author entries', async () => {
    records.categories = [{ slug: 'mise-en-place', updatedAt: '2026-03-01T00:00:00Z', seo: { sitemapPriority: '1.0' } }]
    records.tags = [{ slug: 'knife-skills', updatedAt: '2026-03-02T00:00:00Z' }]
    const taxonomies = await generate('taxonomies')
    expect(taxonomies).toContain('<loc>https://example.test/journal/category/mise-en-place</loc>')
    expect(taxonomies).toContain('<loc>https://example.test/journal/tag/knife-skills</loc>')
    expect(taxonomies).toContain('<changefreq>weekly</changefreq><priority>0.7</priority>')
    expect(taxonomies).not.toContain('<priority>1.0</priority>')

    records.users = [{ slug: 'sam-chef', name: 'Sam', email: 'private@example.test', hash: 'private', updatedAt: '2026-03-03T00:00:00Z' }]
    const authors = await generate('authors')
    expect(authors).toContain('<loc>https://example.test/journal/author/sam-chef</loc>')
    expect(authors).not.toContain('private@example.test')
    expect(authors).not.toContain('private')
    expect(collectionsRead).toHaveBeenCalledWith('categories', true)
    expect(collectionsRead).toHaveBeenCalledWith('tags', true)
    expect(collectionsRead).toHaveBeenCalledWith('users', true)
  })

  it('fails visibly on unsupported rich text nodes instead of returning a partial sitemap', async () => {
    records.posts = [{ slug: 'invalid-export', body: { root: { type: 'root', children: [{ type: 'mysteryNode' }] } } }]
    await expect(generate('posts')).rejects.toThrow('Unsupported rich text node: mysteryNode.')
  })

  it('routes services and training events and propagates export failures', async () => {
    records.services = [{ slug: 'kitchen-review', updatedAt: '2026-04-01T00:00:00Z' }]
    records.events = [{ slug: 'autumn-workshop', updatedAt: '2026-04-02T00:00:00Z' }]
    expect(await generate('services')).toContain('<loc>https://example.test/services/kitchen-review</loc>')
    expect(await generate('training')).toContain('<loc>https://example.test/training/autumn-workshop</loc>')
    expect(collectionsRead).toHaveBeenCalledWith('services', true)
    expect(collectionsRead).toHaveBeenCalledWith('events', true)

    const failure = new Error('database unavailable')
    setExportError(failure)
    await expect(generate('posts')).rejects.toBe(failure)
  })
})
