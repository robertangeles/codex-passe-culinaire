import { safePublicHref } from './urls'

export type SeoPreviewValues = {
  title?: unknown
  metaTitle?: unknown
  metaDescription?: unknown
  excerpt?: unknown
  oneLiner?: unknown
  descriptionSummary?: unknown
  slug?: unknown
  noIndex?: unknown
  canonicalUrl?: unknown
}

export type SeoPreview = {
  title: string
  description: string
  titleLength: number
  descriptionLength: number
  titleMissing: boolean
  descriptionMissing: boolean
  titleOverLimit: boolean
  descriptionOverLimit: boolean
  noIndex: boolean
}

const textValue = (value: unknown): string => typeof value === 'string' ? value : ''

/** Mirrors the title and description fallback order used by validatePublication. */
export function buildSeoPreview(values: SeoPreviewValues): SeoPreview {
  const title = textValue(values.metaTitle || values.title).trim()
  const description = textValue(values.metaDescription || values.excerpt || values.oneLiner || values.descriptionSummary).trim()

  return {
    title,
    description,
    titleLength: title.length,
    descriptionLength: description.length,
    titleMissing: title.length === 0,
    descriptionMissing: description.length === 0,
    titleOverLimit: title.length > 60,
    descriptionOverLimit: description.length > 160,
    noIndex: values.noIndex === true,
  }
}

/** Uses a valid HTTPS override first, otherwise builds a preview from known routes only. */
export function buildCanonicalPreview(publicOrigin: string | undefined, collection: string | undefined, slugValue: unknown, canonicalValue?: unknown): string | undefined {
  const safeOverride = safePublicHref(canonicalValue)
  if (safeOverride) {
    try {
      const override = new URL(safeOverride)
      if (override.protocol === 'https:' && override.hostname && !override.username && !override.password) return override.href
    } catch {
      // An invalid override falls back to the generated public address.
    }
  }
  if (!publicOrigin || !collection || typeof slugValue !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slugValue)) return undefined

  let origin: URL
  try {
    origin = new URL(publicOrigin)
  } catch {
    return undefined
  }
  if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) return undefined

  switch (collection) {
    case 'pages': return `${origin.origin}${slugValue === 'home' ? '/' : `/${slugValue}`}`
    case 'posts': return `${origin.origin}/journal/${slugValue}`
    case 'services': return `${origin.origin}/services/${slugValue}`
    case 'events': return `${origin.origin}/training/${slugValue}`
    default: return undefined
  }
}
