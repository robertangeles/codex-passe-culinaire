import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { BlockRenderer } from '../src/components/BlockRenderer'
import type { Page, Service } from '../src/payload-types'
import type { BlockContent } from '../src/lib/page-view-model'

const content: BlockContent = { posts: [], services: [], events: [] }

function render(blocks: Page['layout'], options: { home?: boolean; title?: string; content?: BlockContent } = {}) {
  return renderToStaticMarkup(
    <BlockRenderer
      blocks={blocks}
      content={options.content ?? content}
      home={options.home}
      title={options.title ?? 'Company page'}
    />,
  )
}

describe('BlockRenderer', () => {
  it('renders every supported block in server HTML and keeps one page h1', () => {
    const blocks = [
      { blockType: 'hero', heading: 'Company', style: 'quiet' },
      { blockType: 'prose', body: { root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text: 'Prose content' }] }] } } },
      { blockType: 'feature', heading: 'Feature heading' },
      { blockType: 'gallery', images: [] },
      { blockType: 'pullQuote', quote: 'A kitchen quotation' },
      { blockType: 'founderCard', name: 'Founder name' },
      { blockType: 'productSpotlight', heading: 'Product heading' },
      { blockType: 'journalFeed', heading: 'Journal heading' },
      { blockType: 'faq', items: [{ question: 'A question?' }] },
      { blockType: 'serviceList', heading: 'Service heading', services: [] },
      { blockType: 'upcomingEvents', heading: 'Training heading' },
      { blockType: 'testimonial', testimonial: 123 },
      { blockType: 'plainStatement', statement: 'Plain statement' },
      { blockType: 'cta', statement: 'Call to action', label: 'Contact', url: '/contact' },
      { blockType: 'spacer', size: 'small' },
    ] as Page['layout']

    const html = render(blocks)

    expect(html).toContain('Prose content')
    expect(html).toContain('Feature heading')
    expect(html).toContain('A kitchen quotation')
    expect(html).toContain('Founder name')
    expect(html).toContain('Product heading')
    expect(html).toContain('Journal heading')
    expect(html).toContain('A question?')
    expect(html).toContain('Service heading')
    expect(html).toContain('Training heading')
    expect(html).toContain('Plain statement')
    expect(html).toContain('Call to action')
    expect(html).toMatch(/<h1\b[^>]*>Company<\/h1>/u)
    expect(html.match(/<h1\b/g)).toHaveLength(1)
  })

  it('uses the page title when the first block is not a hero and keeps later heroes below h1', () => {
    const html = render([
      { blockType: 'plainStatement', statement: 'Opening statement' },
      { blockType: 'hero', heading: 'Later section' },
    ] as Page['layout'], { title: 'About Passe Culinaire' })

    expect(html).toMatch(/<h1\b[^>]*>About Passe Culinaire<\/h1>/u)
    expect(html).toMatch(/<h2\b[^>]*>Later section<\/h2>/u)
    expect(html.match(/<h1\b/g)).toHaveLength(1)
  })

  it('adds one home exploration link only to a leading hero', () => {
    const leading = render([{ blockType: 'hero', heading: 'Home' }] as Page['layout'], { home: true })
    const syntheticLead = render([
      { blockType: 'plainStatement', statement: 'Start' },
      { blockType: 'hero', heading: 'Later' },
    ] as Page['layout'], { home: true })

    expect(leading.match(/Explore CulinAIre Kitchen/g)).toHaveLength(1)
    expect(syntheticLead.match(/Explore CulinAIre Kitchen/g)).toHaveLength(1)
    expect(syntheticLead).toMatch(/<h2\b[^>]*>Later<\/h2>/u)
  })

  it('omits unpublished testimonials and does not fall back to defaults for unresolved service references', () => {
    const service = { id: 4, title: 'Must not appear', slug: 'not-selected', _status: 'published' } as Service
    const html = render([
      { blockType: 'testimonial', testimonial: { id: 8, published: false, quote: 'Draft quote', name: 'Draft person' } },
      { blockType: 'serviceList', services: [999] },
    ] as Page['layout'], { content: { ...content, services: [service] } })

    expect(html).not.toContain('Draft quote')
    expect(html).not.toContain('Draft person')
    expect(html).not.toContain('Must not appear')
    expect(html).toContain('Service details are being prepared.')
  })

  it('keeps controlled video embeds as links by default', () => {
    const html = render([{
      blockType: 'prose',
      body: {
        root: {
          type: 'root',
          direction: null,
          format: '',
          indent: 0,
          version: 1,
          children: [{
            type: 'paragraph',
            version: 1,
            children: [{
              type: 'block',
              version: 1,
              fields: { blockType: 'controlledEmbed', provider: 'youtube', videoId: 'a1b2c3d4', caption: 'Knife skills video' },
            }],
          }],
        },
      },
    }] as Page['layout'])

    expect(html).toContain('Watch video on YouTube')
    expect(html).not.toContain('<iframe')
  })
})
