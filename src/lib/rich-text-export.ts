import { safePublicHref } from './urls'

type RecordValue = Record<string, unknown>
type Output = { markdown: string; html: string; block: boolean }
type ExportImage = { url: string; alt: string }

const languages = new Set(['text', 'javascript', 'typescript', 'json', 'css', 'html', 'bash'])
const empty: Output = { markdown: '', html: '', block: false }

function record(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function children(value: RecordValue): unknown[] {
  if (value.children === undefined) return []
  if (!Array.isArray(value.children)) throw new Error('Rich text children must be an array.')
  return value.children
}

function fields(value: RecordValue): RecordValue {
  if (!record(value.fields)) throw new Error(`Rich text ${String(value.type)} block has no fields.`)
  return value.fields
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function escapeMarkdown(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([\\`*_{}\[\]()#+.!|~-])/g, '\\$1')
}

function originValue(origin: string): string {
  const parsed = new URL(origin)
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error('Rich text export origin must be a public HTTP origin.')
  return parsed.origin
}

function absoluteHref(value: unknown, origin: string): string | undefined {
  const href = safePublicHref(value)
  if (!href) return undefined
  return new URL(href, origin).href
}

function mediaInfo(value: unknown, origin: string): { url: string; alt: string; caption: string; credit: string; width: number; height: number } | undefined {
  if (!record(value) || typeof value.filename !== 'string' || value.filename.length === 0
    || value.filename === '.' || value.filename === '..'
    || new TextEncoder().encode(value.filename).length > 255
    || /[/\\\x00-\x1f\x7f-\x9f]/u.test(value.filename)
    || typeof value.alt !== 'string' || typeof value.width !== 'number' || typeof value.height !== 'number'
    || !Number.isFinite(value.width) || !Number.isFinite(value.height) || value.width <= 0 || value.height <= 0) return undefined
  return {
    url: new URL(`/media/${encodeURIComponent(value.filename)}`, origin).href,
    alt: value.alt,
    caption: text(value.caption).trim(),
    credit: text(value.credit).trim(),
    width: value.width,
    height: value.height,
  }
}

function imageOutput(media: ReturnType<typeof mediaInfo>, captionOverride: unknown, images: ExportImage[]): Output {
  if (!media) return empty
  images.push({ url: media.url, alt: media.alt })
  const caption = typeof captionOverride === 'string' ? captionOverride.trim() : media.caption
  const details = [caption, media.credit ? `Credit: ${media.credit}` : ''].filter(Boolean)
  const description = details.length ? `<figcaption>${details.map(escapeHtml).join('<br>')}</figcaption>` : ''
  // This URL was constructed from the validated site origin and a safe local filename.
  const safeUrl = media.url
  const html = `<figure><img src="${escapeHtml(safeUrl)}" alt="${escapeHtml(media.alt)}" width="${media.width}" height="${media.height}">${description}</figure>`
  const markdown = `![${escapeMarkdown(media.alt)}](${safeUrl.replace(/[()\\]/g, '\\$&')})${details.length ? `\n\n${details.map(escapeMarkdown).join(' · ')}` : ''}`
  return { markdown, html, block: true }
}

function inlineCode(value: string): string {
  const runs = value.match(/`+/g) ?? []
  const fence = '`'.repeat(Math.max(1, ...runs.map((run) => run.length + 1)))
  const pad = value.startsWith('`') || value.endsWith('`') || (value.startsWith(' ') && value.endsWith(' ')) ? ' ' : ''
  return `${fence}${pad}${value}${pad}${fence}`
}

function codeBlock(value: string, language: string): string {
  const fenceChar = value.includes('```') ? '~' : '`'
  const runs = value.match(fenceChar === '`' ? /`+/g : /~+/g) ?? []
  const fence = fenceChar.repeat(Math.max(3, ...runs.map((run) => run.length + 1)))
  return `${fence}${language === 'text' ? '' : language}\n${value}${value.endsWith('\n') ? '' : '\n'}${fence}`
}

function applyFormat(output: Output, format: unknown, raw: string): Output {
  if (typeof format !== 'number' || !Number.isFinite(format)) return output
  let markdown = (format & 16) !== 0 ? inlineCode(raw) : output.markdown
  let { html } = output
  const wrap = (bit: number, mdOpen: string, mdClose: string, tag: string) => {
    if ((format & bit) !== 0) {
      markdown = `${mdOpen}${markdown}${mdClose}`
      html = `<${tag}>${html}</${tag}>`
    }
  }
  wrap(1, '**', '**', 'strong')
  wrap(2, '*', '*', 'em')
  wrap(4, '~~', '~~', 's')
  if ((format & 8) !== 0) html = `<u>${html}</u>`
  if ((format & 16) !== 0) html = `<code>${html}</code>`
  if ((format & 32) !== 0) { html = `<sub>${html}</sub>`; markdown = `<sub>${markdown}</sub>` }
  if ((format & 64) !== 0) { html = `<sup>${html}</sup>`; markdown = `<sup>${markdown}</sup>` }
  wrap(128, '==', '==', 'mark')
  if ((format & 256) !== 0) html = `<span class="lowercase">${html}</span>`
  if ((format & 256) !== 0 && (format & 16) === 0) markdown = markdown.toLocaleLowerCase()
  if ((format & 512) !== 0) html = `<span class="uppercase">${html}</span>`
  if ((format & 512) !== 0 && (format & 16) === 0) markdown = markdown.toLocaleUpperCase()
  if ((format & 1024) !== 0) html = `<span class="capitalize">${html}</span>`
  return { ...output, markdown, html }
}

function joinInline(parts: Output[]): Output {
  return {
    markdown: parts.map((part) => part.markdown).join(''),
    html: parts.map((part) => part.html).join(''),
    block: false,
  }
}

function renderChildren(values: unknown[], origin: string, images: ExportImage[]): Output[] {
  return values.map((value) => renderNode(value, origin, images))
}

function renderParagraph(values: unknown[], origin: string, images: ExportImage[]): Output {
  const parts = renderChildren(values, origin, images)
  const chunks: Output[] = []
  let inline: Output[] = []
  const flush = () => {
    if (inline.length) {
      const joined = joinInline(inline)
      chunks.push({ markdown: joined.markdown, html: `<p>${joined.html}</p>`, block: true })
      inline = []
    }
  }
  for (const part of parts) {
    if (part.block) {
      flush()
      if (part.markdown || part.html) chunks.push(part)
    } else inline.push(part)
  }
  flush()
  return {
    markdown: chunks.map((part) => part.markdown).filter(Boolean).join('\n\n'),
    html: chunks.map((part) => part.html).join(''),
    block: true,
  }
}

function renderListItem(value: unknown, index: number, ordered: boolean, start: number, checkedList: boolean, origin: string, images: ExportImage[]): { md: string; html: string } {
  if (!record(value) || value.type !== 'listitem') throw new Error('Rich text lists may contain only list items.')
  const marker = checkedList ? `- [${value.checked === true ? 'x' : ' '}] ` : ordered ? `${start + index}. ` : '- '
  const indent = ' '.repeat(marker.length)
  const rendered = children(value).map((child) => ({ child, output: renderNode(child, origin, images) }))
  let md = marker
  let needsNewLine = false
  let firstContent = true
  let html = ''
  for (const { child, output } of rendered) {
    html += output.html
    if (!output.markdown && !output.html) continue
    const paragraphNode = record(child) && child.type === 'paragraph'
    if (output.block && !(firstContent && paragraphNode)) {
      md += '\n'
      md += output.markdown.split('\n').map((line) => `${indent}${line}`).join('\n')
      needsNewLine = true
    } else if (output.markdown) {
      if (needsNewLine) md += `\n${indent}`
      md += output.markdown
      needsNewLine = false
    }
    firstContent = false
  }
  const checkbox = checkedList ? `<input type="checkbox" disabled${value.checked === true ? ' checked' : ''} aria-label="${value.checked === true ? 'Complete' : 'Incomplete'}">` : ''
  return { md, html: `<li>${checkbox}${html}</li>` }
}

function renderNode(value: unknown, origin: string, images: ExportImage[]): Output {
  if (!record(value)) {
    if (typeof value === 'string' || typeof value === 'number') return { markdown: escapeMarkdown(String(value)), html: escapeHtml(String(value)), block: false }
    throw new Error('Unsupported non-object rich text node.')
  }
  const type = typeof value.type === 'string' ? value.type : ''
  switch (type) {
    case 'root': {
      const parts = renderChildren(children(value), origin, images)
      return { markdown: parts.map((part) => part.markdown).filter(Boolean).join('\n\n'), html: parts.map((part) => part.html).join(''), block: true }
    }
    case 'text': {
      const raw = text(value.text)
      const escaped = { markdown: escapeMarkdown(raw), html: escapeHtml(raw), block: false }
      return applyFormat(escaped, value.format, raw)
    }
    case 'paragraph': return renderParagraph(children(value), origin, images)
    case 'heading': {
      const tag = typeof value.tag === 'string' && /^h[1-6]$/u.test(value.tag) ? value.tag : 'h2'
      const safeTag = tag === 'h1' ? 'h2' : tag
      const level = Number(safeTag[1])
      const content = renderParagraph(children(value), origin, images)
      const md = `${'#'.repeat(level)} ${content.markdown.replace(/\n\n/g, '\n')}`
      const html = content.html.replace(/<p>/g, `<${safeTag}>`).replace(/<\/p>/g, `</${safeTag}>`)
      return { markdown: md, html, block: true }
    }
    case 'quote': {
      const parts = renderChildren(children(value), origin, images)
      const md = parts.map((part) => part.markdown).filter(Boolean).join('\n\n').split('\n').map((line) => `> ${line}`).join('\n')
      return { markdown: md, html: `<blockquote>${parts.map((part) => part.html).join('')}</blockquote>`, block: true }
    }
    case 'list': {
      const kind = text(value.listType)
      if (!['bullet', 'number', 'check'].includes(kind)) throw new Error(`Unsupported rich text list type: ${kind || '(empty)'}.`)
      const start = typeof value.start === 'number' && Number.isSafeInteger(value.start) ? value.start : 1
      const items = children(value).map((item, index) => renderListItem(item, index, kind === 'number', start, kind === 'check', origin, images))
      const htmlTag = kind === 'number' ? 'ol' : 'ul'
      const attr = kind === 'number' && start !== 1 ? ` start="${start}"` : kind === 'check' ? ' aria-label="Checklist"' : ''
      return { markdown: items.map((item) => item.md).join('\n'), html: `<${htmlTag}${attr}>${items.map((item) => item.html).join('')}</${htmlTag}>`, block: true }
    }
    case 'listitem': {
      const item = renderListItem(value, 0, false, 1, false, origin, images)
      return { markdown: item.md, html: item.html, block: true }
    }
    case 'link':
    case 'autolink': {
      const linkFields = fields(value)
      const rendered = renderChildren(children(value), origin, images)
      let path: string | undefined
      if (linkFields.linkType === 'internal') {
        const doc = record(linkFields.doc) ? linkFields.doc : undefined
        const target = doc && record(doc.value) ? doc.value : undefined
        if (doc && target && typeof target.slug === 'string' && target._status === 'published') {
          const slug = encodeURIComponent(target.slug)
          switch (doc.relationTo) {
            case 'pages': path = target.slug === 'home' ? '/' : `/${slug}`; break
            case 'posts': path = `/journal/${slug}`; break
            case 'services': path = `/services/${slug}`; break
            case 'events': path = `/training/${slug}`; break
          }
        }
      } else if (linkFields.linkType === 'custom') path = text(linkFields.url)
      const href = absoluteHref(path, origin)
      const target = href && linkFields.newTab === true && href.startsWith('https://') ? ' target="_blank" rel="noopener noreferrer"' : ''
      const parts = rendered.map((part) => {
        if (part.block || !href) return part
        const md = `[${part.markdown}](${href.replace(/[()\\]/g, '\\$&')})`
        return { ...part, markdown: md, html: `<a href="${escapeHtml(href)}"${target}>${part.html}</a>` }
      })
      return {
        markdown: parts.map((part) => part.markdown).filter(Boolean).join(parts.some((part) => part.block) ? '\n\n' : ''),
        html: parts.map((part) => part.html).join(''),
        block: parts.some((part) => part.block),
      }
    }
    case 'linebreak': return { markdown: '  \n', html: '<br>', block: false }
    case 'tab': return { markdown: '    ', html: '    ', block: false }
    case 'horizontalrule': return { markdown: '---', html: '<hr>', block: true }
    case 'upload': {
      if (value.relationTo !== 'media') throw new Error(`Unsupported rich text upload relation: ${String(value.relationTo)}.`)
      const media = mediaInfo(value.value, origin)
      if (!media) return empty
      const uploadFields = record(value.fields) ? value.fields : {}
      return imageOutput(media, typeof uploadFields.caption === 'string' && uploadFields.caption ? uploadFields.caption : undefined, images)
    }
    case 'inlineBlock':
    case 'block': {
      const block = fields(value)
      switch (block.blockType) {
        case 'inlineImage': return imageOutput(mediaInfo(block.image, origin), block.caption, images)
        case 'inlinePullQuote': {
          const quote = text(block.quote).trim()
          if (!quote) return empty
          const attribution = text(block.attribution).trim()
          return { markdown: `> ${escapeMarkdown(quote)}${attribution ? `\n>\n> _${escapeMarkdown(attribution)}_` : ''}`, html: `<figure><blockquote><p>${escapeHtml(quote)}</p></blockquote>${attribution ? `<figcaption>${escapeHtml(attribution)}</figcaption>` : ''}</figure>`, block: true }
        }
        case 'inlineCode': {
          const code = text(block.code)
          if (!code) return empty
          const language = languages.has(text(block.language)) ? text(block.language) : 'text'
          return { markdown: codeBlock(code, language), html: `<figure><pre><code data-language="${language}">${escapeHtml(code)}</code></pre><figcaption>${language}</figcaption></figure>`, block: true }
        }
        case 'controlledEmbed': {
          const provider = block.provider
          const videoId = block.videoId
          const caption = text(block.caption).trim()
          if ((provider !== 'youtube' && provider !== 'vimeo') || typeof videoId !== 'string' || !/^[A-Za-z0-9_-]{6,32}$/u.test(videoId)) {
            if (!caption) return empty
            return { markdown: escapeMarkdown(caption), html: `<p>${escapeHtml(caption)}</p>`, block: true }
          }
          const watch = provider === 'youtube' ? `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}` : `https://vimeo.com/${encodeURIComponent(videoId)}`
          const providerName = provider === 'youtube' ? 'YouTube' : 'Vimeo'
          return { markdown: `${caption ? `${escapeMarkdown(caption)} ` : ''}[Watch video on ${providerName}](${watch})`, html: `<p>${caption ? `${escapeHtml(caption)} ` : ''}<a href="${watch}">Watch video on ${providerName}</a></p>`, block: true }
        }
        default: throw new Error(`Unsupported rich text block: ${String(block.blockType)}.`)
      }
    }
    default: throw new Error(`Unsupported rich text node: ${type || '(empty)'}.`)
  }
}

export function renderRichTextExport(data: unknown, origin: string): { markdown: string; html: string; images: ExportImage[] } {
  const safeOrigin = originValue(origin)
  if (data === null || data === undefined) return { markdown: '', html: '', images: [] }
  if (!record(data) || !record(data.root) || data.root.type !== 'root') throw new Error('Rich text export requires a Lexical root node.')
  const images: ExportImage[] = []
  const output = renderNode(data.root, safeOrigin, images)
  return { markdown: output.markdown.trim(), html: output.html, images }
}
