import { Fragment, type ReactNode } from 'react'
import { safePublicHref } from '../lib/urls'
import type { Media } from '../payload-types'
import { ResponsiveMedia } from './ResponsiveMedia'
import styles from './RichText.module.css'

type RecordValue = Record<string, unknown>

type RichTextProps = {
  data: unknown
  externalEmbedsEnabled?: boolean
}

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function childrenOf(value: RecordValue): unknown[] {
  return Array.isArray(value.children) ? value.children : []
}

function mediaValue(value: unknown): value is Media | number | null {
  if (typeof value === 'number' || value === null) return true
  return isRecord(value)
    && typeof value.id === 'number'
    && typeof value.alt === 'string'
    && typeof value.createdAt === 'string'
    && typeof value.updatedAt === 'string'
}

function nodeType(value: unknown): string {
  return isRecord(value) && typeof value.type === 'string' ? value.type : ''
}

function blockFields(value: RecordValue): RecordValue | undefined {
  return isRecord(value.fields) ? value.fields : undefined
}

function recordText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function hasBlockShape(node: RecordValue): boolean {
  return node.type === 'block' || node.type === 'inlineBlock' || node.type === 'upload'
}

function renderList(children: unknown[], kind: string, path: string, embedsEnabled: boolean, start: unknown): ReactNode {
  if (kind === 'check') {
    return (
      <ul className={styles.checklist} aria-label="Checklist">
        {children.map((child, index) => renderListItem(child, `${path}-${index}`, true, embedsEnabled))}
      </ul>
    )
  }

  if (kind === 'number') {
    const orderedStart = typeof start === 'number' && Number.isInteger(start) ? start : 1
    return (
      <ol className={styles.list} start={orderedStart === 1 ? undefined : orderedStart}>
        {children.map((child, index) => renderListItem(child, `${path}-${index}`, false, embedsEnabled))}
      </ol>
    )
  }

  return (
    <ul className={styles.list}>
      {children.map((child, index) => renderListItem(child, `${path}-${index}`, false, embedsEnabled))}
    </ul>
  )
}

function renderListItem(value: unknown, key: string, checkedList: boolean, embedsEnabled = false): ReactNode {
  if (!isRecord(value)) return null
  const checked = value.checked === true
  return (
    <li key={key} className={checkedList ? styles.checklistItem : undefined}>
      {checkedList && <input className={styles.checkmark} type="checkbox" checked={checked} disabled aria-label={checked ? 'Complete' : 'Incomplete'} />}
      {renderChildren(childrenOf(value), `${key}-child`, embedsEnabled)}
    </li>
  )
}

type ParagraphPart = { block: boolean; content: ReactNode }

function splitParagraphNode(value: unknown, key: string, embedsEnabled: boolean): ParagraphPart[] {
  if (!isRecord(value)) return [{ block: false, content: renderNode(value, key, embedsEnabled) }]
  if (hasBlockShape(value)) {
    const content = value.type === 'upload'
      ? renderUpload(value, key)
      : renderBlock(value, key, embedsEnabled)
    return [{ block: true, content }]
  }

  const type = nodeType(value)
  if (type === 'link' || type === 'autolink') {
    const fields = blockFields(value)
    const childParts = childrenOf(value).flatMap((child, index) => splitParagraphNode(child, `${key}-${index}`, embedsEnabled))
    if (!fields) return childParts
    return childParts.map((part, index) => ({
      block: part.block,
      content: part.block ? part.content : linkedContent(part.content, linkHref(fields), fields, `${key}-link-${index}`),
    }))
  }

  const children = childrenOf(value)
  if (children.length > 0) {
    const nested = children.flatMap((child, index) => splitParagraphNode(child, `${key}-${index}`, embedsEnabled))
    if (nested.some((part) => part.block)) return nested
  }
  return [{ block: false, content: renderNode(value, key, embedsEnabled) }]
}

function renderParagraphChildren(children: unknown[], path: string, embedsEnabled: boolean): ReactNode {
  const parts: ReactNode[] = []
  let inline: ReactNode[] = []
  let segment = 0
  const flush = () => {
    if (inline.length > 0) {
      parts.push(<p className={styles.paragraph} key={`${path}-p-${segment++}`}>{inline}</p>)
      inline = []
    }
  }

  children.forEach((child, index) => {
    const split = splitParagraphNode(child, `${path}-${index}`, embedsEnabled)
    split.forEach((part) => {
      if (part.block) {
        flush()
        if (part.content) parts.push(part.content)
        segment += 1
      } else {
        inline.push(part.content)
      }
    })
  })
  flush()
  return parts
}

