import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { Media } from '../src/payload-types'
import { RichText } from '../src/components/RichText'

const mediaFixture = {
  id: 42,
  updatedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  alt: 'A laminated pastry on the bench',
  filename: 'pastry.webp',
  width: 1800,
  height: 1200,
  sizes: { webp960: { filename: 'pastry-960.webp', width: 960 } },
} satisfies Media

function render(children: unknown[], options: { externalEmbedsEnabled?: boolean } = {}): string {
  return renderToStaticMarkup(
    <RichText
      data={{ root: { type: 'root', children } }}
      {...options}
    />,
  )
}

describe('RichText', () => {
  it('renders text formats, headings, paragraphs and both list kinds semantically', () => {
    const html = render([
      {
        type: 'heading', tag: 'h1', children: [{ type: 'text', text: 'Kitchen notes', format: 1 }],
      },
      { type: 'paragraph', children: [{ type: 'text', text: 'Made by hand', format: 2 | 8 | 16 }] },
      {
        type: 'list', listType: 'number', start: 5, children: [
          { type: 'listitem', value: 5, checked: undefined, children: [{ type: 'text', text: 'Mix' }] },
        ],
      },
      {
        type: 'list', listType: 'check', children: [
          { type: 'listitem', value: 1, checked: true, children: [{ type: 'text', text: 'Bake' }] },
          { type: 'listitem', value: 2, checked: false, children: [{ type: 'text', text: 'Cool' }] },
        ],
      },
    ])

    expect(html).toContain('<h2')
    expect(html).not.toContain('<h1')
    expect(html).toContain('<strong>Kitchen notes</strong>')
    expect(html).toContain('<code><u><em>Made by hand</em></u></code>')
    expect(html).toContain('<ol')
    expect(html).toContain('start="5"')
    expect(html).toContain('<li')
    expect(html).toContain('type="checkbox"')
    expect(html).toContain('aria-label="Complete"')
    expect(html).toContain('aria-label="Incomplete"')
  })

  it('renders paragraph line breaks without missing React keys', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const html = render([
        { type: 'paragraph', children: [
          { type: 'text', text: 'First line' },
          { type: 'linebreak' },
          { type: 'text', text: 'Second line' },
        ] },
      ])
      expect(html).toContain('First line<br/>Second line')
      expect(error).not.toHaveBeenCalled()
    } finally {
      error.mockRestore()
    }
  })

  it('renders the four configured custom block types without placing block elements inside paragraphs', () => {
    const html = render([
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: 'Before' },
          { type: 'inlineBlock', fields: { blockType: 'inlineImage', image: mediaFixture, caption: 'Lamination' } },
          { type: 'text', text: 'After' },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            fields: { linkType: 'custom', url: 'https://example.com/method', newTab: false },
            children: [
              { type: 'text', text: 'Read first' },
              { type: 'inlineBlock', fields: { blockType: 'inlinePullQuote', quote: 'Pause between folds.' } },
              { type: 'text', text: 'Read after' },
            ],
          },
        ],
      },
      {
        type: 'heading', tag: 'h2', children: [
          { type: 'text', text: 'Section ' },
          { type: 'inlineBlock', fields: { blockType: 'inlinePullQuote', quote: 'A measured pace.' } },
          { type: 'text', text: 'continued' },
        ],
      },
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: 'Upload ' },
          { type: 'upload', relationTo: 'media', value: mediaFixture, fields: { caption: 'Uploaded pastry' } },
          { type: 'text', text: ' finished.' },
        ],
      },
      {
        type: 'inlineBlock',
        fields: { blockType: 'inlinePullQuote', quote: 'Keep the bench clear.', attribution: 'Alex' },
      },
      {
        type: 'inlineBlock',
        fields: { blockType: 'inlineCode', language: 'bash', code: '<script>alert(1)</script>' },
      },
      {
        type: 'inlineBlock',
        fields: { blockType: 'controlledEmbed', provider: 'youtube', videoId: 'AbCdEf_123', caption: 'Mixing method' },
      },
    ])

    expect(html).toContain('<p class=')
    expect(html).toContain('Before')
    expect(html).toContain('After')
    expect(html).toContain('Read first')
    expect(html).toContain('Read after')
    expect(html).toContain('Pause between folds.')
    expect(html).toContain('A measured pace.')
    expect(html).toContain('Section ')
    expect(html).toContain('continued')
    expect(html).toContain('Uploaded pastry')
    expect(html).toContain('<figure')
    expect(html).toContain('src="/media/pastry.webp"')
    expect(html).toContain('<blockquote>')
    expect(html).toContain('Keep the bench clear.')
    expect(html).toContain('<pre><code')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).not.toContain('<script>alert')
    expect(html).toContain('Watch video on YouTube')
    expect(html).not.toContain('<iframe')
    expect(html).not.toContain('<figure><p')
    expect(html).not.toContain('<p><figure')
    expect(html).not.toMatch(/<p\b[^>]*>(?:(?!<\/p>)[\s\S])*<(?:figure|pre|div)\b/u)
    expect(html).not.toMatch(/<h[2-6]\b[^>]*>(?:(?!<\/h[2-6]>)[\s\S])*<(?:figure|pre|div)\b/u)
  })

  it('only adds a lazy iframe for a validated provider ID when explicitly enabled', () => {
    const safe = render([
      { type: 'inlineBlock', fields: { blockType: 'controlledEmbed', provider: 'youtube', videoId: 'AbCdEf_123', caption: 'Technique' } },
    ], { externalEmbedsEnabled: true })
    expect(safe).toContain('src="https://www.youtube-nocookie.com/embed/AbCdEf_123"')
    expect(safe).toContain('loading="lazy"')
    expect(safe).toContain('title="Technique"')
    expect(safe).toContain('sandbox=')
    expect(safe).not.toContain('autoplay')

    const vimeo = render([
      { type: 'inlineBlock', fields: { blockType: 'controlledEmbed', provider: 'vimeo', videoId: 'abC123_DEF', caption: 'Chocolate work' } },
    ], { externalEmbedsEnabled: true })
    expect(vimeo).toContain('src="https://player.vimeo.com/video/abC123_DEF"')
    expect(vimeo).toContain('title="Chocolate work"')

    const rejected = render([
      { type: 'inlineBlock', fields: { blockType: 'controlledEmbed', provider: 'youtube', videoId: 'javascript:alert(1)', caption: 'Unsafe source' } },
      { type: 'inlineBlock', fields: { blockType: 'controlledEmbed', provider: 'other', videoId: 'AbCdEf_123', caption: 'Unknown source' } },
    ], { externalEmbedsEnabled: true })
    expect(rejected).not.toContain('<iframe')
    expect(rejected).toContain('Unsafe source')
    expect(rejected).toContain('Unknown source')
  })

  it('drops unsafe links but keeps text, and links internal records only when populated and published', () => {
    const html = render([
      { type: 'paragraph', children: [
        { type: 'link', fields: { linkType: 'custom', url: 'javascript:alert(1)', newTab: true }, children: [{ type: 'text', text: 'Plain words' }] },
        { type: 'link', fields: { linkType: 'internal', doc: { relationTo: 'pages', value: { id: 5, slug: 'about', _status: 'draft' } } }, children: [{ type: 'text', text: 'Draft page' }] },
        { type: 'link', fields: { linkType: 'internal', doc: { relationTo: 'pages', value: { id: 6, slug: 'about', _status: 'published' } } }, children: [{ type: 'text', text: 'About page' }] },
        { type: 'link', fields: { linkType: 'internal', doc: { relationTo: 'posts', value: 'post-id' } }, children: [{ type: 'text', text: 'Unpopulated post' }] },
      ] },
    ])
    expect(html).toContain('Plain words')
    expect(html).toContain('Draft page')
    expect(html).toContain('About page')
    expect(html).toContain('href="/about"')
    expect(html).not.toContain('href="javascript:')
    expect(html).not.toContain('href="/about" target')
    expect(html).toContain('Unpopulated post')
    expect(html).not.toContain('post-id')
  })

  it('escapes stored HTML and preserves readable children of unknown wrappers', () => {
    const html = render([
      { type: 'paragraph', children: [
        { type: 'text', text: '<img src=x onerror=alert(1)>' },
        { type: 'futureWrapper', children: [{ type: 'text', text: 'Still here' }] },
      ] },
    ])
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
    expect(html).not.toContain('<img')
    expect(html).toContain('Still here')
  })
})
