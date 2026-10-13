import { describe, expect, it } from 'vitest'
import type { Page, Post } from '../src/payload-types'
import { pageMarkdown, postMarkdown } from '../src/lib/document-export'
const origin = 'https://example.test'
const body: NonNullable<Post['body']> = { root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'Complete body copy.' }] }] } }
const page: Page = { id: 1, title: 'Test page', slug: 'test-page', _status: 'published', createdAt: '', updatedAt: '', layout: [] }
const content = { posts: [], services: [], events: [] }
describe('document Markdown', () => {
  it('exports all fifteen page block shapes and truthful empty states without private fields', () => {
    const output = pageMarkdown({ ...page, layout: [
      { blockType: 'hero', heading: 'An opening', summary: 'Opening copy.', style: 'quiet' },
      { blockType: 'prose', body }, { blockType: 'feature', heading: 'Feature heading', body },
      { blockType: 'gallery', images: [] }, { blockType: 'pullQuote', quote: 'A quotation', attribution: 'A chef' },
      { blockType: 'founderCard', name: 'Founder', title: 'Chef', bio: body, links: [{ label: 'Company', url: '/about' }] },
      { blockType: 'productSpotlight', heading: 'Product', body, webUrl: '/culinaire-kitchen' },
      { blockType: 'faq', items: [{ question: 'Who is it for?', answer: body }] },
      { blockType: 'plainStatement', statement: 'A plain statement.' }, { blockType: 'cta', statement: 'Get in touch', label: 'Contact', url: '/contact' },
      { blockType: 'testimonial', testimonial: { id: 2, published: true, name: 'Owner', quote: 'A supplied review', createdAt: '', updatedAt: '' } },
      { blockType: 'spacer' }, { blockType: 'journalFeed' }, { blockType: 'serviceList' }, { blockType: 'upcomingEvents' },
    ] }, origin, content)
    expect(output).toContain('Complete body copy')
    expect(output).toContain('A supplied review')
    expect(output).toContain('[Company](https://example.test/about)')
    expect(output).toContain('Who is it for?')
    expect(output).toContain('There are no journal entries to read yet.')
    expect(output).toContain('There are no upcoming training dates.')
    expect(output).toContain('Service details are being prepared.')
    expect(output).not.toMatch(/undefined|null/)
  })
  it('omits unpublished and noIndex documents, retaining sitemap-only exclusions', () => {
    expect(pageMarkdown({ ...page, _status: 'draft' }, origin, content)).toBe('')
    expect(pageMarkdown({ ...page, seo: { noIndex: true } }, origin, content)).toBe('')
    expect(pageMarkdown({ ...page, seo: { excludeFromSitemap: true } }, origin, content)).toContain('# Test page')
  })
  it('exports the full post and safe author projection without authentication fields', () => {
    const post: Post = { id: 1, title: '<script>Article', slug: 'article', body, excerpt: 'A summary.', _status: 'published', createdAt: '', updatedAt: '', authors: [] }
    expect(postMarkdown(post, origin)).toContain('Complete body copy')
    expect(postMarkdown(post, origin)).toContain('&lt;script&gt;Article')
    expect(postMarkdown({ ...post, seo: { noIndex: true } }, origin)).toBe('')
  })
})
