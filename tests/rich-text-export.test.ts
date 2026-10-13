import { describe, expect, it } from 'vitest'
import { renderRichTextExport } from '../src/lib/rich-text-export'

const origin = 'https://passeculinaire.test'
const text = (value: string, format = 0) => ({ type: 'text', text: value, format, version: 1 })
const paragraph = (...nodes: unknown[]) => ({ type: 'paragraph', children: nodes, version: 1 })
const block = (blockType: string, values: Record<string, unknown>, type = 'inlineBlock') => ({ type, fields: { blockType, ...values }, version: 1 })
const root = (...nodes: unknown[]) => ({ root: { type: 'root', children: nodes, version: 1 } })
const media = (filename: string, alt = 'A plated dish') => ({ id: 3, filename, alt, width: 1200, height: 800, caption: 'On the pass', credit: 'Kitchen team', placeholder: false })

describe('rich text public exports', () => {
  it('renders every supported Lexical node and custom block to Markdown and safe HTML', () => {
    const result = renderRichTextExport(root(
      paragraph(text('Bold', 1), text(' italic', 2), text(' strike', 4), text(' underline', 8), text(' code', 16), text(' sub', 32), text(' sup', 64), text(' mark', 128), text(' lower', 256), text(' upper', 512), text(' cap', 1024), { type: 'linebreak' }, text('tab'), { type: 'tab' }),
      { type: 'heading', tag: 'h1', children: [text('Heading')] },
      { type: 'quote', children: [paragraph(text('Quoted'))] },
      { type: 'list', listType: 'number', start: 4, children: [{ type: 'listitem', children: [text('First')] }, { type: 'listitem', children: [text('Second')] }] },
      { type: 'list', listType: 'check', children: [{ type: 'listitem', checked: true, children: [text('Done')] }, { type: 'listitem', checked: false, children: [text('Next')] }] },
      { type: 'list', listType: 'bullet', children: [{ type: 'listitem', children: [text('Bullet')] }] },
      { type: 'horizontalrule' },
      { type: 'link', fields: { linkType: 'custom', url: 'https://example.test/kitchen', newTab: true }, children: [text('External')] },
      { type: 'autolink', fields: { linkType: 'internal', doc: { relationTo: 'posts', value: { slug: 'service-notes', _status: 'published' } } }, children: [text('Internal')] },
      { type: 'autolink', fields: { linkType: 'internal', doc: { relationTo: 'posts', value: { slug: 'draft-note', _status: 'draft' } } }, children: [text('Draft stays text')] },
      { type: 'upload', relationTo: 'media', value: media('pass photo.jpg'), fields: { caption: 'Upload caption' } },
      block('inlineImage', { image: media('inline.png'), caption: 'Inline caption' }),
      block('inlinePullQuote', { quote: 'A careful quote', attribution: 'A cook' }, 'block'),
      block('inlineCode', { language: 'typescript', code: 'const x = `tick`\nconsole.log(x)' }),
      block('controlledEmbed', { provider: 'youtube', videoId: 'aB_cd-1234', caption: 'Pass demo' }),
      { type: 'block', fields: { blockType: 'controlledEmbed', provider: 'vimeo', videoId: 'video_1234', caption: 'Vimeo demo' } },
    ), origin)
    expect(result.markdown).toContain('## Heading')
    expect(result.markdown).toContain('4. First')
    expect(result.markdown).toContain('- [x] Done')
    expect(result.markdown).toContain('[External](https://example.test/kitchen)')
    expect(result.markdown).toContain('[Internal](https://passeculinaire.test/journal/service-notes)')
    expect(result.markdown).toContain('Draft stays text')
    expect(result.markdown).toContain('```typescript')
    expect(result.markdown).toContain('[Watch video on YouTube](https://www.youtube.com/watch?v=aB_cd-1234)')
    expect(result.html).toContain('<h2>Heading</h2>')
    expect(result.html).toContain('<ol start="4">')
    expect(result.html).toContain('<input type="checkbox" disabled checked')
    expect(result.html).toContain('target="_blank" rel="noopener noreferrer"')
    expect(result.html).not.toContain('<iframe')
    expect(result.html).not.toContain('youtube-nocookie')
    expect(result.images).toEqual([
      { url: `${origin}/media/pass%20photo.jpg`, alt: 'A plated dish' },
      { url: `${origin}/media/inline.png`, alt: 'A plated dish' },
    ])
  })

  it('escapes hostile text and attributes, refuses unsafe hrefs, and omits unresolved media', () => {
    const hostile = '<script>alert("x")</script> &'
    const result = renderRichTextExport(root(
      paragraph(text(hostile)),
      { type: 'link', fields: { linkType: 'custom', url: 'javascript:alert(1)' }, children: [text('unsafe link')] },
      { type: 'link', fields: { linkType: 'custom', url: 'https://safe.test/\" onmouseover=\"x' }, children: [text('bad URL')] },
      { type: 'upload', relationTo: 'media', value: 5 },
      block('inlineImage', { image: null }),
      block('controlledEmbed', { provider: 'youtube', videoId: 'bad id', caption: '<img src=x onerror=alert(1)>' }),
    ), origin)
    expect(result.html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp;')
    expect(result.html).not.toContain('<script>')
    expect(result.html).not.toContain('javascript:')
    expect(result.html).not.toContain('onmouseover')
    expect(result.html).toContain('&lt;img src=x onerror=alert(1)&gt;')
    expect(result.images).toEqual([])
    expect(result.markdown).toContain('unsafe link')
    expect(result.markdown).toContain('&lt;script&gt;alert\\(\"x\"\\)&lt;/script&gt; &amp;')
  })

  it('preserves text and block order in list items and indents nested lists by the marker width', () => {
    const result = renderRichTextExport(root(
      { type: 'list', listType: 'number', start: 99, children: [{ type: 'listitem', children: [paragraph(text('Ninety nine'))] }, { type: 'listitem', children: [paragraph(text('Before')), block('inlineImage', { image: { ...media('between.png'), caption: '', credit: '' } }), paragraph(text('After')), { type: 'list', listType: 'bullet', children: [{ type: 'listitem', children: [paragraph(text('Nested'))] }] }] }] },
    ), origin)
    expect(result.markdown.indexOf('Before')).toBeLessThan(result.markdown.indexOf('between.png'))
    expect(result.markdown.indexOf('between.png')).toBeLessThan(result.markdown.indexOf('After'))
    expect(result.markdown).toContain('100. Before\n     ![A plated dish](https://passeculinaire.test/media/between.png)\n     After\n     - Nested')
  })

  it('uses fenced code delimiters longer than embedded fence runs and escapes code HTML', () => {
    const result = renderRichTextExport(root(block('inlineCode', { language: 'html', code: '<script>\n```\n</script>' })), origin)
    expect(result.markdown).toContain('~~~html')
    expect(result.markdown).toContain('<script>\n```\n</script>')
    expect(result.html).toContain('&lt;script&gt;')
    expect(result.html).not.toContain('<script>')
    const literalInlineCode = renderRichTextExport(root(paragraph(text('a*b', 16))), origin)
    expect(literalInlineCode.markdown).toContain('`a*b`')
    expect(literalInlineCode.markdown).not.toContain('a\\*b')
  })

  it('fails closed for unknown node and block schemas, but returns empty for missing rich text', () => {
    expect(renderRichTextExport(null, origin)).toEqual({ markdown: '', html: '', images: [] })
    expect(() => renderRichTextExport(root({ type: 'mysteryNode', children: [text('kept?')] }), origin)).toThrow('Unsupported rich text node')
    expect(() => renderRichTextExport(root(block('mysteryBlock', {})), origin)).toThrow('Unsupported rich text block')
  })
  it('retains local media when the configured development origin uses HTTP', () => {
    const output = renderRichTextExport(root(block('inlineImage', { image: media('local.png') })), 'http://localhost:3000')
    expect(output.html).toContain('src="http://localhost:3000/media/local.png"')
    expect(output.markdown).toContain('http://localhost:3000/media/local.png')
  })

})
