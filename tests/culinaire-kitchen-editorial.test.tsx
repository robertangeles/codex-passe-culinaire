import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { BlockRenderer } from '../src/components/BlockRenderer'
import { approvedCulinaireKitchenLayout } from '../scripts/culinaire-kitchen-content'
import type { Page, Media, Post } from '../src/payload-types'
import type { BlockContent } from '../src/lib/page-view-model'

const content: BlockContent = { posts: [], services: [], events: [] }
const media = (overrides: Partial<Media> = {}): Media => ({
  id: 23, filename: 'bench-photo.webp', alt: 'A chef finishing tart shells at a pastry bench.', width: 1440, height: 960,
  caption: 'Preparation at the bench', credit: 'Studio Kitchen', focalX: 68, focalY: 31, placeholder: false, createdAt: '', updatedAt: '',
  ...overrides,
})
function render(blocks: Page['layout']) {
  return renderToStaticMarkup(<BlockRenderer blocks={blocks} content={content} title="CulinAIre Kitchen" culinaireKitchen externalEmbedsEnabled={false} />)
}

const richLink = (url: string): NonNullable<Post['body']> => ({ root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: [
  { type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0, children: [
    { type: 'link', version: 1, fields: { linkType: 'custom', url, newTab: false }, children: [{ type: 'text', version: 1, text: 'Unsafe product link', format: 0, detail: 0, mode: 'normal', style: '' }] },
  ] },
] } })

