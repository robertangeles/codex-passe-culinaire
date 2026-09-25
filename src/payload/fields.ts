import { ValidationError, type Field, type CollectionBeforeValidateHook } from 'payload'

export const reservedSlugs = new Set([
  'admin', 'api', 'about', 'contact', 'culinaire-kitchen', 'services', 'training',
  'journal', 'search', 'media', 'feed.xml', 'feed.json', 'sitemap.xml',
  'robots.txt', 'llms.txt', 'llms-full.txt',
])

export const validateSlugValue = (value: unknown, allowReserved = false): true | string => {
    if (typeof value !== 'string' || value.length > 200 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value))
      return 'Use up to 200 lowercase letters, numbers and hyphens.'
    if (value.endsWith('.md') || (reservedSlugs.has(value) && !(allowReserved && ['home', 'about', 'contact', 'culinaire-kitchen'].includes(value))))
      return 'This address is reserved.'
    return true
}

export const slugField = (allowReserved = false): Field => ({
  name: 'slug', type: 'text', unique: true, index: true, required: true, maxLength: 200,
  validate: (value: unknown) => validateSlugValue(value, allowReserved),
})

export const validateSlugOnSave = (allowReserved = false): CollectionBeforeValidateHook => ({ data, collection, req }) => {
  if (data?.slug == null || data.slug === '') return data
  const result = validateSlugValue(data.slug, allowReserved)
  if (result !== true) throw new ValidationError({ collection: collection.slug, errors: [{ path: 'slug', message: result }], req })
  return data
}

export const seoFields = (defaultPriority: string): Field => ({
  name: 'seo', type: 'group', label: 'SEO', admin: { description: 'Search preview uses the page title and description when overrides are blank.' },
  fields: [
    { name: 'metaTitle', type: 'text', maxLength: 60 },
    { name: 'metaDescription', type: 'textarea', maxLength: 160 },
    { name: 'canonicalUrl', type: 'text', validate: (value: unknown) => !value || (typeof value === 'string' && /^https:\/\//.test(value)) || 'Use an HTTPS URL.' },
    { name: 'ogImage', type: 'upload', relationTo: 'media' },
    { name: 'noIndex', type: 'checkbox', defaultValue: false },
    { name: 'noFollow', type: 'checkbox', defaultValue: false },
    { name: 'excludeFromSitemap', type: 'checkbox', defaultValue: false },
    { name: 'sitemapPriority', type: 'select', defaultValue: defaultPriority, options: Array.from({ length: 10 }, (_, i) => ({ label: ((i + 1) / 10).toFixed(1), value: ((i + 1) / 10).toFixed(1) })) },
    { name: 'sitemapChangeFrequency', type: 'select', defaultValue: defaultPriority === '0.5' ? 'weekly' : 'monthly', options: ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'] },
    { name: 'structuredDataOverride', type: 'json' },
  ],
})

const fixedSchemaKeys = new Set([
  '@context', '@id', '@type', '__proto__', 'constructor', 'prototype',
  'provider', 'organizer', 'performer', 'author', 'publisher', 'reviewer',
  'mainEntityOfPage', 'isPartOf', 'breadcrumb', 'offers',
])

/** Additive JSON-LD properties only; generated entity identity and links remain authoritative. */
export function validStructuredDataOverride(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  if (JSON.stringify(value).length > 8192) return false
  let members = 0
  const visit = (node: unknown, depth: number): boolean => {
    if (depth > 4) return false
    if (node === null || typeof node === 'boolean' || typeof node === 'number') return true
    if (typeof node === 'string') return node.length <= 1000 && !/[<>]/.test(node)
    if (Array.isArray(node)) return node.length <= 30 && node.every((child) => visit(child, depth + 1))
    if (typeof node !== 'object') return false
    for (const [key, child] of Object.entries(node)) {
      members += 1
      if (members > 50 || key.startsWith('@') || fixedSchemaKeys.has(key) || !/^[A-Za-z][A-Za-z0-9_]*$/.test(key) || !visit(child, depth + 1)) return false
    }
    return true
  }
  return visit(value, 0)
}

export const validatePublication: CollectionBeforeValidateHook = ({ data, originalDoc, collection, req }) => {
  const next = { ...originalDoc, ...data }
  if (next._status !== 'published') return data
  const seo = { ...(originalDoc?.seo || {}), ...(data?.seo || {}) }
  const title = String(seo.metaTitle || next.title || '').trim()
  const description = String(seo.metaDescription || next.excerpt || next.oneLiner || next.descriptionSummary || '').trim()
  const errors: { path: string; message: string }[] = []
  if (!title || title.length > 60) errors.push({ path: seo.metaTitle ? 'seo.metaTitle' : 'title', message: 'Use a search title of 60 characters or fewer.' })
  if (!description || description.length > 160) errors.push({ path: 'seo.metaDescription', message: 'Add a search description of 160 characters or fewer.' })
  if (collection.slug === 'posts' && !String(next.excerpt || '').trim()) errors.push({ path: 'excerpt', message: 'Add a journal excerpt before publishing.' })
  if (seo.structuredDataOverride != null && !validStructuredDataOverride(seo.structuredDataOverride))
    errors.push({ path: 'seo.structuredDataOverride', message: 'Use a small plain JSON object without schema IDs, types or entity links.' })
  if (errors.length) throw new ValidationError({ collection: collection.slug, errors, req })
  return data
}