function textWithFormats(text: string, format: unknown, key: string): ReactNode {
  if (typeof format !== 'number' || !Number.isFinite(format)) return text
  let content: ReactNode = text
  if ((format & 1) !== 0) content = <strong key={`${key}-bold`}>{content}</strong>
  if ((format & 2) !== 0) content = <em key={`${key}-italic`}>{content}</em>
  if ((format & 4) !== 0) content = <s key={`${key}-strike`}>{content}</s>
  if ((format & 8) !== 0) content = <u key={`${key}-underline`}>{content}</u>
  if ((format & 16) !== 0) content = <code key={`${key}-code`}>{content}</code>
  if ((format & 32) !== 0) content = <sub key={`${key}-sub`}>{content}</sub>
  if ((format & 64) !== 0) content = <sup key={`${key}-sup`}>{content}</sup>
  if ((format & 128) !== 0) content = <mark key={`${key}-highlight`}>{content}</mark>
  if ((format & 256) !== 0) content = <span key={`${key}-lowercase`} className={styles.lowercase}>{content}</span>
  if ((format & 512) !== 0) content = <span key={`${key}-uppercase`} className={styles.uppercase}>{content}</span>
  if ((format & 1024) !== 0) content = <span key={`${key}-capitalize`} className={styles.capitalize}>{content}</span>
  return content
}

function publicInternalHref(fields: RecordValue): string | undefined {
  if (!isRecord(fields.doc) || typeof fields.doc.relationTo !== 'string' || !isRecord(fields.doc.value)) return undefined
  const document = fields.doc.value
  if (typeof document.slug !== 'string' || document._status !== 'published') return undefined

  let path: string
  switch (fields.doc.relationTo) {
    case 'pages':
      path = document.slug === 'home' ? '/' : `/${encodeURIComponent(document.slug)}`
      break
    case 'posts':
      path = `/journal/${encodeURIComponent(document.slug)}`
      break
    case 'services':
      path = `/services/${encodeURIComponent(document.slug)}`
      break
    case 'events':
      path = `/training/${encodeURIComponent(document.slug)}`
      break
    default:
      return undefined
  }
  return safePublicHref(path)
}

function linkHref(fields: RecordValue): string | undefined {
  return fields.linkType === 'internal'
    ? publicInternalHref(fields)
    : fields.linkType === 'custom'
      ? safePublicHref(fields.url)
      : undefined
}

