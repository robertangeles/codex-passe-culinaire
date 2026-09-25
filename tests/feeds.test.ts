import { describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'
import type { Post, SiteSetting } from '../src/payload-types'
import { feedChunks } from '../src/lib/feeds'

const origin = 'https://example.test'
const settings = { name: 'Passe Culinaire', description: 'Kitchen notes & ideas.' } as SiteSetting
const richText = (text: string) => ({ root: { type: 'root', direction: null, format: '' as const, indent: 0, version: 1, children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text, format: 1 }] }] } })

function post(overrides: Partial<Post> = {}): Post {
  return {
    id: 1, title: 'Kitchen <notes>', slug: 'kitchen-notes', excerpt: 'A & B',
    body: richText('Salt & <steel>'), authors: [], categories: [], tags: [],
    publishedAt: '2025-02-03T01:02:03.000Z', updatedAt: '2025-02-04T01:02:03.000Z', createdAt: '2025-02-01T00:00:00.000Z', _status: 'published',
    ...overrides,
  }
}

function payloadFor(records: Post[], failureAfterFirst = false): Payload {
  let queried = false
  let streamed = false
  const find = vi.fn(async () => {
    if (!queried) { queried = true; return { docs: [{ id: records.at(-1)?.id ?? 0 }] } }
    if (failureAfterFirst && streamed) throw new Error('Database unavailable')
    streamed = true
    return { docs: failureAfterFirst ? records.slice(0, 1) : records }
  })
  return { find } as unknown as Payload
}

async function collect(chunks: AsyncGenerator<string>): Promise<string> {
  let output = ''
  for await (const chunk of chunks) output += chunk
  return output
}

