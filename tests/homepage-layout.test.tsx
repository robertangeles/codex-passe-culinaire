import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { BlockRenderer } from '../src/components/BlockRenderer'
import { assertLocalC4Target, homepageLayout, isOriginalHomepage, layoutsMatch } from '../scripts/homepage-content'
import originalLayout from '../scripts/assets/home-before-c4.json'
import type { Page } from '../src/payload-types'

const content = { posts: [], services: [], events: [] }

describe('C4 homepage', () => {
  it('renders the CMS product path, biographies and company scope without placeholder portraits', () => {
    const html = renderToStaticMarkup(<BlockRenderer blocks={homepageLayout(1)} title="Passe Culinaire" home content={content} />)
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html).toContain('From craft')
    expect(html).toContain('A day in the kitchen.')
    expect(html).not.toContain('Two dishes.')
    expect(html).toContain('Read the full kitchen story')
    expect(html).toContain('Waste Management')
    expect(html).toContain('Cocktail Lab')
    expect(html).toContain('preload="none"')
    expect(html).not.toMatch(/<video[^>]*\ssrc=/)
    expect(html).toContain('Alex Charasse')
    expect(html).toContain('Rob Angeles')
    expect(html).toContain('href="/contact"')
    expect(html).not.toContain('PLACEHOLDER')
    expect(html.indexOf('CulinAIre Kitchen')).toBeLessThan(html.indexOf('Alex Charasse'))
  })

  it('keeps noncontiguous founder groups and following blocks in their CMS order', () => {
    const layout: Page['layout'] = [
      { blockType: 'founderCard', name: 'First founder' },
      { blockType: 'plainStatement', statement: 'An editorial interruption.' },
      { blockType: 'founderCard', name: 'Second founder' },
      { blockType: 'founderCard', name: 'Third founder' },
    ]
    const html = renderToStaticMarkup(<BlockRenderer blocks={layout} title="CMS title" home content={content} />)
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html.indexOf('First founder')).toBeLessThan(html.indexOf('An editorial interruption.'))
    expect(html.indexOf('An editorial interruption.')).toBeLessThan(html.indexOf('Second founder'))
    expect(html.indexOf('Second founder')).toBeLessThan(html.indexOf('Third founder'))
  })

  it('ignores CMS IDs and empty defaults but refuses to replace edited copy, order or links', () => {
    const original = originalLayout as unknown as Page['layout']
    expect(isOriginalHomepage(original)).toBe(true)
    expect(isOriginalHomepage(original.map((block) => ({ ...block, id: 'cms-id', blockName: null })))).toBe(true)
    expect(isOriginalHomepage([...original].reverse())).toBe(false)
    expect(isOriginalHomepage(original.map((block) => block.blockType === 'hero' ? { ...block, summary: 'My edited introduction.' } : block))).toBe(false)
    expect(isOriginalHomepage(original.map((block) => block.blockType === 'productSpotlight' ? { ...block, webUrl: '/my-product' } : block))).toBe(false)
    expect(layoutsMatch(homepageLayout(1), homepageLayout(2))).toBe(false)
  })
})


describe('C4 local update boundary', () => {
  it('accepts only loopback PostgreSQL with local media', () => {
    expect(() => assertLocalC4Target('http://localhost:3000', 'postgresql://user:secret@127.0.0.1:55432/local', 'local')).not.toThrow()
    expect(() => assertLocalC4Target('http://[::1]:3000', 'postgresql://user:secret@[::1]/local', 'local')).not.toThrow()
    for (const uri of ['postgresql://user:secret@database.example/prod', 'postgresql://user:secret@127.0.0.1/local?host=database.example', 'invalid']) {
      expect(() => assertLocalC4Target('http://localhost:3000', uri, 'local')).toThrow()
    }
    expect(() => assertLocalC4Target('https://public.example', 'postgresql://localhost/local', 'local')).toThrow()
    expect(() => assertLocalC4Target('http://localhost:3000', 'postgresql://localhost/local', 's3')).toThrow()
  })
})
