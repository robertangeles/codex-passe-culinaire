import { describe, expect, it } from 'vitest'
import type { Media } from '../src/payload-types'
import { serializeJsonLd } from '../src/lib/seo/core'
import { buildPageMetadata } from '../src/lib/seo/metadata'
import { isInSitemap, isPublishedExport } from '../src/lib/discovery-policy'
const origin = 'https://passeculinaire.test'
const media = (filename: string) => ({ filename, placeholder: false } as Media)

describe('shared metadata and discovery policy', () => {
  it('keeps script termination and Unicode separators inert while preserving JSON text', () => {
    const text = '</script><script>alert(1)</script>\u2028\u2029&'
    const serialized = serializeJsonLd([{ '@type': 'WebPage', name: text }])
    expect(serialized).not.toContain('<')
    expect(serialized).not.toContain('\u2028')
    expect(JSON.parse(serialized)['@graph'][0].name).toBe(text)
  })
  it('excludes drafts and noIndex from exports while keeping sitemap-only exclusions separate', () => {
    expect(isPublishedExport({ _status: 'draft' })).toBe(false)
    expect(isPublishedExport({ _status: 'published', seo: { noIndex: true } })).toBe(false)
    const document = { _status: 'published' as const, seo: { excludeFromSitemap: true } }
    expect(isPublishedExport(document)).toBe(true)
    expect(isInSitemap(document)).toBe(false)
    expect(isInSitemap({ noIndex: true }, false)).toBe(false)
    expect(isInSitemap({}, false)).toBe(true)
  })
  it('uses effective copy, safe canonical overrides and private preview robots', () => {
    const input = { path: '/about', title: 'About', description: 'Kitchen work.', seo: { metaTitle: 'Our kitchen', canonicalUrl: 'https://user:password@evil.test' }, preview: true }
    const metadata = buildPageMetadata(input, origin)
    expect(metadata).toMatchObject({ title: 'Our kitchen', description: 'Kitchen work.', alternates: { canonical: `${origin}/about` }, robots: { index: false, follow: false } })
  })
  it('uses the required image fallback order and omits placeholder imagery', () => {
    const input = { path: '/journal/test', title: 'Test', seo: { ogImage: media('override.webp') }, heroImage: media('hero.webp'), generatedOgPath: '/journal/test/opengraph-image' }
    expect(buildPageMetadata(input, origin).openGraph).toMatchObject({ images: [{ url: `${origin}/media/override.webp` }] })
    expect(buildPageMetadata({ ...input, seo: {} }, origin).openGraph).toMatchObject({ images: [{ url: `${origin}/media/hero.webp` }] })
    expect(buildPageMetadata({ ...input, seo: {}, heroImage: { ...media('placeholder.webp'), placeholder: true } }, origin).openGraph).toMatchObject({ images: [{ url: `${origin}/journal/test/opengraph-image` }] })
  })
})