describe('public content feeds', () => {
  it('renders full custom-block HTML and escapes RSS XML without truncating article content', async () => {
    const full = post({
      body: { root: { type: 'root', direction: null, format: '' as const, indent: 0, version: 1, children: [
        { type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'A long article <body> & more.', format: 0 }] },
        { type: 'block', version: 1, fields: { blockType: 'inlinePullQuote', quote: 'Keep <heat> & focus', attribution: 'Chef & owner' } },
      ] } },
      authors: [{ id: 2, name: 'Chef & Co', slug: 'chef-co', role: 'editor', email: 'private@example.test', createdAt: 'x', updatedAt: 'x', collection: 'users' }],
      categories: [{ id: 1, name: 'Kitchen <work>', slug: 'kitchen-work', createdAt: 'x', updatedAt: 'x' }],
    })
    const xml = await collect(feedChunks(payloadFor([full]), settings, origin, 'rss'))
    expect(xml).toContain('<language>en-au</language>')
    expect(xml).toContain('rel="self" type="application/rss+xml"')
    expect(xml).toContain('&lt;p&gt;A long article &amp;lt;body&amp;gt; &amp;amp; more.&lt;/p&gt;')
    expect(xml).toContain('&lt;blockquote&gt;&lt;p&gt;Keep &amp;lt;heat&amp;gt; &amp;amp; focus&lt;/p&gt;&lt;/blockquote&gt;')
    expect(xml).toContain('<dc:creator>Chef &amp; Co</dc:creator>')
    expect(xml).not.toContain('private@example.test')
    expect(xml).toContain('<category>Kitchen &lt;work&gt;</category>')
    expect(xml).toContain('<pubDate>Mon, 03 Feb 2025 01:02:03 GMT</pubDate>')
    expect(xml).not.toContain('…')
  })

  it('emits valid JSON Feed 1.1 with public author, real hero media and only confirmed dates', async () => {
    const record = post({
      publishedAt: 'invalid', updatedAt: '2025-02-04T01:02:03.000Z',
      heroImage: { id: 7, filename: 'kitchen.jpg', alt: 'Kitchen', caption: 'Service & prep', width: 1200, height: 800, createdAt: 'x', updatedAt: 'x' },
      authors: [
        { id: 2, name: 'Chef A', slug: 'chef-a', role: 'editor', email: 'private@example.test', createdAt: 'x', updatedAt: 'x', collection: 'users' },
        3,
        { id: 4, name: '[TO CONFIRM]', slug: 'unknown', role: 'editor', email: 'hidden@example.test', createdAt: 'x', updatedAt: 'x', collection: 'users' },
        { id: 5, name: 'Private author', slug: 'private-author', publicProfile: false, role: 'editor', email: 'private-author@example.test', createdAt: 'x', updatedAt: 'x', collection: 'users' },
      ],
    })
    const payload = payloadFor([record])
    const output = JSON.parse(await collect(feedChunks(payload, settings, origin, 'json'))) as {
      version: string; language: string; items: Array<Record<string, unknown>>
    }
    expect(output.version).toBe('https://jsonfeed.org/version/1.1')
    expect(output.language).toBe('en-AU')
    expect(output.items).toHaveLength(1)
    expect(output.items[0]).toMatchObject({
      url: `${origin}/journal/kitchen-notes`, image: `${origin}/media/kitchen.jpg`,
      date_modified: '2025-02-04T01:02:03.000Z',
      authors: [{ name: 'Chef A', url: `${origin}/journal/author/chef-a` }],
    })
    expect(output.items[0]).not.toHaveProperty('date_published')
    expect(output.items[0]).not.toHaveProperty('rating')
    expect(output.items[0].content_html).toContain('<figcaption>Service &amp; prep</figcaption>')
    expect(JSON.stringify(output)).not.toContain('private@example.test')
    expect(JSON.stringify(output)).not.toContain('hidden@example.test')
    expect(JSON.stringify(output)).not.toContain('private-author@example.test')
    expect(payload.find).toHaveBeenCalledWith(expect.objectContaining({ collection: 'posts', overrideAccess: false, draft: false }))
  })

  it('keeps labelled placeholder hero media and its credit in full article HTML only', async () => {
    const record = post({ heroImage: {
      id: 8, filename: 'placeholder.jpg', alt: 'Example image', caption: 'For layout', credit: 'Studio & staff',
      placeholder: true, width: 900, height: 600, createdAt: 'x', updatedAt: 'x',
    } })
    const output = JSON.parse(await collect(feedChunks(payloadFor([record]), settings, origin, 'json'))) as { items: Array<Record<string, unknown>> }
    const item = output.items[0]
    expect(item.content_html).toContain('<figure>')
    expect(item.content_html).toContain('<figcaption>Placeholder image. For layout<br>Credit: Studio &amp; staff</figcaption>')
    expect(item).not.toHaveProperty('image')
  })

  it('removes XML 1.0 forbidden controls and lone surrogate scalars', async () => {
    const record = post({ title: 'Kitchen\u0000 notes\uD800', excerpt: 'Salt\u0001 and heat' })
    const output = await collect(feedChunks(payloadFor([record]), settings, origin, 'rss'))
    expect(output).not.toContain('\u0000')
    expect(output).not.toContain('\u0001')
    expect(output).not.toContain('\uD800')
    expect(output).toContain('<title>Kitchen notes</title>')
    expect(output).toContain('<description>Salt and heat</description>')
  })

  it('uses the public published feed reader and excludes noIndex posts', async () => {
    const payload = payloadFor([post(), post({ id: 2, slug: 'private-index', seo: { noIndex: true } })])
    const output = JSON.parse(await collect(feedChunks(payload, settings, origin, 'json'))) as { items: Array<{ url: string }> }
    expect(output.items.map((item) => item.url)).toEqual([`${origin}/journal/kitchen-notes`])
    expect(payload.find).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'posts', overrideAccess: false, draft: false,
      where: { and: [{ _status: { equals: 'published' } }] },
    }))
  })

  it('creates a valid empty JSON Feed and does not claim nonexistent dates or authors', async () => {
    const output = JSON.parse(await collect(feedChunks(payloadFor([]), settings, origin, 'json'))) as { items: unknown[] }
    expect(output.items).toEqual([])
  })

  it('propagates a later database failure after yielding the first item', async () => {
    const chunks = feedChunks(payloadFor([post(), post({ id: 2, slug: 'second' })], true), settings, origin, 'json')
    await expect(collect(chunks)).rejects.toThrow('Database unavailable')
  })
})
