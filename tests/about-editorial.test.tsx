import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { BlockRenderer } from '../src/components/BlockRenderer'
import type { Page, Media } from '../src/payload-types'
import type { BlockContent } from '../src/lib/page-view-model'

const content: BlockContent = { posts: [], services: [], events: [] }
const realMedia = (overrides: Partial<Media> = {}): Media => ({
  id: 22, filename: 'alex.jpg', alt: 'Alex at a pastry bench', caption: 'Finishing pastry', credit: 'Photographer',
  width: 800, height: 1000, placeholder: false, createdAt: '', updatedAt: '', ...overrides,
})
function render(blocks: Page['layout']) {
  return renderToStaticMarkup(<BlockRenderer blocks={blocks} content={content} title="About Passe Culinaire" about />)
}
const founder = (name: string, portrait: unknown, links?: { label: string; url: string }[]) => ({
  blockType: 'founderCard' as const, name, title: 'Co-founder · CEO', portrait: portrait as never,
  bio: { root: { type: 'root', children: [
    { type: 'paragraph', children: [{ type: 'text', text: 'Maître Pâtissier · Maître Chocolatier' }] },
    { type: 'paragraph', children: [{ type: 'text', text: 'Biography remains editable.' }] },
  ] } }, links,
})

describe('About editorial rendering', () => {
  it('renders the selected hero, biography order, and rich text closing actions in server HTML', () => {
    const closing = { root: { type: 'root', children: [
      { type: 'paragraph', children: [{ type: 'text', text: 'CulinAIre Kitchen is our first offer.' }] },
      { type: 'paragraph', children: [
        { type: 'link', fields: { linkType: 'custom', url: '/culinaire-kitchen' }, children: [{ type: 'text', text: 'Explore CulinAIre Kitchen' }] },
        { type: 'text', text: ' ' },
        { type: 'link', fields: { linkType: 'custom', url: '/contact' }, children: [{ type: 'text', text: 'Start a conversation' }] },
      ] },
    ] } }
    const html = render([
      { blockType: 'hero', eyebrow: 'About Passe Culinaire', heading: 'From the kitchen,\nlooking forward.', summary: 'A Melbourne company.' },
      { blockType: 'prose', blockName: 'About founders', body: { root: { type: 'root', children: [{ type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Two founders. Complementary experience.' }] }] } } },
      founder('Alex Charasse', 10), founder('Rob Angeles', null),
      { blockType: 'feature', blockName: 'About continuation', heading: 'Experience,\nput to work.', body: closing },
    ] as Page['layout'])

    expect(html).toContain('<h1')
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html).toContain('Two founders. Complementary experience.')
    expect(html).toContain('Portrait photograph space for Alex Charasse')
    expect(html).toContain('Portrait photograph space for Rob Angeles')
    expect(html).toContain('Photograph to be supplied')
    expect(html).toContain('Experience,')
    expect(html).toContain('href="/culinaire-kitchen"')
    expect(html).toContain('href="/contact"')
    expect(html).not.toContain('/media/placeholder-10')
  })

  it('uses a single h1 fallback and keeps later About heroes at h2', () => {
    const html = render([
      { blockType: 'plainStatement', statement: 'Opening custom block' },
      { blockType: 'hero', heading: 'Later section' },
    ] as Page['layout'])
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html).toMatch(/<h1\b[^>]*>About Passe Culinaire<\/h1>/u)
    expect(html).toMatch(/<h2\b[^>]*>Later section<\/h2>/u)
  })

  it('preserves an image hero and custom feature content on the About route', () => {
    const html = render([
      { blockType: 'hero', style: 'image', heading: 'Custom opening', image: realMedia() },
      { blockType: 'feature', heading: 'Custom feature', image: realMedia({ filename: 'workshop.jpg' }), imageSide: 'right' },
    ] as Page['layout'])
    expect(html).toContain('src="/media/alex.jpg"')
    expect(html).toContain('src="/media/workshop.jpg"')
    expect(html).toContain('Custom feature')
    expect(html.match(/<h1\b/g)).toHaveLength(1)
  })

  it('keeps valid media alt, focal crop, caption, credit, and a reserved lazy portrait frame', () => {
    const html = render([{ blockType: 'hero', heading: 'About' }, founder('Alex Charasse', realMedia({ focalX: 72, focalY: 24 }))] as Page['layout'])
    expect(html).toContain('src="/media/alex.jpg"')
    expect(html).toContain('alt="Alex at a pastry bench"')
    expect(html).toContain('Finishing pastry')
    expect(html).toContain('Credit: Photographer')
    expect(html).toContain('object-position:72% 24%')
    expect(html).toContain('loading="lazy"')
    expect(html).toContain('width="800"')
    expect(html).toContain('height="1000"')
  })

  it('shows named photo spaces for placeholders, unresolved IDs, and invalid media', () => {
    for (const portrait of [realMedia({ filename: 'placeholder-10.webp', placeholder: true }), 10, null, realMedia({ filename: '../private.jpg' })]) {
      const html = render([{ blockType: 'hero', heading: 'About' }, founder('Rob Angeles', portrait)] as Page['layout'])
      expect(html).toContain('Portrait photograph space for Rob Angeles')
      expect(html).toContain('Rob Angeles')
      expect(html).not.toContain('src="/media/placeholder-10.webp"')
      expect(html).not.toContain('PLACEHOLDER10')
    }
  })

  it('preserves custom block order and groups only contiguous founder runs', () => {
    const html = render([
      { blockType: 'hero', heading: 'About' },
      founder('Alex Charasse', null),
      { blockType: 'plainStatement', statement: 'Custom editorial interlude' },
      founder('Rob Angeles', null),
      { blockType: 'plainStatement', statement: 'Custom closing interlude' },
    ] as Page['layout'])
    expect(html.indexOf('Alex Charasse')).toBeLessThan(html.indexOf('Custom editorial interlude'))
    expect(html.indexOf('Custom editorial interlude')).toBeLessThan(html.indexOf('Rob Angeles'))
    expect(html.indexOf('Rob Angeles')).toBeLessThan(html.indexOf('Custom closing interlude'))
    expect(html.match(/Founder biographies/g)).toHaveLength(2)
  })

  it('keeps founder names, roles, biography paragraphs and safe links editable', () => {
    const html = render([{ blockType: 'hero', heading: 'About' }, founder('A CMS name', realMedia(), [
      { label: 'Portfolio', url: 'https://example.com/work' }, { label: 'Unsafe', url: 'javascript:alert(1)' },
    ])] as Page['layout'])
    expect(html).toContain('<h3')
    expect(html).toContain('A CMS name')
    expect(html).toContain('Co-founder · CEO')
    expect(html).toContain('Maître Pâtissier · Maître Chocolatier')
    expect(html).toContain('Biography remains editable.')
    expect(html).toContain('href="https://example.com/work"')
    expect(html).not.toContain('javascript:')
  })
})