describe('CulinAIre Kitchen editorial rendering', () => {
  it('renders all approved kitchen scope as server HTML with one h1 and live section links', () => {
    const html = render(approvedCulinaireKitchenLayout())
    for (const phrase of [
      'Behind every service.', 'Forecasting &amp; rostering', 'Team messaging', 'Purchasing &amp; receiving',
      'Inventory &amp; stock transfers', 'Mise en Place &amp; production', 'Menu &amp; costing', 'Waste Management',
      'Sales', 'Recipe Lab', 'Patisserie Lab', 'Cocktail Lab', 'Forecasting', 'Lemon tart', 'Fruit tart',
      'CulinAIre Kitchen uses AI to help organise the prep list', 'Alex Charasse', 'Rob Angeles', 'Talk to us',
    ]) expect(html).toContain(phrase)
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    for (const id of ['operation', 'labs', 'example', 'film']) expect(html).toContain(`id="${id}"`)
    expect(html).toContain('href="#film">Watch the kitchen film</a>')
    expect(html).toContain('href="https://www.culinaire.kitchen"')
    expect(html).toContain('href="/contact"')
  })

  it('retains unknown and interleaved blocks in their CMS order', () => {
    const layout = approvedCulinaireKitchenLayout() ?? []
    const withInterludes = [...layout.slice(0, 3),
      { blockType: 'plainStatement' as const, statement: 'Independent kitchen note one.' },
      ...layout.slice(3, 5),
      { blockType: 'hero' as const, blockName: 'Custom later hero', heading: 'Custom CMS interlude', style: 'quiet' as const },
      ...layout.slice(5),
    ] as Page['layout']
    const html = render(withInterludes)
    const positions = ['Plan the day.', 'Independent kitchen note one.', 'Know what comes in.', 'Prepare for service.', 'Custom CMS interlude', 'Understand what went out.'].map((text) => html.indexOf(text))
    expect(positions.every((position) => position >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((left, right) => left - right))
    expect(html.match(/<h1\b/g)).toHaveLength(1)
  })

  it('removes anchors for optional sections that are absent', () => {
    const html = render((approvedCulinaireKitchenLayout() ?? []).filter((block) => !['Kitchen labs', 'Kitchen example', 'Kitchen film', 'Kitchen operation introduction', 'Kitchen operation 1', 'Kitchen operation 2', 'Kitchen operation 3', 'Kitchen operation 4'].includes(block.blockName ?? '')) as Page['layout'])
    for (const id of ['operation', 'labs', 'example', 'film']) expect(html).not.toContain(`id="${id}"`)
    expect(html).not.toContain('href="#operation"')
  })

  it('uses only valid first named targets and keeps later duplicates and heroes generic', () => {
    const layout = approvedCulinaireKitchenLayout() ?? []
    const film = layout.find((block) => block.blockType === 'feature' && block.blockName === 'Kitchen film')
    const example = layout.find((block) => block.blockType === 'feature' && block.blockName === 'Kitchen example')
    if (film?.blockType !== 'feature' || example?.blockType !== 'feature') throw new Error('Expected the approved film and example blocks.')
    const noLabsLayout = layout.filter((block) => block.blockName !== 'Kitchen labs')
    const amended = [
      ...noLabsLayout.slice(0, 1),
      { blockType: 'hero' as const, blockName: 'Kitchen introduction', heading: 'Later named hero', style: 'quiet' as const },
      ...noLabsLayout.slice(1),
      { ...example, heading: 'Duplicate example copy' },
      { ...film, heading: 'Duplicate film copy' },
      { blockType: 'hero' as const, blockName: 'Kitchen labs', heading: 'Malformed lab target', style: 'quiet' as const },
    ] as Page['layout']
    const html = render(amended)
    expect(html).toContain('Later named hero')
    expect(html).toContain('Duplicate example copy')
    expect(html).toContain('Duplicate film copy')
    expect(html).toContain('Malformed lab target')
    expect(html).not.toContain('id="labs"')
    expect(html.match(/id="film"/gu)).toHaveLength(1)
    expect(html.match(/data-kitchen-video/gu)).toHaveLength(1)
    expect(html.match(/id="kitchen-film-transcript"/gu)).toHaveLength(1)
    expect(html.match(/href="https:\/\/www\.culinaire\.kitchen"/gu)).toHaveLength(2)
    expect(html.match(/<h1\b/gu)).toHaveLength(1)

    const noFilm = render([...layout.filter((block) => block.blockName !== 'Kitchen film'),
      { blockType: 'hero', blockName: 'Kitchen film', heading: 'Malformed film target', style: 'quiet' },
    ] as Page['layout'])
    expect(noFilm).not.toContain('id="film"')
    expect(noFilm).not.toContain('href="#film"')
    expect(noFilm).not.toContain('data-kitchen-video')
  })

  it('keeps useful fallbacks when approved copy or optional media is missing', () => {
    const layout = (approvedCulinaireKitchenLayout() ?? []).map((block) => {
      if (block.blockType === 'hero') return { ...block, heading: '', summary: null, image: null }
      if (block.blockType === 'feature' && block.blockName === 'Kitchen example') return { ...block, heading: null, body: null, image: 92 }
      return block
    }) as Page['layout']
    const html = render(layout)
    expect(html).toContain('<h1')
    expect(html).toContain('CulinAIre Kitchen')
    expect(html).toContain('url=%2Fimages%2Fculinaire-kitchen%2Fpreparation.webp')
    expect(html).toContain('url=%2Fimages%2Fculinaire-kitchen%2Ftart.webp')
    expect(html).toContain('id="example"')
  })

  it('uses real CMS media metadata and its focal point when supplied', () => {
    const layout = (approvedCulinaireKitchenLayout() ?? []).map((block) =>
      block.blockType === 'hero' ? { ...block, image: media() }
        : block.blockType === 'feature' && block.blockName === 'Kitchen example' ? { ...block, image: media({ filename: 'tart-real.webp' }) }
          : block) as Page['layout']
    const html = render(layout)
    expect(html).toContain('src="/media/bench-photo.webp"')
    expect(html).toContain('alt="A chef finishing tart shells at a pastry bench."')
    expect(html).toContain('Preparation at the bench')
    expect(html).toContain('Credit: Studio Kitchen')
    expect(html).toContain('object-position:68% 31%')
    expect(html).toContain('loading="eager"')
    expect(html).toContain('fetchPriority="high"')
    expect(html).toContain('src="/media/tart-real.webp"')
    expect(html).not.toContain('src="/images/culinaire-kitchen/tart.webp"')
  })

  it('filters unsafe RichText links and keeps the accessible explicit-play film', () => {
    const layout = (approvedCulinaireKitchenLayout() ?? []).map((block) =>
      block.blockType === 'feature' && block.blockName === 'Kitchen continuation' ? { ...block, body: richLink('javascript:alert(1)') } : block) as Page['layout']
    const html = render(layout)
    expect(html).not.toContain('javascript:')
    expect(html).toContain('data-kitchen-video')
    expect(html).toContain('preload="none"')
    expect(html).toContain('data-film-play')
    expect(html).toContain('kitchen-film-transcript')
    expect(html).toContain('/films/kitchen-day/landscape-v1.mp4')
    expect(html).toContain('/films/kitchen-day/portrait-v1.mp4')
    expect(html).not.toMatch(/<video[^>]+\ssrc=/u)
  })
})