function linkedContent(content: ReactNode, href: string | undefined, fields: RecordValue, key: string): ReactNode {
  if (!href) return content
  const newTab = fields.newTab === true && /^https:\/\//i.test(href)
  return <a key={key} href={href} className={styles.link} {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{content}</a>
}

function renderLink(node: RecordValue, key: string, embedsEnabled: boolean): ReactNode {
  const fields = blockFields(node)
  const children = renderChildren(childrenOf(node), key, embedsEnabled)
  if (!fields) return children
  return linkedContent(children, linkHref(fields), fields, key)
}

const validCodeLanguages = new Set(['text', 'javascript', 'typescript', 'json', 'css', 'html', 'bash'])

function renderControlledEmbed(fields: RecordValue, key: string, enabled: boolean): ReactNode {
  const provider = fields.provider
  const videoId = fields.videoId
  const caption = recordText(fields.caption).trim()
  const validId = typeof videoId === 'string' && /^[A-Za-z0-9_-]{6,32}$/u.test(videoId)
  if ((provider !== 'youtube' && provider !== 'vimeo') || !validId) {
    return caption ? <p className={styles.embedNote} key={key}>{caption}</p> : null
  }

  const watchUrl = provider === 'youtube'
    ? `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`
    : `https://vimeo.com/${encodeURIComponent(videoId)}`
  const href = safePublicHref(watchUrl)
  if (!enabled || !href) {
    return (
      <p className={styles.embedNote} key={key}>
        {caption && <>{caption} </>}
        <a className={styles.link} href={href ?? watchUrl}>Watch video on {provider === 'youtube' ? 'YouTube' : 'Vimeo'}</a>
      </p>
    )
  }

  const src = provider === 'youtube'
    ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`
    : `https://player.vimeo.com/video/${encodeURIComponent(videoId)}`
  return (
    <figure className={styles.embed} key={key}>
      <div className={styles.embedFrame}>
        <iframe
          src={src}
          title={caption || `Video hosted by ${provider === 'youtube' ? 'YouTube' : 'Vimeo'}`}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          allow="fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  )
}

function renderUpload(node: RecordValue, key: string): ReactNode {
  if (node.relationTo !== 'media' || !mediaValue(node.value) || !node.value || typeof node.value !== 'object') return null
  const fields = isRecord(node.fields) ? node.fields : {}
  return (
    <ResponsiveMedia
      key={key}
      media={node.value}
      sizes="(min-width: 900px) 62ch, calc(100vw - 32px)"
      caption={recordText(fields.caption) || undefined}
      className={styles.image}
    />
  )
}

function renderInlineBlock(fields: RecordValue, key: string, embedsEnabled: boolean): ReactNode {
  switch (fields.blockType) {
    case 'inlineImage': {
      const image = mediaValue(fields.image) ? fields.image : null
      return image && typeof image === 'object'
        ? <ResponsiveMedia key={key} media={image} sizes="(min-width: 900px) 62ch, calc(100vw - 32px)" caption={recordText(fields.caption) || undefined} className={styles.image} />
        : null
    }
    case 'inlinePullQuote': {
      const quote = recordText(fields.quote).trim()
      if (!quote) return null
      const attribution = recordText(fields.attribution).trim()
      return (
        <figure key={key} className={styles.pullQuote}>
          <blockquote><p>{quote}</p></blockquote>
          {attribution && <figcaption>{attribution}</figcaption>}
        </figure>
      )
    }
    case 'inlineCode': {
      const code = recordText(fields.code)
      if (!code) return null
      const language = typeof fields.language === 'string' && validCodeLanguages.has(fields.language)
        ? fields.language
        : 'text'
      return (
        <figure key={key} className={styles.codeFigure}>
          <pre><code className={styles.code} data-language={language}>{code}</code></pre>
          <figcaption className={styles.caption}>{language}</figcaption>
        </figure>
      )
    }
    case 'controlledEmbed':
      return renderControlledEmbed(fields, key, embedsEnabled)
    default:
      return null
  }
}

function renderBlock(node: RecordValue, key: string, embedsEnabled: boolean): ReactNode {
  const fields = blockFields(node)
  if (!fields) return null
  return renderInlineBlock(fields, key, embedsEnabled)
}

function renderNode(value: unknown, key: string, embedsEnabled = false): ReactNode {
  if (!isRecord(value)) return typeof value === 'string' || typeof value === 'number' ? String(value) : null

  const type = nodeType(value)
  switch (type) {
    case 'text':
      return textWithFormats(recordText(value.text), value.format, key)
    case 'paragraph':
      return renderParagraphChildren(childrenOf(value), key, embedsEnabled)
    case 'heading':
      return renderHeading(value, key, embedsEnabled)
    case 'quote':
      return <blockquote className={styles.quote}>{renderChildren(childrenOf(value), key, embedsEnabled)}</blockquote>
    case 'list':
      return renderList(childrenOf(value), recordText(value.listType), key, embedsEnabled, value.start)
    case 'listitem':
      return renderListItem(value, key, false, embedsEnabled)
    case 'link':
    case 'autolink':
      return renderLink(value, key, embedsEnabled)
    case 'linebreak':
      return <br key={key} />
    case 'tab':
      return '    '
    case 'horizontalrule':
      return <hr className={styles.rule} />
    case 'inlineBlock':
    case 'block':
      return renderBlock(value, key, embedsEnabled)
    case 'upload':
      return renderUpload(value, key)
    default:
      return childrenOf(value).length > 0
        ? renderChildren(childrenOf(value), key, embedsEnabled)
        : recordText(value.text) || null
  }
}

function renderHeading(node: RecordValue, key: string, embedsEnabled: boolean): ReactNode {
  const tag = typeof node.tag === 'string' && /^h[1-6]$/u.test(node.tag) ? node.tag : 'h2'
  const safeTag = tag === 'h1' ? 'h2' : tag
  const headingClass = safeTag === 'h2' || safeTag === 'h3' ? styles.heading : styles.minorHeading
  const parts = childrenOf(node).flatMap((child, index) => splitParagraphNode(child, `${key}-${index}`, embedsEnabled))
  const output: ReactNode[] = []
  let inline: ReactNode[] = []
  let segment = 0
  const flush = () => {
    if (inline.length > 0) {
      output.push(
        <Fragment key={`${key}-heading-${segment++}`}>
          {createHeading(safeTag, headingClass, inline)}
        </Fragment>,
      )
      inline = []
    }
  }

  parts.forEach((part) => {
    if (part.block) {
      flush()
      if (part.content) output.push(<Fragment key={`${key}-block-${segment++}`}>{part.content}</Fragment>)
    } else {
      inline.push(part.content)
    }
  })
  flush()
  return output
}

function createHeading(tag: string, className: string, children: ReactNode): ReactNode {
  if (tag === 'h2') return <h2 className={className}>{children}</h2>
  if (tag === 'h3') return <h3 className={className}>{children}</h3>
  if (tag === 'h4') return <h4 className={className}>{children}</h4>
  if (tag === 'h5') return <h5 className={className}>{children}</h5>
  if (tag === 'h6') return <h6 className={className}>{children}</h6>
  return <h2 className={className}>{children}</h2>
}

function renderChildren(children: unknown[], key: string, embedsEnabled = false): ReactNode {
  return children.map((child, index) => (
    <Fragment key={`${key}-${index}`}>{renderNode(child, `${key}-${index}`, embedsEnabled)}</Fragment>
  ))
}

export function RichText({ data, externalEmbedsEnabled = false }: RichTextProps) {
  if (!isRecord(data) || !isRecord(data.root) || !Array.isArray(data.root.children)) return null
  const rendered = data.root.children.map((child, index) => {
    const key = `rich-${index}`
    return <Fragment key={key}>{renderNode(child, key, externalEmbedsEnabled)}</Fragment>
  })
  return <div className={styles.richText}>{rendered}</div>
}
