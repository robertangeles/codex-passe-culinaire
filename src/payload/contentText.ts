import type { CollectionBeforeChangeHook } from 'payload'

function lexicalText(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(lexicalText)
  if (!value || typeof value !== 'object') return []
  const record = value as Record<string, unknown>
  const own = typeof record.text === 'string' ? [record.text] : []
  const children = lexicalText(record.children)
  const root = lexicalText(record.root)
  const fields = record.fields && typeof record.fields === 'object' ? record.fields as Record<string, unknown> : null
  const inline = fields ? [fields.quote, fields.caption, fields.code].filter((item): item is string => typeof item === 'string') : []
  return [...own, ...children, ...root, ...inline]
}

export function visibleContentText(kind: 'pages' | 'posts', content: Record<string, unknown>): string {
  const parts: string[] = []
  if (typeof content.title === 'string') parts.push(content.title)
  if (kind === 'posts') {
    if (typeof content.excerpt === 'string') parts.push(content.excerpt)
    parts.push(...lexicalText(content.body))
  } else if (Array.isArray(content.layout)) {
    for (const block of content.layout) {
      if (!block || typeof block !== 'object') continue
      const item = block as Record<string, unknown>
      for (const key of ['heading', 'eyebrow', 'summary', 'statement', 'quote', 'attribution', 'name', 'title', 'caption']) {
        if (typeof item[key] === 'string') parts.push(item[key])
      }
      parts.push(...lexicalText(item.body))
      parts.push(...lexicalText(item.bio))
      if (Array.isArray(item.images)) for (const row of item.images) {
        if (row && typeof row === 'object' && 'caption' in row && typeof row.caption === 'string') parts.push(row.caption)
      }
      if (Array.isArray(item.items)) for (const row of item.items) {
        if (row && typeof row === 'object') {
          const entry = row as Record<string, unknown>
          if (typeof entry.question === 'string') parts.push(entry.question)
          parts.push(...lexicalText(entry.answer))
        }
      }
    }
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

export const deriveContentText: CollectionBeforeChangeHook = ({ collection, data, originalDoc }) => {
  if (collection.slug !== 'pages' && collection.slug !== 'posts') return data
  const next = { ...originalDoc, ...data }
  const searchText = visibleContentText(collection.slug, next)
  data.searchText = searchText
  if (collection.slug === 'posts') data.readingTime = Math.max(1, Math.ceil(searchText.split(/\s+/).filter(Boolean).length / 200))
  return data
}
