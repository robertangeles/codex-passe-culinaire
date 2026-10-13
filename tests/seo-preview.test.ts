import { describe, expect, it } from 'vitest'
import { buildCanonicalPreview, buildSeoPreview } from '../src/lib/seo-preview'

describe('SEO admin preview values', () => {
  it('uses the same title and description fallback order as publication validation', () => {
    expect(buildSeoPreview({ title: ' Page title ', excerpt: ' Journal excerpt ', oneLiner: 'One line' })).toMatchObject({
      title: 'Page title',
      description: 'Journal excerpt',
      titleLength: 10,
      descriptionLength: 15,
    })
    expect(buildSeoPreview({ metaTitle: ' Override ', metaDescription: ' Search copy ', title: 'Title', excerpt: 'Excerpt' })).toMatchObject({
      title: 'Override',
      description: 'Search copy',
    })
  })

  it('uses exact 60 and 160 character boundaries and marks missing values calmly', () => {
    expect(buildSeoPreview({ metaTitle: 't'.repeat(60), metaDescription: 'd'.repeat(160) })).toMatchObject({
      titleMissing: false, descriptionMissing: false, titleOverLimit: false, descriptionOverLimit: false,
    })
    expect(buildSeoPreview({ metaTitle: 't'.repeat(61), metaDescription: 'd'.repeat(161), noIndex: true })).toMatchObject({
      titleOverLimit: true, descriptionOverLimit: true, noIndex: true,
    })
    expect(buildSeoPreview({})).toMatchObject({ titleMissing: true, descriptionMissing: true, noIndex: false })
  })

  it('shows a canonical only for known same-site collection routes', () => {
    expect(buildCanonicalPreview('https://example.test', 'posts', 'a-post')).toBe('https://example.test/journal/a-post')
    expect(buildCanonicalPreview('https://example.test', 'pages', 'home')).toBe('https://example.test/')
    expect(buildCanonicalPreview('https://example.test', 'pages', 'about')).toBe('https://example.test/about')
    expect(buildCanonicalPreview('https://example.test', 'pages', 'constructor')).toBe('https://example.test/constructor')
    expect(buildCanonicalPreview('https://example.test', 'constructor', 'a-post')).toBeUndefined()
    expect(buildCanonicalPreview('https://example.test/path', 'posts', 'a-post')).toBeUndefined()
    expect(buildCanonicalPreview('javascript:alert(1)', 'posts', 'a-post')).toBeUndefined()
    expect(buildCanonicalPreview('https://example.test', 'unknown', 'a-post')).toBeUndefined()
    expect(buildCanonicalPreview('https://example.test', 'posts', 'bad/slug')).toBeUndefined()
  })

  it('uses a valid HTTPS canonical override and falls back for invalid overrides', () => {
    expect(buildCanonicalPreview('https://example.test', 'posts', 'a-post', 'https://canonical.test/story'))
      .toBe('https://canonical.test/story')
    expect(buildCanonicalPreview('https://example.test', 'posts', 'a-post', 'https://user:secret@canonical.test/story'))
      .toBe('https://example.test/journal/a-post')
    expect(buildCanonicalPreview('https://example.test', 'posts', 'a-post', '/different-path'))
      .toBe('https://example.test/journal/a-post')
  })
})
